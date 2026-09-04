import { Injectable } from '@nestjs/common';

import { Prisma } from '../generated/prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { getAppSumoEntitlements } from '../subscriptions/constants/appsumo-entitlements';

export type CustomerEmailReservation =
  | {
      allowed: true;
      limited: false;
    }
  | {
      allowed: true;
      limited: true;

      organizationId: string;

      periodStart: Date;

      used: number;

      limit: number;
    }
  | {
      allowed: false;

      reason:
        | 'ORGANIZATION_NOT_FOUND'
        | 'BUSINESS_DISABLED'
        | 'LIFETIME_INACTIVE'
        | 'MONTHLY_LIMIT_REACHED';

      used?: number;

      limit?: number;
    };

@Injectable()
export class CustomerEmailQuotaService {
  constructor(private readonly prisma: PrismaService) {}

  async reserve(organizationId: string): Promise<CustomerEmailReservation> {
    const maxAttempts = 3;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      try {
        return await this.prisma.$transaction(
          async (tx) => {
            const organization = await tx.organization.findUnique({
              where: {
                id: organizationId,
              },

              select: {
                customerEmailNotificationsEnabled: true,

                subscription: {
                  select: {
                    source: true,

                    accessType: true,

                    status: true,

                    appSumoTier: true,
                  },
                },
              },
            });

            if (!organization) {
              return {
                allowed: false,

                reason: 'ORGANIZATION_NOT_FOUND',
              };
            }

            if (!organization.customerEmailNotificationsEnabled) {
              return {
                allowed: false,

                reason: 'BUSINESS_DISABLED',
              };
            }

            const subscription = organization.subscription;

            /*
             * Direct recurring and trial
             * subscriptions retain their
             * existing behavior for now.
             */
            if (subscription?.source !== 'APPSUMO') {
              return {
                allowed: true,

                limited: false,
              };
            }

            /*
             * Malformed, revoked, or inactive
             * AppSumo subscriptions cannot
             * send customer emails.
             */
            if (
              subscription.accessType !== 'LIFETIME' ||
              subscription.status !== 'ACTIVE' ||
              !subscription.appSumoTier
            ) {
              return {
                allowed: false,

                reason: 'LIFETIME_INACTIVE',
              };
            }

            const entitlements = getAppSumoEntitlements(
              subscription.appSumoTier,
            );

            const limit = entitlements.monthlyCustomerEmailLimit;

            const periodStart = this.getCurrentPeriodStart();

            const usage = await tx.organizationEmailUsage.upsert({
              where: {
                organizationId_periodStart: {
                  organizationId,

                  periodStart,
                },
              },

              create: {
                organizationId,

                periodStart,

                customerEmailsSent: 0,
              },

              update: {},

              select: {
                id: true,

                customerEmailsSent: true,
              },
            });

            /*
             * Conditional increment makes
             * the quota atomic.
             *
             * Even simultaneous email sends
             * cannot increment beyond limit.
             */
            const claimed = await tx.organizationEmailUsage.updateMany({
              where: {
                id: usage.id,

                customerEmailsSent: {
                  lt: limit,
                },
              },

              data: {
                customerEmailsSent: {
                  increment: 1,
                },
              },
            });

            if (claimed.count !== 1) {
              return {
                allowed: false,

                reason: 'MONTHLY_LIMIT_REACHED',

                used: usage.customerEmailsSent,

                limit,
              };
            }

            const updatedUsage =
              await tx.organizationEmailUsage.findUniqueOrThrow({
                where: {
                  id: usage.id,
                },

                select: {
                  customerEmailsSent: true,
                },
              });

            return {
              allowed: true,

              limited: true,

              organizationId,

              periodStart,

              used: updatedUsage.customerEmailsSent,

              limit,
            };
          },
          {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          },
        );
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

    throw new Error('Unable to reserve customer email quota.');
  }

  async release(reservation: CustomerEmailReservation) {
    if (!reservation.allowed || !reservation.limited) {
      return;
    }

    /*
     * Give the reserved slot back
     * when the provider does not
     * accept the email.
     */
    await this.prisma.organizationEmailUsage.updateMany({
      where: {
        organizationId: reservation.organizationId,

        periodStart: reservation.periodStart,

        customerEmailsSent: {
          gt: 0,
        },
      },

      data: {
        customerEmailsSent: {
          decrement: 1,
        },
      },
    });
  }

  private getCurrentPeriodStart() {
    const now = new Date();

    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  }
}
