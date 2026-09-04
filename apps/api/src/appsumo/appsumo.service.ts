import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { createHash } from 'node:crypto';

import { Prisma } from '../generated/prisma/client';

import type { AppSumoTier } from '../generated/prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import type { TenantContext } from '../auth/types/tenant-context.type';

import { getAppSumoEntitlements } from '../subscriptions/constants/appsumo-entitlements';

import { RedeemAppSumoCodeDto } from './dto/redeem-appsumo-code.dto';

const APP_SUMO_TIER_RANK: Record<AppSumoTier, number> = {
  TIER_1: 1,
  TIER_2: 2,
  TIER_3: 3,
};

const APP_SUMO_SUBSCRIPTION_SELECT = {
  status: true,
  source: true,
  accessType: true,
  appSumoTier: true,
  appSumoActivatedAt: true,
  cancelledAt: true,
} satisfies Prisma.SubscriptionSelect;

type AppSumoSubscriptionResult = Prisma.SubscriptionGetPayload<{
  select: typeof APP_SUMO_SUBSCRIPTION_SELECT;
}>;

type AppSumoTerminationStatus = 'REVOKED' | 'REFUNDED';

@Injectable()
export class AppSumoService {
  constructor(
    private readonly prisma: PrismaService,

    private readonly configService: ConfigService,
  ) {}

  async redeem(tenant: TenantContext, dto: RedeemAppSumoCodeDto) {
    this.ensureAvailable();

    const normalizedCode = this.normalizeCode(dto.code);

    const codeHash = this.hashCode(normalizedCode);

    const now = new Date();

    const result = await this.prisma.$transaction(
      async (tx) => {
        const appSumoCode = await tx.appSumoCode.findUnique({
          where: {
            codeHash,
          },

          select: {
            id: true,
            tier: true,
            status: true,
            organizationId: true,
            expiresAt: true,
            redeemedAt: true,
          },
        });

        if (!appSumoCode) {
          throw new BadRequestException('Invalid AppSumo redemption code.');
        }

        /*
         * Make repeated requests using the
         * same code and workspace idempotent.
         */
        if (appSumoCode.status === 'REDEEMED') {
          if (appSumoCode.organizationId !== tenant.organizationId) {
            throw new BadRequestException(
              'This AppSumo code has already been redeemed.',
            );
          }

          const existingSubscription = await tx.subscription.findUnique({
            where: {
              organizationId: tenant.organizationId,
            },

            select: {
              plan: true,
              status: true,
              source: true,
              accessType: true,
              appSumoTier: true,
              appSumoActivatedAt: true,
            },
          });

          if (
            !existingSubscription ||
            existingSubscription.source !== 'APPSUMO' ||
            existingSubscription.accessType !== 'LIFETIME' ||
            !existingSubscription.appSumoTier
          ) {
            throw new BadRequestException(
              'The redeemed AppSumo subscription could not be found.',
            );
          }

          return {
            alreadyRedeemed: true,

            tier: existingSubscription.appSumoTier,

            subscription: existingSubscription,
          };
        }

        if (appSumoCode.status !== 'AVAILABLE') {
          throw new BadRequestException(
            'This AppSumo code is no longer available.',
          );
        }

        if (appSumoCode.expiresAt && appSumoCode.expiresAt <= now) {
          throw new BadRequestException('This AppSumo code has expired.');
        }

        const currentSubscription = await tx.subscription.findUnique({
          where: {
            organizationId: tenant.organizationId,
          },

          select: {
            source: true,
            accessType: true,
            status: true,
            appSumoTier: true,
            appSumoActivatedAt: true,
          },
        });

        /*
         * A second code may only upgrade
         * an existing lifetime license.
         *
         * It must never downgrade or consume
         * another code unnecessarily.
         */
        if (
          currentSubscription?.source === 'APPSUMO' &&
          currentSubscription.accessType === 'LIFETIME' &&
          currentSubscription.appSumoTier
        ) {
          const currentRank =
            APP_SUMO_TIER_RANK[currentSubscription.appSumoTier];

          const requestedRank = APP_SUMO_TIER_RANK[appSumoCode.tier];

          if (requestedRank <= currentRank) {
            throw new BadRequestException(
              `This workspace already has ${currentSubscription.appSumoTier.replace(
                '_',
                ' ',
              )} or higher.`,
            );
          }
        }

        /*
         * Atomically claim the code.
         *
         * Only one concurrent request can
         * change AVAILABLE to REDEEMED.
         */
        const claimed = await tx.appSumoCode.updateMany({
          where: {
            id: appSumoCode.id,

            status: 'AVAILABLE',

            organizationId: null,
          },

          data: {
            status: 'REDEEMED',

            organizationId: tenant.organizationId,

            redeemedAt: now,
          },
        });

        if (claimed.count !== 1) {
          throw new BadRequestException(
            'This AppSumo code has already been redeemed.',
          );
        }

        const activatedAt = currentSubscription?.appSumoActivatedAt ?? now;

        /*
         * Pending recurring checkouts must
         * no longer modify a workspace after
         * lifetime access is activated.
         */
        await tx.subscriptionPayment.updateMany({
          where: {
            organizationId: tenant.organizationId,

            status: 'PENDING',
          },

          data: {
            status: 'CANCELLED',

            cancelledAt: now,
          },
        });

        /*
         * Existing trial/recurring subscription
         * is converted into lifetime access.
         *
         * Trial dates are retained as historical
         * fields because they are required by
         * the current schema.
         */
        const subscription = await tx.subscription.upsert({
          where: {
            organizationId: tenant.organizationId,
          },

          create: {
            organizationId: tenant.organizationId,

            plan: 'STANDARD',

            status: 'ACTIVE',

            source: 'APPSUMO',

            accessType: 'LIFETIME',

            appSumoTier: appSumoCode.tier,

            appSumoActivatedAt: activatedAt,

            trialStartedAt: now,

            trialEndsAt: now,

            currentPeriodStart: null,

            currentPeriodEnd: null,

            cancelAtPeriodEnd: false,

            cancelledAt: null,
          },

          update: {
            plan: 'STANDARD',

            status: 'ACTIVE',

            source: 'APPSUMO',

            accessType: 'LIFETIME',

            appSumoTier: appSumoCode.tier,

            appSumoActivatedAt: activatedAt,

            currentPeriodStart: null,

            currentPeriodEnd: null,

            cancelAtPeriodEnd: false,

            cancelledAt: null,
          },

          select: {
            plan: true,
            status: true,
            source: true,
            accessType: true,
            appSumoTier: true,
            appSumoActivatedAt: true,
          },
        });

        return {
          alreadyRedeemed: false,

          tier: appSumoCode.tier,

          subscription,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    return {
      message: result.alreadyRedeemed
        ? 'This AppSumo code is already active for your workspace.'
        : 'AppSumo lifetime access activated successfully.',

      redeemed: true,

      alreadyRedeemed: result.alreadyRedeemed,

      subscription: result.subscription,

      entitlements: getAppSumoEntitlements(result.tier),
    };
  }

  private normalizeCode(code: string) {
    return code.trim().toUpperCase();
  }

  private hashCode(code: string) {
    return createHash('sha256').update(code, 'utf8').digest('hex');
  }

  private ensureAvailable() {
    const subscriptionEnabled =
      this.configService
        .get<string>('SUBSCRIPTION_ENABLED')
        ?.trim()
        .toLowerCase() !== 'false';

    const appSumoEnabled =
      this.configService
        .get<string>('APPSUMO_ENABLED')
        ?.trim()
        .toLowerCase() === 'true';

    /*
     * Self-hosted installations and
     * deployments that did not explicitly
     * enable AppSumo cannot use this endpoint.
     */
    if (!subscriptionEnabled || !appSumoEnabled) {
      throw new NotFoundException('AppSumo redemption is not available.');
    }
  }

  async deactivateCode(
    rawCode: string,
    targetStatus: AppSumoTerminationStatus,
  ) {
    const normalizedCode = this.normalizeCode(rawCode);

    const codeHash = this.hashCode(normalizedCode);

    const now = new Date();

    const result = await this.prisma.$transaction(
      async (tx) => {
        const appSumoCode = await tx.appSumoCode.findUnique({
          where: {
            codeHash,
          },

          select: {
            id: true,
            codeHint: true,
            tier: true,
            status: true,
            organizationId: true,
            revokedAt: true,
            refundedAt: true,
          },
        });

        if (!appSumoCode) {
          throw new NotFoundException('AppSumo code not found.');
        }

        /*
         * Repeated requests with the same
         * action are idempotent.
         */
        if (appSumoCode.status === targetStatus) {
          const subscription = appSumoCode.organizationId
            ? await tx.subscription.findUnique({
                where: {
                  organizationId: appSumoCode.organizationId,
                },

                select: {
                  status: true,
                  source: true,
                  accessType: true,
                  appSumoTier: true,
                  appSumoActivatedAt: true,
                  cancelledAt: true,
                },
              })
            : null;

          return {
            alreadyProcessed: true,
            codeHint: appSumoCode.codeHint,
            codeStatus: appSumoCode.status,
            organizationId: appSumoCode.organizationId,
            subscription,
          };
        }

        /*
         * Allowed transitions:
         *
         * AVAILABLE -> REVOKED/REFUNDED
         * REDEEMED  -> REVOKED/REFUNDED
         * REVOKED   -> REFUNDED
         *
         * REFUNDED is final.
         */
        const transitionAllowed =
          appSumoCode.status === 'AVAILABLE' ||
          appSumoCode.status === 'REDEEMED' ||
          (appSumoCode.status === 'REVOKED' && targetStatus === 'REFUNDED');

        if (!transitionAllowed) {
          throw new BadRequestException(
            `AppSumo code cannot move from ${appSumoCode.status} to ${targetStatus}.`,
          );
        }

        const updatedCode = await tx.appSumoCode.updateMany({
          where: {
            id: appSumoCode.id,
            status: appSumoCode.status,
          },

          data: {
            status: targetStatus,

            ...(targetStatus === 'REVOKED'
              ? {
                  revokedAt: now,
                }
              : {
                  refundedAt: now,
                }),
          },
        });

        if (updatedCode.count !== 1) {
          throw new BadRequestException(
            'The AppSumo code changed while this request was being processed.',
          );
        }

        /*
         * AVAILABLE codes have no workspace
         * subscription to modify.
         */
        if (!appSumoCode.organizationId) {
          return {
            alreadyProcessed: false,
            codeHint: appSumoCode.codeHint,
            codeStatus: targetStatus,
            organizationId: null,
            subscription: null,
          };
        }

        /*
         * Find every other valid code currently
         * redeemed by the same workspace.
         */
        const remainingCodes = await tx.appSumoCode.findMany({
          where: {
            organizationId: appSumoCode.organizationId,

            status: 'REDEEMED',
          },

          select: {
            tier: true,
          },
        });

        const fallbackTier = remainingCodes.reduce<AppSumoTier | null>(
          (highestTier, code) => {
            if (!highestTier) {
              return code.tier;
            }

            return APP_SUMO_TIER_RANK[code.tier] >
              APP_SUMO_TIER_RANK[highestTier]
              ? code.tier
              : highestTier;
          },
          null,
        );

        const currentSubscription = await tx.subscription.findUnique({
          where: {
            organizationId: appSumoCode.organizationId,
          },

          select: {
            source: true,
            accessType: true,
          },
        });

        let subscription: AppSumoSubscriptionResult | null = null;

        /*
         * Never overwrite a workspace that has
         * already moved back to direct billing.
         */
        if (
          currentSubscription?.source === 'APPSUMO' &&
          currentSubscription.accessType === 'LIFETIME'
        ) {
          if (fallbackTier) {
            /*
             * Example:
             *
             * Tier 1 remains redeemed.
             * Tier 3 is refunded.
             * Workspace falls back to Tier 1.
             */
            subscription = await tx.subscription.update({
              where: {
                organizationId: appSumoCode.organizationId,
              },

              data: {
                status: 'ACTIVE',

                appSumoTier: fallbackTier,

                currentPeriodStart: null,

                currentPeriodEnd: null,

                cancelAtPeriodEnd: false,

                cancelledAt: null,
              },

              select: APP_SUMO_SUBSCRIPTION_SELECT,
            });
          } else {
            /*
             * No redeemed AppSumo code remains.
             *
             * Remove AppSumo lifetime access and
             * return the workspace to recurring
             * billing in an expired/read-only state.
             */
            subscription = await tx.subscription.update({
              where: {
                organizationId: appSumoCode.organizationId,
              },

              data: {
                status: 'EXPIRED',

                source: 'DIRECT',

                accessType: 'RECURRING',

                appSumoTier: null,

                appSumoActivatedAt: null,

                currentPeriodStart: null,

                currentPeriodEnd: null,

                cancelAtPeriodEnd: false,

                cancelledAt: now,
              },

              select: APP_SUMO_SUBSCRIPTION_SELECT,
            });
          }
        }

        return {
          alreadyProcessed: false,
          codeHint: appSumoCode.codeHint,
          codeStatus: targetStatus,
          organizationId: appSumoCode.organizationId,
          subscription,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    return {
      message: result.alreadyProcessed
        ? `This AppSumo code is already ${result.codeStatus.toLowerCase()}.`
        : `AppSumo code marked as ${result.codeStatus.toLowerCase()} successfully.`,

      ...result,
    };
  }
}
