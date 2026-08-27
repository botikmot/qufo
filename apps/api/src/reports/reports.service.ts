import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from '../generated/prisma/client';

import type { TenantContext } from '../auth/types/tenant-context.type';

import { PrismaService } from '../prisma/prisma.service';

import { ReportsQueryDto } from './dto/reports-query.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getReport(tenant: TenantContext, query: ReportsQueryDto) {
    const organizationId = tenant.organizationId;

    const now = new Date();

    const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1);

    const defaultTo = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const from = query.from ? new Date(query.from) : defaultFrom;

    /*
     * Treat `to` as inclusive from the frontend,
     * then convert it to an exclusive next-day boundary.
     */
    const to = query.to ? new Date(query.to) : defaultTo;

    if (query.to) {
      to.setDate(to.getDate() + 1);
    }

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      throw new BadRequestException('Invalid report date range.');
    }

    if (from >= to) {
      throw new BadRequestException(
        'The report start date must be before the end date.',
      );
    }

    const dateRange = {
      gte: from,
      lt: to,
    };

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

      totalCustomers,

      quotationCount,
      approvedQuotations,
      rejectedQuotations,
      convertedQuotations,

      jobsCount,
      activeJobs,
      completedJobs,
      cancelledJobs,

      jobValue,

      paidPayments,
      paymentCount,

      paymentMethods,

      quotationStatuses,
      jobStatuses,

      topCustomerJobs,
    ] = await this.prisma.$transaction([
      this.prisma.organization.findUnique({
        where: {
          id: organizationId,
        },

        select: {
          currency: true,
        },
      }),

      /*
       * Customers created during range
       */
      this.prisma.customer.count({
        where: {
          organizationId,

          createdAt: dateRange,
        },
      }),

      /*
       * Quotations
       */
      this.prisma.quotation.count({
        where: {
          organizationId,

          createdAt: dateRange,
        },
      }),

      this.prisma.quotation.count({
        where: {
          organizationId,
          status: 'APPROVED',

          createdAt: dateRange,
        },
      }),

      this.prisma.quotation.count({
        where: {
          organizationId,
          status: 'REJECTED',

          createdAt: dateRange,
        },
      }),

      this.prisma.quotation.count({
        where: {
          organizationId,
          status: 'CONVERTED',

          createdAt: dateRange,
        },
      }),

      /*
       * Jobs
       */
      this.prisma.job.count({
        where: {
          organizationId,

          createdAt: dateRange,
        },
      }),

      this.prisma.job.count({
        where: {
          organizationId,

          status: {
            in: [...activeJobStatuses],
          },

          createdAt: dateRange,
        },
      }),

      this.prisma.job.count({
        where: {
          organizationId,
          status: 'COMPLETED',

          createdAt: dateRange,
        },
      }),

      this.prisma.job.count({
        where: {
          organizationId,
          status: 'CANCELLED',

          createdAt: dateRange,
        },
      }),

      /*
       * Total job value created
       * during this date range.
       */
      this.prisma.job.aggregate({
        where: {
          organizationId,

          status: {
            not: 'CANCELLED',
          },

          createdAt: dateRange,
        },

        _sum: {
          total: true,
        },
      }),

      /*
       * Actual collected revenue.
       *
       * Use paidAt rather than createdAt,
       * because this answers:
       * "How much money was received
       * during this period?"
       */
      this.prisma.payment.aggregate({
        where: {
          organizationId,
          status: 'PAID',

          paidAt: dateRange,

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

      this.prisma.payment.count({
        where: {
          organizationId,
          status: 'PAID',

          paidAt: dateRange,
        },
      }),

      /*
       * Payments grouped by method.
       */
      this.prisma.payment.groupBy({
        by: ['method'],

        where: {
          organizationId,
          status: 'PAID',
          paidAt: dateRange,
        },

        orderBy: {
          method: 'asc',
        },

        _count: {
          _all: true,
        },

        _sum: {
          amount: true,
        },
      }),

      this.prisma.quotation.groupBy({
        by: ['status'],

        where: {
          organizationId,
          createdAt: dateRange,
        },

        orderBy: {
          status: 'asc',
        },

        _count: {
          _all: true,
        },

        _sum: {
          total: true,
        },
      }),

      this.prisma.job.groupBy({
        by: ['status'],

        where: {
          organizationId,
          createdAt: dateRange,
        },

        orderBy: {
          status: 'asc',
        },

        _count: {
          _all: true,
        },

        _sum: {
          total: true,
        },
      }),

      /*
       * Jobs with customer data
       * for top-customer calculation.
       */
      this.prisma.job.findMany({
        where: {
          organizationId,

          status: {
            not: 'CANCELLED',
          },

          createdAt: dateRange,
        },

        select: {
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
    ]);

    if (!organization) {
      throw new NotFoundException('Organization not found.');
    }

    const currency = organization.currency;

    const totalJobValue = jobValue._sum.total ?? new Prisma.Decimal(0);

    const totalPaid = paidPayments._sum.amount ?? new Prisma.Decimal(0);

    /*
     * NOTE:
     * This is outstanding against
     * jobs created inside the selected
     * report period.
     *
     * Dashboard's outstanding value is
     * an all-time operational balance.
     */
    let outstandingBalance = totalJobValue.minus(totalPaid);

    if (outstandingBalance.lessThan(0)) {
      outstandingBalance = new Prisma.Decimal(0);
    }

    const conversionRate =
      quotationCount > 0
        ? Number(((convertedQuotations / quotationCount) * 100).toFixed(1))
        : 0;

    const completionRate =
      jobsCount > 0
        ? Number(((completedJobs / jobsCount) * 100).toFixed(1))
        : 0;

    /*
     * Aggregate customer job values
     * in application code.
     *
     * This keeps the query simple
     * because customer name/company
     * are relations, not groupBy fields.
     */
    const customerTotals = new Map<
      string,
      {
        id: string;
        name: string;
        companyName: string | null;
        jobCount: number;
        totalValue: Prisma.Decimal;
        currency: string;
      }
    >();

    for (const job of topCustomerJobs) {
      const existing = customerTotals.get(job.customer.id);

      if (existing) {
        existing.jobCount += 1;

        existing.totalValue = existing.totalValue.plus(job.total);

        continue;
      }

      customerTotals.set(job.customer.id, {
        id: job.customer.id,

        name: job.customer.name,

        companyName: job.customer.companyName,

        jobCount: 1,

        totalValue: job.total,
        currency,
      });
    }

    const topCustomers = Array.from(customerTotals.values())
      .sort((a, b) => b.totalValue.minus(a.totalValue).toNumber())
      .slice(0, 5);

    return {
      period: {
        from,
        to: query.to
          ? new Date(new Date(query.to).setHours(23, 59, 59, 999))
          : new Date(defaultTo.getTime() - 1),
      },

      overview: {
        currency,

        customers: totalCustomers,

        quotations: quotationCount,

        jobs: jobsCount,

        paymentCount,

        totalJobValue,

        totalPaid,

        outstandingBalance,
      },

      quotations: {
        total: quotationCount,

        approved: approvedQuotations,

        rejected: rejectedQuotations,

        converted: convertedQuotations,

        conversionRate,

        byStatus: quotationStatuses,
      },

      jobs: {
        total: jobsCount,

        active: activeJobs,

        completed: completedJobs,

        cancelled: cancelledJobs,

        completionRate,

        byStatus: jobStatuses,
      },

      payments: {
        currency,
        count: paymentCount,

        collected: totalPaid,

        byMethod: paymentMethods,
      },

      topCustomers,
    };
  }
}
