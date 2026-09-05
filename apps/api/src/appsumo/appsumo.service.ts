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

const APP_SUMO_MAX_STACK_UNITS = 3;

const APP_SUMO_TIER_RANK: Record<AppSumoTier, number> = {
  TIER_1: 1,
  TIER_2: 2,
  TIER_3: 3,
};

const APP_SUMO_SUBSCRIPTION_SELECT = {
  plan: true,
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

type AppSumoStackCode = {
  tier: AppSumoTier;
};

function getStackUnits(codes: readonly AppSumoStackCode[]) {
  return codes.reduce(
    (total, code) => total + APP_SUMO_TIER_RANK[code.tier],
    0,
  );
}

function getTierFromStackUnits(stackUnits: number): AppSumoTier | null {
  if (stackUnits >= 3) {
    return 'TIER_3';
  }

  if (stackUnits === 2) {
    return 'TIER_2';
  }

  if (stackUnits === 1) {
    return 'TIER_1';
  }

  return null;
}

function formatTier(tier: AppSumoTier) {
  return tier.replace('_', ' ');
}

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

    const result = await this.runSerializable(async (tx) => {
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
       * Repeated requests using the same
       * code and workspace are idempotent.
       */
      if (appSumoCode.status === 'REDEEMED') {
        if (appSumoCode.organizationId !== tenant.organizationId) {
          throw new BadRequestException(
            'This AppSumo code has already been redeemed.',
          );
        }

        const [existingSubscription, redeemedCodes] = await Promise.all([
          tx.subscription.findUnique({
            where: {
              organizationId: tenant.organizationId,
            },

            select: APP_SUMO_SUBSCRIPTION_SELECT,
          }),

          tx.appSumoCode.findMany({
            where: {
              organizationId: tenant.organizationId,
              status: 'REDEEMED',
            },

            select: {
              tier: true,
            },
          }),
        ]);

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
          redeemedCodeCount: redeemedCodes.length,
          stackUnits: Math.min(
            APP_SUMO_MAX_STACK_UNITS,
            getStackUnits(redeemedCodes),
          ),
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

      const [currentSubscription, redeemedCodes] = await Promise.all([
        tx.subscription.findUnique({
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
        }),

        tx.appSumoCode.findMany({
          where: {
            organizationId: tenant.organizationId,
            status: 'REDEEMED',
          },

          select: {
            tier: true,
          },
        }),
      ]);

      const currentStackUnits = getStackUnits(redeemedCodes);

      if (currentStackUnits >= APP_SUMO_MAX_STACK_UNITS) {
        throw new BadRequestException(
          'This workspace already has the maximum AppSumo Tier 3 access.',
        );
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

      /*
       * New AppSumo codes are generated as
       * TIER_1 and therefore add one unit.
       *
       * Existing TIER_2/TIER_3 test codes
       * retain their old two/three-unit value
       * for backward compatibility.
       */
      const stackUnits = Math.min(
        APP_SUMO_MAX_STACK_UNITS,
        currentStackUnits + APP_SUMO_TIER_RANK[appSumoCode.tier],
      );

      const tier = getTierFromStackUnits(stackUnits);

      if (!tier) {
        throw new BadRequestException(
          'Unable to determine the AppSumo subscription tier.',
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
          appSumoTier: tier,
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
          appSumoTier: tier,
          appSumoActivatedAt: activatedAt,
          currentPeriodStart: null,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
          cancelledAt: null,
        },

        select: APP_SUMO_SUBSCRIPTION_SELECT,
      });

      return {
        alreadyRedeemed: false,
        tier,
        redeemedCodeCount: redeemedCodes.length + 1,
        stackUnits,
        subscription,
      };
    });

    return {
      message: result.alreadyRedeemed
        ? 'This AppSumo code is already active for your workspace.'
        : `AppSumo code redeemed successfully. Your workspace now has ${formatTier(
            result.tier,
          )} lifetime access.`,

      redeemed: true,
      alreadyRedeemed: result.alreadyRedeemed,
      redeemedCodeCount: result.redeemedCodeCount,
      stackUnits: result.stackUnits,
      maxStackUnits: APP_SUMO_MAX_STACK_UNITS,
      subscription: result.subscription,
      entitlements: getAppSumoEntitlements(result.tier),
    };
  }

  async deactivateCode(
    rawCode: string,
    targetStatus: AppSumoTerminationStatus,
  ) {
    const normalizedCode = this.normalizeCode(rawCode);

    const codeHash = this.hashCode(normalizedCode);

    const now = new Date();

    const result = await this.runSerializable(async (tx) => {
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
        let subscription: AppSumoSubscriptionResult | null = null;

        let remainingCodes: AppSumoStackCode[] = [];

        if (appSumoCode.organizationId) {
          [subscription, remainingCodes] = await Promise.all([
            tx.subscription.findUnique({
              where: {
                organizationId: appSumoCode.organizationId,
              },

              select: APP_SUMO_SUBSCRIPTION_SELECT,
            }),

            tx.appSumoCode.findMany({
              where: {
                organizationId: appSumoCode.organizationId,
                status: 'REDEEMED',
              },

              select: {
                tier: true,
              },
            }),
          ]);
        }

        const stackUnits = Math.min(
          APP_SUMO_MAX_STACK_UNITS,
          getStackUnits(remainingCodes),
        );

        return {
          alreadyProcessed: true,
          codeHint: appSumoCode.codeHint,
          codeStatus: appSumoCode.status,
          organizationId: appSumoCode.organizationId,
          redeemedCodeCount: remainingCodes.length,
          stackUnits,
          tier: getTierFromStackUnits(stackUnits),
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
          redeemedCodeCount: 0,
          stackUnits: 0,
          tier: null,
          subscription: null,
        };
      }

      /*
       * Recalculate the tier from every
       * code that remains redeemed by the
       * same workspace.
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

      const stackUnits = Math.min(
        APP_SUMO_MAX_STACK_UNITS,
        getStackUnits(remainingCodes),
      );

      const fallbackTier = getTierFromStackUnits(stackUnits);

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
           * One removed code means one lower
           * tier for the new one-unit codes.
           * Legacy tier-valued codes keep their
           * original value during recalculation.
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
        redeemedCodeCount: remainingCodes.length,
        stackUnits,
        tier: fallbackTier,
        subscription,
      };
    });

    return {
      message: result.alreadyProcessed
        ? `This AppSumo code is already ${result.codeStatus.toLowerCase()}.`
        : `AppSumo code marked as ${result.codeStatus.toLowerCase()} successfully.`,

      ...result,
      maxStackUnits: APP_SUMO_MAX_STACK_UNITS,
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

  private async runSerializable<T>(
    operation: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    const maxAttempts = 3;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      try {
        return await this.prisma.$transaction(operation, {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        });
      } catch (error) {
        const shouldRetry =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2034' &&
          attempt < maxAttempts - 1;

        if (shouldRetry) {
          continue;
        }

        throw error;
      }
    }

    throw new Error('Unable to complete the AppSumo transaction.');
  }
}
