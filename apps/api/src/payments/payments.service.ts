import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from '../generated/prisma/client';

import type { JwtPayload } from '../auth/types/jwt-payload.type';
import type { TenantContext } from '../auth/types/tenant-context.type';

import { PrismaService } from '../prisma/prisma.service';

import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentQueryDto } from './dto/payment-query.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: JwtPayload, tenant: TenantContext, dto: CreatePaymentDto) {
    return this.prisma.$transaction(
      async (tx) => {
        const job = await tx.job.findFirst({
          where: {
            id: dto.jobId,
            organizationId: tenant.organizationId,
          },

          select: {
            id: true,
            jobNumber: true,
            customerId: true,
            status: true,
            total: true,
            currency: true,

            customer: {
              select: {
                id: true,
                name: true,
                companyName: true,
              },
            },
          },
        });

        if (!job) {
          throw new NotFoundException('Job not found.');
        }

        if (job.status === 'CANCELLED') {
          throw new BadRequestException(
            'Payments cannot be recorded for a cancelled job.',
          );
        }

        const aggregate = await tx.payment.aggregate({
          where: {
            jobId: job.id,
            organizationId: tenant.organizationId,

            status: 'PAID',
          },

          _sum: {
            amount: true,
          },
        });

        const totalPaid = aggregate._sum.amount ?? new Prisma.Decimal(0);

        const balance = job.total.minus(totalPaid).toDecimalPlaces(2);

        if (balance.lessThanOrEqualTo(0)) {
          throw new BadRequestException('This job is already fully paid.');
        }

        const amount = new Prisma.Decimal(dto.amount).toDecimalPlaces(2);

        if (amount.greaterThan(balance)) {
          throw new BadRequestException(
            `Payment exceeds the remaining balance of ${balance.toFixed(2)}.`,
          );
        }

        const sequence = await tx.organizationSequence.upsert({
          where: {
            organizationId: tenant.organizationId,
          },

          create: {
            organizationId: tenant.organizationId,

            payment: 1,
          },

          update: {
            payment: {
              increment: 1,
            },
          },

          select: {
            payment: true,
          },
        });

        const paymentNumber = `PAY-${new Date().getFullYear()}-${String(
          sequence.payment,
        ).padStart(6, '0')}`;

        const payment = await tx.payment.create({
          data: {
            organizationId: tenant.organizationId,

            customerId: job.customerId,

            jobId: job.id,

            createdById: user.sub,

            paymentNumber,

            currency: job.currency,

            amount,

            method: dto.method,

            status: 'PAID',

            referenceNumber: dto.referenceNumber?.trim() || null,

            notes: dto.notes?.trim() || null,

            paidAt: dto.paidAt ? new Date(dto.paidAt) : new Date(),
          },

          include: {
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
                title: true,
              },
            },

            createdBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        const newTotalPaid = totalPaid.plus(amount);

        const newBalance = job.total.minus(newTotalPaid).toDecimalPlaces(2);

        return {
          message: 'Payment recorded successfully.',

          payment,

          summary: {
            jobTotal: job.total,

            totalPaid: newTotalPaid,

            balance: newBalance,

            paymentStatus: this.getPaymentStatus(job.total, newTotalPaid),
          },
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }

  async findAll(tenant: TenantContext, query: PaymentQueryDto) {
    const page = query.page;
    const limit = query.limit;

    const skip = (page - 1) * limit;

    const search = query.search?.trim();

    const where: Prisma.PaymentWhereInput = {
      organizationId: tenant.organizationId,

      ...(query.status
        ? {
            status: query.status,
          }
        : {}),

      ...(query.method
        ? {
            method: query.method,
          }
        : {}),

      ...(query.jobId
        ? {
            jobId: query.jobId,
          }
        : {}),

      ...(query.customerId
        ? {
            customerId: query.customerId,
          }
        : {}),

      ...(search
        ? {
            OR: [
              {
                paymentNumber: {
                  contains: search,
                  mode: 'insensitive',
                },
              },

              {
                referenceNumber: {
                  contains: search,
                  mode: 'insensitive',
                },
              },

              {
                job: {
                  is: {
                    jobNumber: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                },
              },

              {
                customer: {
                  is: {
                    OR: [
                      {
                        name: {
                          contains: search,
                          mode: 'insensitive',
                        },
                      },

                      {
                        companyName: {
                          contains: search,
                          mode: 'insensitive',
                        },
                      },
                    ],
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.payment.findMany({
        where,

        skip,
        take: limit,

        orderBy: {
          paidAt: 'desc',
        },

        select: {
          id: true,
          paymentNumber: true,

          amount: true,
          currency: true,

          method: true,
          status: true,

          referenceNumber: true,
          notes: true,

          paidAt: true,
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
              title: true,
              total: true,
              currency: true,
            },
          },

          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),

      this.prisma.payment.count({
        where,
      }),
    ]);

    return {
      items,

      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(tenant: TenantContext, id: string) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        id,
        organizationId: tenant.organizationId,
      },

      include: {
        customer: true,

        job: {
          select: {
            id: true,
            jobNumber: true,
            title: true,
            total: true,
          },
        },

        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found.');
    }

    return payment;
  }

  async getJobPayments(tenant: TenantContext, jobId: string) {
    const job = await this.prisma.job.findFirst({
      where: {
        id: jobId,
        organizationId: tenant.organizationId,
      },

      select: {
        id: true,
        jobNumber: true,
        total: true,
        currency: true,

        payments: {
          orderBy: {
            paidAt: 'asc',
          },

          select: {
            id: true,
            paymentNumber: true,

            amount: true,
            currency: true,
            method: true,
            status: true,

            referenceNumber: true,
            notes: true,

            paidAt: true,

            createdBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found.');
    }

    const totalPaid = job.payments
      .filter((payment) => payment.status === 'PAID')
      .reduce(
        (sum, payment) => sum.plus(payment.amount),

        new Prisma.Decimal(0),
      );

    const balance = job.total.minus(totalPaid).toDecimalPlaces(2);

    return {
      job: {
        id: job.id,

        jobNumber: job.jobNumber,

        total: job.total,

        currency: job.currency,
      },

      summary: {
        totalPaid,
        balance,

        paymentStatus: this.getPaymentStatus(job.total, totalPaid),
      },

      payments: job.payments,
    };
  }

  async void(tenant: TenantContext, id: string) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        id,
        organizationId: tenant.organizationId,
      },

      select: {
        id: true,
        paymentNumber: true,
        status: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found.');
    }

    if (payment.status !== 'PAID') {
      throw new BadRequestException(
        `Only paid payments can be voided. Current status is ${payment.status}.`,
      );
    }

    const updated = await this.prisma.payment.update({
      where: {
        id: payment.id,
      },

      data: {
        status: 'VOIDED',
      },

      select: {
        id: true,
        paymentNumber: true,
        amount: true,
        status: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Payment voided successfully.',

      payment: updated,
    };
  }

  private getPaymentStatus(total: Prisma.Decimal, totalPaid: Prisma.Decimal) {
    if (totalPaid.lessThanOrEqualTo(0)) {
      return 'UNPAID';
    }

    if (totalPaid.greaterThanOrEqualTo(total)) {
      return 'PAID';
    }

    return 'PARTIALLY_PAID';
  }

  async getSummary(tenant: TenantContext) {
    const [organization, jobs] = await this.prisma.$transaction([
      this.prisma.organization.findUnique({
        where: {
          id: tenant.organizationId,
        },

        select: {
          currency: true,
        },
      }),

      this.prisma.job.findMany({
        where: {
          organizationId: tenant.organizationId,

          status: {
            not: 'CANCELLED',
          },
        },

        select: {
          id: true,
          jobNumber: true,
          title: true,
          total: true,
          currency: true,
          status: true,

          customer: {
            select: {
              id: true,
              name: true,
              companyName: true,
            },
          },

          payments: {
            where: {
              status: 'PAID',
            },

            select: {
              amount: true,
            },
          },
        },

        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    if (!organization) {
      throw new NotFoundException('Organization not found.');
    }

    const items = jobs.map((job) => {
      const total = Number(job.total);

      const paidAmount = job.payments.reduce(
        (sum, payment) => sum + Number(payment.amount),
        0,
      );

      const balance = Math.max(total - paidAmount, 0);

      let paymentStatus: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';

      if (paidAmount <= 0) {
        paymentStatus = 'UNPAID';
      } else if (paidAmount >= total) {
        paymentStatus = 'PAID';
      } else {
        paymentStatus = 'PARTIALLY_PAID';
      }

      return {
        id: job.id,

        jobNumber: job.jobNumber,

        title: job.title,

        jobStatus: job.status,

        customer: job.customer,

        currency: job.currency,

        total: total.toFixed(2),

        paidAmount: paidAmount.toFixed(2),

        balance: balance.toFixed(2),

        paymentStatus,
      };
    });

    const totalJobValue = items.reduce(
      (sum, item) => sum + Number(item.total),
      0,
    );

    const totalPaid = items.reduce(
      (sum, item) => sum + Number(item.paidAmount),
      0,
    );

    return {
      summary: {
        totalJobValue: totalJobValue.toFixed(2),

        totalPaid: totalPaid.toFixed(2),

        totalBalance: Math.max(totalJobValue - totalPaid, 0).toFixed(2),

        currency: organization.currency,
      },

      items,
    };
  }
}
