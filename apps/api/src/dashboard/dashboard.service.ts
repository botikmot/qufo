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

    const startYear = new Date(now.getFullYear(), 0, 1);

    const startNextYear = new Date(now.getFullYear() + 1, 0, 1);

    const activeJobStatuses = [
      'PENDING',
      'QUEUED',
      'IN_PROGRESS',
      'FOR_REVIEW',
      'READY',
      'DELIVERED',
    ] as const;

    const [
      organization,

      activeCustomers,

      openQuotations,
      approvedQuotations,

      activeJobs,
      dueToday,
      overdueJobs,

      revenueThisMonth,

      monthlyPayments,

      jobTotals,
      paymentTotals,

      recentJobs,
      recentQuotations,
      recentPayments,

      workflowQuotations,
      workflowForApproval,
      workflowInProgress,
      workflowForPayment,
      workflowCompleted,
      forPaymentJobs,
    ] = await this.prisma.$transaction([
      this.prisma.organization.findUnique({
        where: {
          id: organizationId,
        },

        select: {
          currency: true,
          countryCode: true,
        },
      }),

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
       * Monthly revenue for financial chart.
       */
      this.prisma.payment.findMany({
        where: {
          organizationId,

          status: 'PAID',

          paidAt: {
            gte: startYear,
            lt: startNextYear,
          },
        },

        select: {
          amount: true,
          paidAt: true,
        },

        orderBy: {
          paidAt: 'asc',
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
          currency: true,
          createdAt: true,

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
          currency: true,
          createdAt: true,

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
          currency: true,
          createdAt: true,

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

      // Open quotations
      this.prisma.quotation.count({
        where: {
          organizationId,
          status: {
            in: ['DRAFT', 'SENT', 'VIEWED'],
          },
        },
      }),

      // Quotations awaiting approval
      this.prisma.quotation.count({
        where: {
          organizationId,
          status: 'SENT',
        },
      }),

      // Jobs in progress
      this.prisma.job.count({
        where: {
          organizationId,
          status: {
            in: ['IN_PROGRESS'],
          },
        },
      }),

      // Jobs awaiting payment
      this.prisma.job.count({
        where: {
          organizationId,
          status: 'DELIVERED',
        },
      }),

      // Completed jobs this month
      this.prisma.job.count({
        where: {
          organizationId,
          status: 'COMPLETED',
          completedAt: {
            gte: startMonth,
            lt: startNextMonth,
          },
        },
      }),

      /*
       * Jobs with outstanding balance
       *
       * Includes all non-cancelled jobs,
       * regardless of their status.
       */
      this.prisma.job.findMany({
        where: {
          organizationId,

          status: {
            not: 'CANCELLED',
          },
        },

        select: {
          id: true,
          total: true,

          payments: {
            where: {
              status: 'PAID',
            },

            select: {
              amount: true,
            },
          },
        },
      }),
    ]);

    const currency = organization?.currency ?? 'PHP';

    const totalJobValue = jobTotals._sum.total ?? new Prisma.Decimal(0);

    const totalPaid = paymentTotals._sum.amount ?? new Prisma.Decimal(0);

    const forPaymentCount = forPaymentJobs.filter((job) => {
      const paidAmount = job.payments.reduce(
        (sum, payment) => sum.plus(payment.amount),
        new Prisma.Decimal(0),
      );

      const outstandingBalance = job.total.minus(paidAmount);

      return outstandingBalance.greaterThan(0);
    }).length;

    let outstandingBalance = totalJobValue.minus(totalPaid);

    if (outstandingBalance.lessThan(0)) {
      outstandingBalance = new Prisma.Decimal(0);
    }

    const subscriptionState = tenant.subscription
      ? resolveSubscriptionState(tenant.subscription, now)
      : null;

    const monthlyRevenue = Array.from({ length: 12 }, (_, month) => ({
      month: month + 1,
      revenue: 0,
    }));

    for (const payment of monthlyPayments) {
      const month = payment.paidAt.getMonth();

      monthlyRevenue[month].revenue += Number(payment.amount);
    }

    const recentActivity = [
      ...recentJobs.map((job) => ({
        type: 'JOB' as const,
        id: job.id,
        createdAt: job.createdAt,

        title: job.title,
        reference: job.jobNumber,

        status: job.status,
        priority: job.priority,

        total: job.total,
        currency: job.currency,

        customer: job.customer,
      })),

      ...recentQuotations.map((quotation) => ({
        type: 'QUOTATION' as const,
        id: quotation.id,
        createdAt: quotation.createdAt,

        title:
          quotation.customer?.companyName ??
          quotation.customer?.name ??
          'Customer',

        reference: quotation.quotationNumber,

        status: quotation.status,

        total: quotation.total,
        currency: quotation.currency,

        customer: quotation.customer,
      })),

      ...recentPayments.map((payment) => ({
        type: 'PAYMENT' as const,
        id: payment.id,
        createdAt: payment.createdAt,

        title:
          payment.customer?.companyName ?? payment.customer?.name ?? 'Customer',

        reference: payment.paymentNumber,

        status: payment.status,

        total: payment.amount,
        currency: payment.currency,

        customer: payment.customer,

        method: payment.method,
        paidAt: payment.paidAt,
      })),
    ]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 1);

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
          forPayment: forPaymentCount,
        },

        workflow: {
          quotations: workflowQuotations,
          forApproval: workflowForApproval,
          inProgress: workflowInProgress,
          forPayment: workflowForPayment,
          completed: workflowCompleted,
        },

        financials: {
          currency,
          revenueThisMonth:
            revenueThisMonth._sum.amount ?? new Prisma.Decimal(0),

          totalJobValue,

          totalPaid,

          outstandingBalance,

          monthlyRevenue,
        },
      },

      recent: {
        jobs: recentJobs,

        quotations: recentQuotations,

        payments: recentPayments,
        activity: recentActivity,
      },
    };
  }
}
