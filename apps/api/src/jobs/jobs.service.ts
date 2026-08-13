import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { createHash, randomBytes } from 'node:crypto';

import { Prisma } from '../generated/prisma/client';

import type { JwtPayload } from '../auth/types/jwt-payload.type';
import type { TenantContext } from '../auth/types/tenant-context.type';

import { PrismaService } from '../prisma/prisma.service';

import { JobQueryDto } from './dto/job-query.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';

type JobStatus =
  | 'PENDING'
  | 'QUEUED'
  | 'IN_PROGRESS'
  | 'FOR_REVIEW'
  | 'READY'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

@Injectable()
export class JobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private hashTrackingToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private getPublicProgress(status: JobStatus) {
    switch (status) {
      case 'PENDING':
        return 10;

      case 'QUEUED':
        return 20;

      case 'IN_PROGRESS':
        return 50;

      case 'FOR_REVIEW':
        return 70;

      case 'READY':
        return 85;

      case 'DELIVERED':
        return 95;

      case 'COMPLETED':
        return 100;

      case 'CANCELLED':
        return 0;
    }
  }

  private getDefaultPublicStatusMessage(status: JobStatus) {
    switch (status) {
      case 'PENDING':
        return 'Your job has been confirmed.';

      case 'QUEUED':
        return 'Your job has been added to the production queue.';

      case 'IN_PROGRESS':
        return 'Your job is currently in production.';

      case 'FOR_REVIEW':
        return 'Your job is undergoing quality review.';

      case 'READY':
        return 'Your job is ready for pickup or delivery.';

      case 'DELIVERED':
        return 'Your job has been delivered.';

      case 'COMPLETED':
        return 'Your job has been completed.';

      case 'CANCELLED':
        return 'This job has been cancelled.';
    }
  }

  async findAll(tenant: TenantContext, query: JobQueryDto) {
    const page = query.page;
    const limit = query.limit;

    const skip = (page - 1) * limit;

    const search = query.search?.trim();

    const where: Prisma.JobWhereInput = {
      organizationId: tenant.organizationId,

      ...(query.status
        ? {
            status: query.status,
          }
        : {}),

      ...(query.priority
        ? {
            priority: query.priority,
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
                jobNumber: {
                  contains: search,
                  mode: 'insensitive',
                },
              },

              {
                title: {
                  contains: search,
                  mode: 'insensitive',
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
      this.prisma.job.findMany({
        where,

        skip,
        take: limit,

        orderBy: [
          {
            createdAt: 'desc',
          },
        ],

        select: {
          id: true,
          jobNumber: true,

          title: true,
          description: true,

          status: true,
          priority: true,

          dueDate: true,
          completedAt: true,

          total: true,

          createdAt: true,
          updatedAt: true,

          customer: {
            select: {
              id: true,
              name: true,
              companyName: true,
              phone: true,
            },
          },

          quotation: {
            select: {
              id: true,
              quotationNumber: true,
            },
          },

          _count: {
            select: {
              items: true,
              updates: true,
            },
          },
        },
      }),

      this.prisma.job.count({
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
    const job = await this.prisma.job.findFirst({
      where: {
        id,
        organizationId: tenant.organizationId,
      },

      include: {
        customer: true,

        quotation: {
          select: {
            id: true,
            quotationNumber: true,
            status: true,

            approvedAt: true,
          },
        },

        items: {
          orderBy: {
            sortOrder: 'asc',
          },
        },

        updates: {
          orderBy: {
            createdAt: 'asc',
          },

          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
              },
            },
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

    if (!job) {
      throw new NotFoundException('Job not found.');
    }

    return job;
  }

  async update(tenant: TenantContext, id: string, dto: UpdateJobDto) {
    const job = await this.getJob(tenant.organizationId, id);

    if (job.status === 'COMPLETED' || job.status === 'CANCELLED') {
      throw new BadRequestException(
        `A ${job.status.toLowerCase()} job can no longer be edited.`,
      );
    }

    return this.prisma.job.update({
      where: {
        id,
      },

      data: {
        ...(dto.title !== undefined && {
          title: dto.title.trim(),
        }),

        ...(dto.description !== undefined && {
          description: dto.description.trim() || null,
        }),

        ...(dto.dueDate !== undefined && {
          dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        }),

        ...(dto.priority !== undefined && {
          priority: dto.priority,
        }),
      },

      include: {
        customer: {
          select: {
            id: true,
            name: true,
            companyName: true,
          },
        },

        quotation: {
          select: {
            id: true,
            quotationNumber: true,
          },
        },
      },
    });
  }

  async updateStatus(
    user: JwtPayload,
    tenant: TenantContext,
    id: string,
    dto: UpdateJobStatusDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const job = await tx.job.findFirst({
        where: {
          id,

          organizationId: tenant.organizationId,
        },

        select: {
          id: true,
          jobNumber: true,
          status: true,
          completedAt: true,
        },
      });

      if (!job) {
        throw new NotFoundException('Job not found.');
      }

      const currentStatus = job.status;

      const nextStatus = dto.status as JobStatus;

      if (currentStatus === nextStatus) {
        throw new BadRequestException(`Job is already ${currentStatus}.`);
      }

      if (!this.isValidTransition(currentStatus, nextStatus)) {
        throw new BadRequestException(
          `Job cannot move from ${currentStatus} to ${nextStatus}.`,
        );
      }

      const completedAt = nextStatus === 'COMPLETED' ? new Date() : null;

      /*
       * Conditional update prevents two concurrent
       * requests from changing the same old status.
       */
      const updateResult = await tx.job.updateMany({
        where: {
          id: job.id,

          organizationId: tenant.organizationId,

          status: currentStatus,
        },

        data: {
          status: nextStatus,

          ...(nextStatus === 'COMPLETED'
            ? {
                completedAt,
              }
            : {}),
        },
      });

      if (updateResult.count !== 1) {
        throw new BadRequestException(
          'Job status changed while this request was being processed. Please try again.',
        );
      }

      const message =
        dto.message?.trim() ||
        this.getDefaultStatusMessage(currentStatus, nextStatus);

      await tx.jobUpdate.create({
        data: {
          jobId: job.id,
          createdById: user.sub,

          status: nextStatus,

          message,

          publicMessage:
            dto.publicMessage?.trim() ||
            this.getDefaultPublicStatusMessage(nextStatus),
        },
      });

      return tx.job.findUnique({
        where: {
          id: job.id,
        },

        include: {
          customer: {
            select: {
              id: true,
              name: true,
              companyName: true,
            },
          },

          updates: {
            orderBy: {
              createdAt: 'asc',
            },

            include: {
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
    });
  }

  private async getJob(organizationId: string, id: string) {
    const job = await this.prisma.job.findFirst({
      where: {
        id,
        organizationId,
      },

      select: {
        id: true,
        jobNumber: true,
        status: true,
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found.');
    }

    return job;
  }

  private isValidTransition(currentStatus: JobStatus, nextStatus: JobStatus) {
    const transitions: Record<JobStatus, JobStatus[]> = {
      PENDING: ['QUEUED', 'CANCELLED'],

      QUEUED: ['IN_PROGRESS', 'CANCELLED'],

      IN_PROGRESS: ['FOR_REVIEW', 'READY', 'CANCELLED'],

      FOR_REVIEW: ['IN_PROGRESS', 'READY', 'CANCELLED'],

      READY: ['DELIVERED', 'COMPLETED', 'CANCELLED'],

      DELIVERED: ['COMPLETED'],

      COMPLETED: [],

      CANCELLED: [],
    };

    return transitions[currentStatus].includes(nextStatus);
  }

  private getDefaultStatusMessage(
    currentStatus: JobStatus,
    nextStatus: JobStatus,
  ) {
    if (currentStatus === 'FOR_REVIEW' && nextStatus === 'IN_PROGRESS') {
      return 'Job returned to production for revision.';
    }

    switch (nextStatus) {
      case 'QUEUED':
        return 'Job added to the production queue.';

      case 'IN_PROGRESS':
        return 'Production started.';

      case 'FOR_REVIEW':
        return 'Job is ready for review.';

      case 'READY':
        return 'Job is ready for pickup or delivery.';

      case 'DELIVERED':
        return 'Job has been delivered.';

      case 'COMPLETED':
        return 'Job completed successfully.';

      case 'CANCELLED':
        return 'Job was cancelled.';

      default:
        return `Job moved from ${currentStatus} to ${nextStatus}.`;
    }
  }

  async generateTrackingLink(tenant: TenantContext, id: string) {
    const job = await this.prisma.job.findFirst({
      where: {
        id,
        organizationId: tenant.organizationId,
      },

      select: {
        id: true,
        jobNumber: true,
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found.');
    }

    const token = randomBytes(32).toString('base64url');

    const trackingTokenHash = this.hashTrackingToken(token);

    await this.prisma.job.update({
      where: {
        id: job.id,
      },

      data: {
        trackingTokenHash,
        trackingEnabled: true,
        trackingCreatedAt: new Date(),
      },
    });

    const webUrl =
      this.configService.get<string>('WEB_URL') ?? 'http://localhost:3000';

    return {
      jobNumber: job.jobNumber,

      trackingUrl: `${webUrl}/track/${token}`,
    };
  }

  async disableTracking(tenant: TenantContext, id: string) {
    const result = await this.prisma.job.updateMany({
      where: {
        id,
        organizationId: tenant.organizationId,
      },

      data: {
        trackingEnabled: false,
        trackingTokenHash: null,
        trackingCreatedAt: null,
      },
    });

    if (result.count !== 1) {
      throw new NotFoundException('Job not found.');
    }

    return {
      message: 'Public job tracking disabled.',
    };
  }

  async findPublicJob(token: string) {
    const tokenHash = this.hashTrackingToken(token);

    const job = await this.prisma.job.findFirst({
      where: {
        trackingTokenHash: tokenHash,
        trackingEnabled: true,
      },

      select: {
        jobNumber: true,

        title: true,
        status: true,

        dueDate: true,
        completedAt: true,

        createdAt: true,

        organization: {
          select: {
            name: true,
            logoUrl: true,
            phone: true,
            email: true,
          },
        },

        customer: {
          select: {
            name: true,
            companyName: true,
          },
        },

        items: {
          orderBy: {
            sortOrder: 'asc',
          },

          select: {
            name: true,
            description: true,
            quantity: true,
            unit: true,
          },
        },

        updates: {
          orderBy: {
            createdAt: 'asc',
          },

          select: {
            status: true,
            publicMessage: true,
            createdAt: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Job tracking information not found.');
    }

    return {
      jobNumber: job.jobNumber,

      title: job.title,

      status: job.status,

      progress: this.getPublicProgress(job.status),

      dueDate: job.dueDate,

      completedAt: job.completedAt,

      createdAt: job.createdAt,

      organization: job.organization,

      customer: {
        name: job.customer.companyName ?? job.customer.name,
      },

      items: job.items,

      timeline: job.updates.map((update) => ({
        status: update.status,

        message:
          update.publicMessage ??
          this.getDefaultPublicStatusMessage(update.status),

        createdAt: update.createdAt,
      })),
    };
  }
}
