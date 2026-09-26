import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { createHash } from 'node:crypto';

import { Prisma } from '../generated/prisma/client';
import { DealifyCodeStatus } from '../generated/prisma/enums';

import { PrismaService } from '../prisma/prisma.service';

import type { TenantContext } from '../auth/types/tenant-context.type';

import { RedeemDealifyCodeDto } from './dto/redeem-dealify-code.dto';

import { getDealifyEntitlements } from '../subscriptions/constants/dealify-entitlements';

@Injectable()
export class DealifyService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeCode(rawCode: string) {
    return rawCode.trim().toUpperCase();
  }

  private hashCode(normalizedCode: string) {
    return createHash('sha256').update(normalizedCode, 'utf8').digest('hex');
  }

  private async claimCode(
    tx: Prisma.TransactionClient,
    rawCode: string,
    organizationId: string,
  ) {
    const normalizedCode = this.normalizeCode(rawCode);

    if (!normalizedCode) {
      throw new BadRequestException('Dealify code is required.');
    }

    const codeHash = this.hashCode(normalizedCode);

    const code = await tx.dealifyCode.findUnique({
      where: {
        codeHash,
      },
    });

    if (!code) {
      throw new BadRequestException('Invalid Dealify code.');
    }

    /*
     * Idempotent redemption:
     * If this exact code already belongs to this organization,
     * allow the request to return the existing activation.
     */
    if (code.status === DealifyCodeStatus.REDEEMED) {
      if (code.organizationId === organizationId) {
        return {
          code,
          alreadyRedeemed: true,
        };
      }

      throw new BadRequestException(
        'This Dealify code has already been redeemed.',
      );
    }

    if (code.status !== DealifyCodeStatus.AVAILABLE) {
      throw new BadRequestException(
        'This Dealify code is no longer available.',
      );
    }

    /*
     * Atomically claim the code.
     *
     * This protects us from two requests trying to redeem
     * the same code at almost exactly the same time.
     */
    const claimed = await tx.dealifyCode.updateMany({
      where: {
        id: code.id,
        status: DealifyCodeStatus.AVAILABLE,
        organizationId: null,
      },
      data: {
        status: DealifyCodeStatus.REDEEMED,
        organizationId,
        redeemedAt: new Date(),
      },
    });

    if (claimed.count !== 1) {
      throw new ConflictException(
        'This Dealify code was redeemed by another request.',
      );
    }

    return {
      code,
      alreadyRedeemed: false,
    };
  }

  /**
   * Used by the normal QUFO registration flow.
   *
   * IMPORTANT:
   * This method does NOT create its own transaction.
   * It receives the transaction already opened by AuthService
   * so user + organization + subscription + Dealify code
   * all succeed or all roll back together.
   */
  async activateForRegistration(
    tx: Prisma.TransactionClient,
    organizationId: string,
    rawCode: string,
  ) {
    const result = await this.claimCode(tx, rawCode, organizationId);

    if (result.alreadyRedeemed) {
      throw new BadRequestException(
        'This Dealify code has already been redeemed for this workspace.',
      );
    }

    const subscription = await tx.subscription.findUnique({
      where: {
        organizationId,
      },
    });

    if (!subscription) {
      throw new NotFoundException(
        'Subscription was not found for this workspace.',
      );
    }

    const now = new Date();

    const updatedSubscription = await tx.subscription.update({
      where: {
        organizationId,
      },
      data: {
        plan: 'STANDARD',
        status: 'ACTIVE',
        source: 'DEALIFY',
        accessType: 'LIFETIME',

        dealifyTier: result.code.tier,
        dealifyActivatedAt: now,

        currentPeriodStart: null,
        currentPeriodEnd: null,

        cancelAtPeriodEnd: false,
        cancelledAt: null,
      },
    });

    return {
      tier: result.code.tier,
      activatedAt: now,
      subscription: updatedSubscription,
      entitlements: getDealifyEntitlements(result.code.tier),
    };
  }

  /**
   * Redeem a Dealify code for an existing QUFO workspace.
   */
  async redeem(tenant: TenantContext, dto: RedeemDealifyCodeDto) {
    const organizationId = tenant.organizationId;

    return this.prisma.$transaction(
      async (tx) => {
        /*
         * First inspect the current subscription.
         */
        const subscription = await tx.subscription.findUnique({
          where: {
            organizationId,
          },
        });

        if (!subscription) {
          throw new NotFoundException(
            'Subscription was not found for this workspace.',
          );
        }

        /*
         * If the workspace already has lifetime access,
         * do not allow another Dealify lifetime activation.
         */
        if (
          subscription.status === 'ACTIVE' &&
          subscription.accessType === 'LIFETIME'
        ) {
          throw new BadRequestException(
            'This workspace already has an active lifetime subscription.',
          );
        }

        /*
         * Do not silently replace an active recurring subscription.
         *
         * We can handle subscription conversion separately later
         * once that billing flow is explicitly defined.
         */
        if (
          subscription.status === 'ACTIVE' &&
          subscription.accessType === 'RECURRING'
        ) {
          throw new BadRequestException(
            'Please cancel your current recurring subscription before redeeming a Dealify lifetime code.',
          );
        }

        const result = await this.claimCode(tx, dto.code, organizationId);

        /*
         * The same organization can safely retry the same code.
         */
        if (result.alreadyRedeemed) {
          return {
            message: 'Dealify code has already been redeemed.',
            alreadyRedeemed: true,
            tier: result.code.tier,
            subscription,
            entitlements: getDealifyEntitlements(result.code.tier),
          };
        }

        const now = new Date();

        const updatedSubscription = await tx.subscription.update({
          where: {
            organizationId,
          },
          data: {
            plan: 'STANDARD',
            status: 'ACTIVE',
            source: 'DEALIFY',
            accessType: 'LIFETIME',

            dealifyTier: result.code.tier,
            dealifyActivatedAt: now,

            currentPeriodStart: null,
            currentPeriodEnd: null,

            cancelAtPeriodEnd: false,
            cancelledAt: null,
          },
        });

        return {
          message: 'Dealify code redeemed successfully.',
          alreadyRedeemed: false,
          tier: result.code.tier,
          activatedAt: now,
          subscription: updatedSubscription,
          entitlements: getDealifyEntitlements(result.code.tier),
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }

  async deactivateCode(rawCode: string, targetStatus: 'REVOKED' | 'REFUNDED') {
    const normalizedCode = this.normalizeCode(rawCode);

    if (!normalizedCode) {
      throw new BadRequestException('Dealify code is required.');
    }

    const codeHash = this.hashCode(normalizedCode);

    const now = new Date();

    return this.prisma.$transaction(
      async (tx) => {
        const dealifyCode = await tx.dealifyCode.findUnique({
          where: {
            codeHash,
          },

          select: {
            id: true,
            codeHint: true,
            tier: true,
            status: true,
            organizationId: true,
            redeemedAt: true,
            revokedAt: true,
            refundedAt: true,
          },
        });

        if (!dealifyCode) {
          throw new NotFoundException('Dealify code not found.');
        }

        /*
         * Idempotent request.
         */
        if (dealifyCode.status === targetStatus) {
          const subscription = dealifyCode.organizationId
            ? await tx.subscription.findUnique({
                where: {
                  organizationId: dealifyCode.organizationId,
                },

                select: {
                  status: true,
                  source: true,
                  accessType: true,
                  dealifyTier: true,
                  dealifyActivatedAt: true,
                  cancelledAt: true,
                },
              })
            : null;

          return {
            alreadyProcessed: true,
            codeHint: dealifyCode.codeHint,
            codeStatus: dealifyCode.status,
            tier: dealifyCode.tier,
            organizationId: dealifyCode.organizationId,
            subscription,
          };
        }

        /*
         * Allowed transitions:
         *
         * AVAILABLE -> REVOKED / REFUNDED
         * REDEEMED  -> REVOKED / REFUNDED
         * REVOKED   -> REFUNDED
         *
         * REFUNDED is final.
         */
        const transitionAllowed =
          dealifyCode.status === 'AVAILABLE' ||
          dealifyCode.status === 'REDEEMED' ||
          (dealifyCode.status === 'REVOKED' && targetStatus === 'REFUNDED');

        if (!transitionAllowed) {
          throw new BadRequestException(
            `Dealify code cannot move from ${dealifyCode.status} to ${targetStatus}.`,
          );
        }

        const updatedCode = await tx.dealifyCode.updateMany({
          where: {
            id: dealifyCode.id,
            status: dealifyCode.status,
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
          throw new ConflictException(
            'The Dealify code changed while this request was being processed.',
          );
        }

        /*
         * AVAILABLE code has no customer
         * and therefore no subscription to change.
         */
        if (!dealifyCode.organizationId) {
          return {
            alreadyProcessed: false,
            codeHint: dealifyCode.codeHint,
            codeStatus: targetStatus,
            tier: dealifyCode.tier,
            organizationId: null,
            subscription: null,
          };
        }

        /*
         * Never overwrite a workspace that
         * no longer has Dealify lifetime access.
         */
        const currentSubscription = await tx.subscription.findUnique({
          where: {
            organizationId: dealifyCode.organizationId,
          },

          select: {
            status: true,
            source: true,
            accessType: true,
            dealifyTier: true,
            dealifyActivatedAt: true,
          },
        });

        if (
          currentSubscription?.source !== 'DEALIFY' ||
          currentSubscription.accessType !== 'LIFETIME'
        ) {
          return {
            alreadyProcessed: false,
            codeHint: dealifyCode.codeHint,
            codeStatus: targetStatus,
            tier: dealifyCode.tier,
            organizationId: dealifyCode.organizationId,
            subscription: currentSubscription,
          };
        }

        /*
         * Remove Dealify lifetime access.
         */
        const subscription = await tx.subscription.update({
          where: {
            organizationId: dealifyCode.organizationId,
          },

          data: {
            status: 'EXPIRED',
            source: 'DIRECT',
            accessType: 'RECURRING',

            dealifyTier: null,
            dealifyActivatedAt: null,

            currentPeriodStart: null,
            currentPeriodEnd: null,

            cancelAtPeriodEnd: false,
            cancelledAt: now,
          },

          select: {
            status: true,
            source: true,
            accessType: true,
            dealifyTier: true,
            dealifyActivatedAt: true,
            cancelledAt: true,
          },
        });

        return {
          alreadyProcessed: false,
          codeHint: dealifyCode.codeHint,
          codeStatus: targetStatus,
          tier: dealifyCode.tier,
          organizationId: dealifyCode.organizationId,
          subscription,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }
}
