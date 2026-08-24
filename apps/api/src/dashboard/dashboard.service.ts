import { Injectable } from '@nestjs/common';

import { Prisma } from '../generated/prisma/client';

import type { TenantContext } from '../auth/types/tenant-context.type';

import { PrismaService } from '../prisma/prisma.service';
import { resolveSubscriptionState } from '../subscriptions/utils/subscription-state.util';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(tenant: TenantContext) {
    const organizationId = tenant.organizationId;

    const now = new Date();

    const startToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const startTomorrow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
    );

    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const startNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const activeJobStatuses = [
      'PENDING',
      'QUEUED',
      'IN_PROGRESS',
      'FOR_REVIEW',
      'READY',
      'DELIVERED',
    ] as const;

    const [
      activeCustomers,

      openQuotations,
      approvedQuotations,

      activeJobs,
      dueToday,
      overdueJobs,

      revenueThisMonth,

      jobTotals,
      paymentTotals,

      recentJobs,
      recentQuotations,
      recentPayments,
    ] = await this.prisma.$transaction([
      /*
       * Customers
       */
      this.prisma.customer.count({
        where: {
          organizationId,
          status: 'ACTIVE',
        },
      }),

      /*
       * Quotations still in sales pipeline
       */
      this.prisma.quotation.count({
        where: {
          organizationId,

          status: {
            in: ['DRAFT', 'SENT', 'VIEWED'],
          },
        },
      }),

      this.prisma.quotation.count({
        where: {
          organizationId,
          status: 'APPROVED',
        },
      }),

      /*
       * Jobs currently operational
       */
      this.prisma.job.count({
        where: {
          organizationId,

          status: {
            in: [...activeJobStatuses],
          },
        },
      }),

      /*
       * Due today
       */
      this.prisma.job.count({
        where: {
          organizationId,

          status: {
            in: [...activeJobStatuses],
          },

          dueDate: {
            gte: startToday,
            lt: startTomorrow,
          },
        },
      }),

      /*
       * Overdue
       */
      this.prisma.job.count({
        where: {
          organizationId,

          status: {
            in: [...activeJobStatuses],
          },

          dueDate: {
            lt: startToday,
          },
        },
      }),

      /*
       * Revenue this month
       */
      this.prisma.payment.aggregate({
        where: {
          organizationId,
          status: 'PAID',

          paidAt: {
            gte: startMonth,
            lt: startNextMonth,
          },
        },

        _sum: {
          amount: true,
        },
      }),

      /*
       * Total value of all valid jobs.
       */
      this.prisma.job.aggregate({
        where: {
          organizationId,

          status: {
            not: 'CANCELLED',
          },
        },

        _sum: {
          total: true,
        },
      }),

      /*
       * Actual paid money.
       */
      this.prisma.payment.aggregate({
        where: {
          organizationId,
          status: 'PAID',

          job: {
            is: {
              status: {
                not: 'CANCELLED',
              },
            },
          },
        },

        _sum: {
          amount: true,
        },
      }),

      /*
       * Recent jobs
       */
      this.prisma.job.findMany({
        where: {
          organizationId,
        },

        take: 5,

        orderBy: {
          createdAt: 'desc',
        },

        select: {
          id: true,
          jobNumber: true,
          title: true,
          status: true,
          priority: true,
          dueDate: true,
          total: true,

          customer: {
            select: {
              id: true,
              name: true,
              companyName: true,
            },
          },
        },
      }),

      /*
       * Recent quotations
       */
      this.prisma.quotation.findMany({
        where: {
          organizationId,
        },

        take: 5,

        orderBy: {
          createdAt: 'desc',
        },

        select: {
          id: true,
          quotationNumber: true,
          status: true,
          total: true,
          validUntil: true,

          customer: {
            select: {
              id: true,
              name: true,
              companyName: true,
            },
          },
        },
      }),

      /*
       * Recent payments
       */
      this.prisma.payment.findMany({
        where: {
          organizationId,
        },

        take: 5,

        orderBy: {
          paidAt: 'desc',
        },

        select: {
          id: true,
          paymentNumber: true,
          amount: true,
          method: true,
          status: true,
          paidAt: true,

          customer: {
            select: {
              id: true,
              name: true,
              companyName: true,
            },
          },

          job: {
            select: {
              id: true,
              jobNumber: true,
            },
          },
        },
      }),
    ]);

    const totalJobValue = jobTotals._sum.total ?? new Prisma.Decimal(0);

    const totalPaid = paymentTotals._sum.amount ?? new Prisma.Decimal(0);

    let outstandingBalance = totalJobValue.minus(totalPaid);

    if (outstandingBalance.lessThan(0)) {
      outstandingBalance = new Prisma.Decimal(0);
    }

    const subscriptionState = tenant.subscription
      ? resolveSubscriptionState(tenant.subscription, now)
      : null;

    return {
      organization: {
        id: tenant.organizationId,

        name: tenant.organizationName,

        slug: tenant.organizationSlug,

        role: tenant.role,
      },

      subscription: {
        plan: tenant.subscription?.plan ?? null,

        status: subscriptionState?.status ?? null,

        trialStartedAt: tenant.subscription?.trialStartedAt ?? null,

        trialEndsAt: tenant.subscription?.trialEndsAt ?? null,

        currentPeriodStart: tenant.subscription?.currentPeriodStart ?? null,

        currentPeriodEnd: tenant.subscription?.currentPeriodEnd ?? null,

        trialDaysRemaining: subscriptionState?.trialDaysRemaining ?? null,

        daysRemaining: subscriptionState?.daysRemaining ?? null,
      },

      stats: {
        customers: activeCustomers,

        quotations: {
          open: openQuotations,

          approved: approvedQuotations,
        },

        jobs: {
          active: activeJobs,

          dueToday,
          overdue: overdueJobs,
        },

        financials: {
          revenueThisMonth:
            revenueThisMonth._sum.amount ?? new Prisma.Decimal(0),

          totalJobValue,

          totalPaid,

          outstandingBalance,
        },
      },

      recent: {
        jobs: recentJobs,

        quotations: recentQuotations,

        payments: recentPayments,
      },
    };
  }
}
