import { BadRequestException, Injectable } from '@nestjs/common';

import type { DealifyTier, Prisma } from '../generated/prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { getDealifyEntitlements } from './constants/dealify-entitlements';

export type DealifyQuotationUsageSummary = {
  isDealify: boolean;
  tier: DealifyTier | null;
  monthlyLimit: number;
  used: number;
  remaining: number;
  periodStart: Date;
};

@Injectable()
export class DealifyUsageService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Consumes one quotation credit for a Dealify workspace.
   *
   * This method must be called inside the same Prisma transaction
   * that creates the quotation.
   */
  async consumeQuotationCredit(
    tx: Prisma.TransactionClient,
    organizationId: string,
  ): Promise<void> {
    const subscription = await tx.subscription.findUnique({
      where: {
        organizationId,
      },

      select: {
        source: true,
        status: true,
        accessType: true,
        dealifyTier: true,
      },
    });

    /*
     * Non-Dealify workspaces do not use
     * the Dealify quotation quota.
     */
    if (
      !subscription ||
      subscription.source !== 'DEALIFY' ||
      subscription.status !== 'ACTIVE' ||
      subscription.accessType !== 'LIFETIME' ||
      !subscription.dealifyTier
    ) {
      return;
    }

    const entitlements = getDealifyEntitlements(subscription.dealifyTier);

    const periodStart = this.getCurrentUtcMonthStart();

    /*
     * Create the monthly usage row if it does not exist yet.
     *
     * If it already exists, update:{} leaves the
     * current usage unchanged.
     */
    await tx.organizationQuotationUsage.upsert({
      where: {
        organizationId_periodStart: {
          organizationId,
          periodStart,
        },
      },

      create: {
        organizationId,
        periodStart,
        quotationsCreated: 0,
      },

      update: {},
    });

    /*
     * Atomically consume one credit only while
     * the usage is still below the monthly limit.
     */
    const result = await tx.organizationQuotationUsage.updateMany({
      where: {
        organizationId,
        periodStart,
        quotationsCreated: {
          lt: entitlements.monthlyQuotationCredits,
        },
      },

      data: {
        quotationsCreated: {
          increment: 1,
        },
      },
    });

    if (result.count !== 1) {
      throw new BadRequestException(
        `You have reached your monthly quotation limit of ${entitlements.monthlyQuotationCredits}.`,
      );
    }
  }

  /**
   * Returns the current UTC month start.
   *
   * Example:
   * September 14, 2026 -> September 1, 2026
   */
  private getCurrentUtcMonthStart(): Date {
    const now = new Date();

    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  }

  /**
   * Returns the current quotation usage for a workspace.
   *
   * This is read-only and does not require a transaction.
   */
  async getCurrentQuotationUsage(
    organizationId: string,
  ): Promise<DealifyQuotationUsageSummary> {
    const periodStart = this.getCurrentUtcMonthStart();

    const subscription = await this.prisma.subscription.findUnique({
      where: {
        organizationId,
      },

      select: {
        source: true,
        status: true,
        accessType: true,
        dealifyTier: true,
      },
    });

    /*
     * Non-Dealify workspace.
     */
    if (
      !subscription ||
      subscription.source !== 'DEALIFY' ||
      subscription.status !== 'ACTIVE' ||
      subscription.accessType !== 'LIFETIME' ||
      !subscription.dealifyTier
    ) {
      return {
        isDealify: false,
        tier: null,
        monthlyLimit: 0,
        used: 0,
        remaining: 0,
        periodStart,
      };
    }

    const entitlements = getDealifyEntitlements(subscription.dealifyTier);

    const usage = await this.prisma.organizationQuotationUsage.findUnique({
      where: {
        organizationId_periodStart: {
          organizationId,
          periodStart,
        },
      },

      select: {
        quotationsCreated: true,
      },
    });

    const used = usage?.quotationsCreated ?? 0;

    const remaining = Math.max(0, entitlements.monthlyQuotationCredits - used);

    return {
      isDealify: true,
      tier: subscription.dealifyTier,
      monthlyLimit: entitlements.monthlyQuotationCredits,
      used,
      remaining,
      periodStart,
    };
  }
}
