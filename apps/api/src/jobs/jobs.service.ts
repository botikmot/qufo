import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  createHash,
  randomBytes,
  createCipheriv,
  createDecipheriv,
} from 'node:crypto';

import { Prisma } from '../generated/prisma/client';

import type { JwtPayload } from '../auth/types/jwt-payload.type';
import type { TenantContext } from '../auth/types/tenant-context.type';

import { PrismaService } from '../prisma/prisma.service';

import { JobQueryDto } from './dto/job-query.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';
import { NotificationsService } from '../notifications/notifications.service';

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
    private readonly notificationsService: NotificationsService,
  ) {}

  private hashTrackingToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private readonly logger = new Logger(JobsService.name);

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

  private shouldNotifyCustomerOfJobStatus(status: JobStatus) {
    return ['IN_PROGRESS', 'COMPLETED', 'DELIVERED', 'CANCELLED'].includes(
      status,
    );
  }

  private encryptTrackingToken(token: string) {
    const keyBase64 = this.configService.getOrThrow<string>(
      'PUBLIC_LINK_ENCRYPTION_KEY',
    );

    const key = Buffer.from(keyBase64, 'base64');

    if (key.length !== 32) {
      throw new Error('PUBLIC_LINK_ENCRYPTION_KEY must decode to 32 bytes.');
    }

    const iv = randomBytes(12);

    const cipher = createCipheriv('aes-256-gcm', key, iv);

    const encrypted = Buffer.concat([
      cipher.update(token, 'utf8'),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return [
      iv.toString('base64url'),
      authTag.toString('base64url'),
      encrypted.toString('base64url'),
    ].join('.');
  }

  private decryptTrackingToken(encryptedValue: string) {
    const keyBase64 = this.configService.getOrThrow<string>(
      'PUBLIC_LINK_ENCRYPTION_KEY',
    );

    const key = Buffer.from(keyBase64, 'base64');

    if (key.length !== 32) {
      throw new Error('PUBLIC_LINK_ENCRYPTION_KEY must decode to 32 bytes.');
    }

    const [ivPart, authTagPart, encryptedPart] = encryptedValue.split('.');

    if (!ivPart || !authTagPart || !encryptedPart) {
      throw new Error('Invalid encrypted tracking token.');
    }

    const iv = Buffer.from(ivPart, 'base64url');

    const authTag = Buffer.from(authTagPart, 'base64url');

    const encrypted = Buffer.from(encryptedPart, 'base64url');

    const decipher = createDecipheriv('aes-256-gcm', key, iv);

    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }

  private async ensureTrackingLinkForNotification(
    jobId: string,
  ): Promise<string | null> {
    const job = await this.prisma.job.findUnique({
      where: {
        id: jobId,
      },

      select: {
        id: true,
        trackingEnabled: true,
        trackingTokenEncrypted: true,
        trackingCreatedAt: true,
      },
    });

    if (!job) {
      return null;
    }

    const webUrl = (
      this.configService.get<string>('WEB_URL') ?? 'http://localhost:3000'
    ).replace(/\/$/, '');

    /*
     * Existing active tracking link:
     * recover and return it.
     */
    if (job.trackingEnabled && job.trackingTokenEncrypted) {
      try {
        const token = this.decryptTrackingToken(job.trackingTokenEncrypted);

        return `${webUrl}/track/${token}`;
      } catch (error) {
        this.logger.error(
          `Failed to decrypt tracking token for job ${job.id}`,
          error instanceof Error ? error.stack : String(error),
        );

        return null;
      }
    }

    /*
     * Tracking existed before but was disabled intentionally.
     * Do not automatically re-enable it.
     */
    if (!job.trackingEnabled && job.trackingCreatedAt) {
      return null;
    }

    /*
     * Tracking has never been generated.
     * Create it automatically.
     */
    const token = randomBytes(32).toString('base64url');

    const trackingTokenHash = this.hashTrackingToken(token);

    const trackingTokenEncrypted = this.encryptTrackingToken(token);

    await this.prisma.job.update({
      where: {
        id: job.id,
      },

      data: {
        trackingTokenHash,
        trackingTokenEncrypted,
        trackingEnabled: true,
        trackingCreatedAt: new Date(),
      },
    });

    return `${webUrl}/track/${token}`;
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
          currency: true,

          total: true,

          createdAt: true,
          updatedAt: true,

          organization: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
              address: true,
              email: true,
              phone: true,
            },
          },

          customer: {
            select: {
              id: true,
              name: true,
              companyName: true,
              phone: true,
              email: true,
              address: true,
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
        organization: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            address: true,
            email: true,
            phone: true,
          },
        },
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
    const result = await this.prisma.$transaction(async (tx) => {
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

      if (nextStatus === 'CANCELLED' && !dto.message?.trim()) {
        throw new BadRequestException('A cancellation reason is required.');
      }

      const completedAt = nextStatus === 'COMPLETED' ? new Date() : null;

      /*
       * Conditional update prevents two concurrent requests
       * from changing the same old status.
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

      const publicMessage =
        dto.publicMessage?.trim() ||
        this.getDefaultPublicStatusMessage(nextStatus);

      await tx.jobUpdate.create({
        data: {
          jobId: job.id,

          createdById: user.sub,

          status: nextStatus,

          message,

          publicMessage,
        },
      });

      /*
       * Get the updated job while still inside the transaction.
       *
       * We include the customer's email and the encrypted
       * tracking token because they'll be needed after the
       * transaction commits.
       */
      const updatedJob = await tx.job.findUniqueOrThrow({
        where: {
          id: job.id,
        },

        include: {
          customer: {
            select: {
              id: true,
              name: true,
              companyName: true,
              email: true,
            },
          },

          organization: {
            select: {
              name: true,
              logoUrl: true,

              customerEmailNotificationsEnabled: true,
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

      return {
        job: updatedJob,

        notification: {
          previousStatus: currentStatus,

          status: nextStatus,

          publicMessage,
        },
      };
    });

    /*
     * IMPORTANT:
     *
     * Everything below happens AFTER the database transaction
     * has committed successfully.
     *
     * We don't want to send an email for a status update that
     * could still be rolled back.
     */

    const shouldSendCustomerEmail =
      this.notificationsService.canSendEmail() &&
      result.job.organization.customerEmailNotificationsEnabled === true &&
      Boolean(result.job.customer?.email) &&
      this.shouldNotifyCustomerOfJobStatus(result.notification.status);

    let trackingUrl: string | null = null;

    /*
     * Only create/restore the tracking
     * link when an email will actually
     * be sent.
     */
    if (shouldSendCustomerEmail) {
      trackingUrl = await this.ensureTrackingLinkForNotification(result.job.id);
    }

    if (shouldSendCustomerEmail && result.job.customer.email) {
      void this.notificationsService.sendJobStatusUpdated({
        organizationId: tenant.organizationId,
        recipientEmail: result.job.customer.email,

        customerName:
          result.job.customer.companyName ??
          result.job.customer.name ??
          'Customer',

        businessName: result.job.organization.name ?? 'QUFO',
        businessLogoUrl: result.job.organization.logoUrl ?? null,

        jobNumber: result.job.jobNumber,

        status: result.notification.status,

        message: result.notification.publicMessage,

        trackingUrl,
      });
    }

    return result.job;
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
    return this.ensureTrackingLink(tenant.organizationId, id);
  }

  async ensureTrackingLink(organizationId: string, id: string) {
    const job = await this.prisma.job.findFirst({
      where: {
        id,
        organizationId,
      },

      select: {
        id: true,
        jobNumber: true,
        trackingEnabled: true,
        trackingTokenEncrypted: true,
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found.');
    }

    const webUrl = (
      this.configService.get<string>('WEB_URL') ?? 'http://localhost:3000'
    ).replace(/\/+$/, '');

    if (job.trackingEnabled && job.trackingTokenEncrypted) {
      const existingToken = this.decryptTrackingToken(
        job.trackingTokenEncrypted,
      );

      return {
        jobNumber: job.jobNumber,

        trackingEnabled: true,

        trackingUrl: `${webUrl}/track/${existingToken}`,
      };
    }

    if (job.trackingEnabled) {
      throw new ConflictException(
        'The existing tracking link cannot be recovered. Disable tracking before generating a new link.',
      );
    }

    const token = randomBytes(32).toString('base64url');

    const trackingTokenHash = this.hashTrackingToken(token);

    const trackingTokenEncrypted = this.encryptTrackingToken(token);

    await this.prisma.job.update({
      where: {
        id: job.id,
      },

      data: {
        trackingTokenHash,
        trackingTokenEncrypted,
        trackingEnabled: true,
        trackingCreatedAt: new Date(),
      },
    });

    return {
      jobNumber: job.jobNumber,

      trackingEnabled: true,

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
        trackingTokenEncrypted: null,
        trackingCreatedAt: null,
      },
    });

    if (result.count !== 1) {
      throw new NotFoundException('Job not found.');
    }

    return {
      trackingEnabled: false,
      trackingUrl: null,
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
            address: true,
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
            imageUrl: true,

            warrantyDuration: true,
            warrantyUnit: true,
            warrantyTerms: true,
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

  async reopen(user: JwtPayload, tenant: TenantContext, id: string) {
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
        },
      });

      if (!job) {
        throw new NotFoundException('Job not found.');
      }

      if (job.status !== 'CANCELLED') {
        throw new BadRequestException('Only cancelled jobs can be reopened.');
      }

      /*
       * Find the most recent
       * non-cancelled status.
       *
       * This represents the job
       * state immediately before
       * the cancellation.
       */
      const previousUpdate = await tx.jobUpdate.findFirst({
        where: {
          jobId: job.id,

          status: {
            not: 'CANCELLED',
          },
        },

        orderBy: {
          createdAt: 'desc',
        },

        select: {
          status: true,
        },
      });

      /*
       * A newly-created job may
       * have been cancelled while
       * still PENDING before any
       * previous status update was
       * recorded.
       */
      const restoredStatus: JobStatus = previousUpdate?.status ?? 'PENDING';

      /*
       * Protect against concurrent
       * reopen/status requests.
       */
      const updateResult = await tx.job.updateMany({
        where: {
          id: job.id,

          organizationId: tenant.organizationId,

          status: 'CANCELLED',
        },

        data: {
          status: restoredStatus,

          completedAt: null,
        },
      });

      if (updateResult.count !== 1) {
        throw new BadRequestException(
          'Job status changed while this request was being processed. Please try again.',
        );
      }

      /*
       * Keep the cancellation and
       * reopen in the audit trail.
       */
      await tx.jobUpdate.create({
        data: {
          jobId: job.id,

          createdById: user.sub,

          status: restoredStatus,

          message: `Job reopened and restored to ${restoredStatus}.`,

          publicMessage: 'Your order is active again.',
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
}
