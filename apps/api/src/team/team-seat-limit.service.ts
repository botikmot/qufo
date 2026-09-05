import { ForbiddenException, Injectable } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { Prisma } from '../generated/prisma/client';

import type { AppSumoTier } from '../generated/prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { getAppSumoEntitlements } from '../subscriptions/constants/appsumo-entitlements';

export type TeamSeatUsage = {
  limited: boolean;

  appSumoTier: AppSumoTier | null;

  limit: number | null;

  activeMembers: number;

  pendingInvitations: number;

  usedSeats: number;

  remainingSeats: number | null;
};

export type TeamSeatReconciliation = TeamSeatUsage & {
  cancelledInvitations: number;

  suspendedMembers: number;

  reactivatedMembers: number;

  unresolvedExcessSeats: number;
};

type SeatLimit = {
  appSumoTier: AppSumoTier | null;

  limit: number | null;
};

@Injectable()
export class TeamSeatLimitService {
  constructor(
    private readonly prisma: PrismaService,

    private readonly configService: ConfigService,
  ) {}

  /*
   * Read-only usage summary for settings
   * screens and API responses.
   *
   * Expired pending invitations are marked
   * EXPIRED before the usage is counted.
   */
  async getUsage(organizationId: string): Promise<TeamSeatUsage> {
    return this.prisma.$transaction((tx) =>
      this.getUsageInTransaction(tx, organizationId),
    );
  }

  /*
   * This method must be called inside the
   * same SERIALIZABLE transaction that will
   * create an invitation or reactivate a
   * member.
   *
   * That prevents simultaneous requests from
   * reserving the same final available seat.
   */
  async assertSeatAvailableInTransaction(
    tx: Prisma.TransactionClient,
    organizationId: string,
    now = new Date(),
  ): Promise<TeamSeatUsage> {
    const usage = await this.getUsageInTransaction(tx, organizationId, now);

    if (usage.limit !== null && usage.usedSeats >= usage.limit) {
      throw this.createLimitError(usage);
    }

    return usage;
  }

  async getUsageInTransaction(
    tx: Prisma.TransactionClient,
    organizationId: string,
    now = new Date(),
  ): Promise<TeamSeatUsage> {
    await this.expirePendingInvitations(tx, organizationId, now);

    const [{ appSumoTier, limit }, activeMembers, pendingInvitations] =
      await Promise.all([
        this.getSeatLimitInTransaction(tx, organizationId),

        tx.organizationMember.count({
          where: {
            organizationId,
            isActive: true,
          },
        }),

        tx.organizationInvitation.count({
          where: {
            organizationId,
            status: 'PENDING',
            expiresAt: {
              gt: now,
            },
          },
        }),
      ]);

    const usedSeats = activeMembers + pendingInvitations;

    return {
      limited: limit !== null,
      appSumoTier,
      limit,
      activeMembers,
      pendingInvitations,
      usedSeats,
      remainingSeats: limit === null ? null : Math.max(0, limit - usedSeats),
    };
  }

  /*
   * Reconcile membership access after an
   * AppSumo tier upgrade, downgrade, refund,
   * or revocation.
   *
   * Downgrade order:
   * 1. Cancel newest pending invitations.
   * 2. Suspend newest active non-owner members.
   *
   * Upgrade order:
   * Re-enable only members that were suspended
   * by the seat limit. Manually deactivated
   * members are never automatically re-enabled.
   */
  async reconcile(organizationId: string): Promise<TeamSeatReconciliation> {
    return this.runSerializable((tx) =>
      this.reconcileInTransaction(tx, organizationId),
    );
  }

  async reconcileInTransaction(
    tx: Prisma.TransactionClient,
    organizationId: string,
    now = new Date(),
  ): Promise<TeamSeatReconciliation> {
    const initialUsage = await this.getUsageInTransaction(
      tx,
      organizationId,
      now,
    );

    let cancelledInvitations = 0;

    let suspendedMembers = 0;

    let reactivatedMembers = 0;

    /*
     * Self-hosted and direct-recurring
     * workspaces currently have no seat cap.
     * Restore only members previously suspended
     * by an AppSumo seat limit.
     */
    if (initialUsage.limit === null) {
      const restored = await tx.organizationMember.updateMany({
        where: {
          organizationId,
          isActive: false,
          seatLimitSuspendedAt: {
            not: null,
          },
        },

        data: {
          isActive: true,
          deactivatedAt: null,
          seatLimitSuspendedAt: null,
        },
      });

      reactivatedMembers = restored.count;

      const finalUsage = await this.getUsageInTransaction(
        tx,
        organizationId,
        now,
      );

      return {
        ...finalUsage,
        cancelledInvitations,
        suspendedMembers,
        reactivatedMembers,
        unresolvedExcessSeats: 0,
      };
    }

    let excessSeats = Math.max(0, initialUsage.usedSeats - initialUsage.limit);

    if (excessSeats > 0) {
      const invitationsToCancel = await tx.organizationInvitation.findMany({
        where: {
          organizationId,
          status: 'PENDING',
          expiresAt: {
            gt: now,
          },
        },

        orderBy: [
          {
            createdAt: 'desc',
          },
          {
            id: 'desc',
          },
        ],

        take: excessSeats,

        select: {
          id: true,
        },
      });

      if (invitationsToCancel.length > 0) {
        const cancelled = await tx.organizationInvitation.updateMany({
          where: {
            id: {
              in: invitationsToCancel.map((invitation) => invitation.id),
            },
            status: 'PENDING',
          },

          data: {
            status: 'CANCELLED',
            cancelledAt: now,
          },
        });

        cancelledInvitations = cancelled.count;

        excessSeats = Math.max(0, excessSeats - cancelled.count);
      }
    }

    if (excessSeats > 0) {
      const membersToSuspend = await tx.organizationMember.findMany({
        where: {
          organizationId,
          isActive: true,
          role: {
            not: 'OWNER',
          },
        },

        orderBy: [
          {
            joinedAt: 'desc',
          },
          {
            id: 'desc',
          },
        ],

        take: excessSeats,

        select: {
          id: true,
        },
      });

      if (membersToSuspend.length > 0) {
        const suspended = await tx.organizationMember.updateMany({
          where: {
            id: {
              in: membersToSuspend.map((member) => member.id),
            },
            isActive: true,
            role: {
              not: 'OWNER',
            },
          },

          data: {
            isActive: false,
            deactivatedAt: null,
            seatLimitSuspendedAt: now,
          },
        });

        suspendedMembers = suspended.count;
      }
    }

    /*
     * If the tier increased, fill available
     * seats with the oldest members previously
     * suspended by a seat-limit downgrade.
     */
    if (initialUsage.usedSeats < initialUsage.limit) {
      const availableSeats = initialUsage.limit - initialUsage.usedSeats;

      const membersToReactivate = await tx.organizationMember.findMany({
        where: {
          organizationId,
          isActive: false,
          seatLimitSuspendedAt: {
            not: null,
          },
          role: {
            not: 'OWNER',
          },
        },

        orderBy: [
          {
            seatLimitSuspendedAt: 'asc',
          },
          {
            joinedAt: 'asc',
          },
          {
            id: 'asc',
          },
        ],

        take: availableSeats,

        select: {
          id: true,
        },
      });

      if (membersToReactivate.length > 0) {
        const reactivated = await tx.organizationMember.updateMany({
          where: {
            id: {
              in: membersToReactivate.map((member) => member.id),
            },
            isActive: false,
            seatLimitSuspendedAt: {
              not: null,
            },
          },

          data: {
            isActive: true,
            deactivatedAt: null,
            seatLimitSuspendedAt: null,
          },
        });

        reactivatedMembers = reactivated.count;
      }
    }

    const finalUsage = await this.getUsageInTransaction(
      tx,
      organizationId,
      now,
    );

    return {
      ...finalUsage,
      cancelledInvitations,
      suspendedMembers,
      reactivatedMembers,
      unresolvedExcessSeats:
        finalUsage.limit === null
          ? 0
          : Math.max(0, finalUsage.usedSeats - finalUsage.limit),
    };
  }

  private async getSeatLimitInTransaction(
    tx: Prisma.TransactionClient,
    organizationId: string,
  ): Promise<SeatLimit> {
    if (!this.subscriptionEnabled) {
      return {
        appSumoTier: null,
        limit: null,
      };
    }

    const subscription = await tx.subscription.findUnique({
      where: {
        organizationId,
      },

      select: {
        status: true,
        source: true,
        accessType: true,
        appSumoTier: true,
      },
    });

    if (
      subscription?.status !== 'ACTIVE' ||
      subscription.source !== 'APPSUMO' ||
      subscription.accessType !== 'LIFETIME' ||
      !subscription.appSumoTier
    ) {
      return {
        appSumoTier: null,
        limit: null,
      };
    }

    return {
      appSumoTier: subscription.appSumoTier,
      limit: getAppSumoEntitlements(subscription.appSumoTier).maxMembers,
    };
  }

  private async expirePendingInvitations(
    tx: Prisma.TransactionClient,
    organizationId: string,
    now: Date,
  ) {
    await tx.organizationInvitation.updateMany({
      where: {
        organizationId,
        status: 'PENDING',
        expiresAt: {
          lte: now,
        },
      },

      data: {
        status: 'EXPIRED',
      },
    });
  }

  private createLimitError(usage: TeamSeatUsage) {
    return new ForbiddenException({
      statusCode: 403,
      code: 'MEMBER_LIMIT_REACHED',
      message:
        'Your workspace has reached its AppSumo team member limit. Redeem another AppSumo code to add more members.',
      seats: {
        activeMembers: usage.activeMembers,
        pendingInvitations: usage.pendingInvitations,
        used: usage.usedSeats,
        limit: usage.limit,
        remaining: usage.remainingSeats,
      },
    });
  }

  private get subscriptionEnabled() {
    return (
      this.configService
        .get<string>('SUBSCRIPTION_ENABLED')
        ?.trim()
        .toLowerCase() !== 'false'
    );
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

    throw new Error('Unable to reconcile team seat limits.');
  }
}
