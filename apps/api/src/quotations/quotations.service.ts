import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from '../generated/prisma/client';

import type { JwtPayload } from '../auth/types/jwt-payload.type';
import type { TenantContext } from '../auth/types/tenant-context.type';

import { PrismaService } from '../prisma/prisma.service';

import { CreateQuotationDto } from './dto/create-quotation.dto';
import { QuotationQueryDto } from './dto/quotation-query.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'node:crypto';
import { RespondQuotationDto } from './dto/respond-quotation.dto';
import { ConvertQuotationToJobDto } from './dto/convert-quotation-to-job.dto';
import { CustomerQuotationFeedbackDto } from './dto/customer-quotation-feedback.dto';

@Injectable()
export class QuotationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private hashPublicToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private async getRespondableQuotation(token: string) {
    const tokenHash = this.hashPublicToken(token);

    const quotation = await this.prisma.quotation.findUnique({
      where: {
        publicTokenHash: tokenHash,
      },

      select: {
        id: true,
        organizationId: true,
        quotationNumber: true,
        sourceQuotationId: true,
        status: true,
        validUntil: true,
      },
    });

    if (!quotation) {
      throw new NotFoundException('Quotation not found.');
    }

    const latestQuotation = await this.findLatestQuotationRevision(quotation);

    if (latestQuotation && latestQuotation.id !== quotation.id) {
      throw new BadRequestException(
        'This quotation has been replaced by a newer revision and can no longer be responded to.',
      );
    }

    if (quotation.validUntil && quotation.validUntil < new Date()) {
      if (quotation.status === 'SENT' || quotation.status === 'VIEWED') {
        await this.prisma.quotation.update({
          where: {
            id: quotation.id,
          },

          data: {
            status: 'EXPIRED',
          },
        });
      }

      throw new BadRequestException('This quotation has expired.');
    }

    if (quotation.status !== 'SENT' && quotation.status !== 'VIEWED') {
      throw new BadRequestException(
        `This quotation can no longer be responded to because its status is ${quotation.status}.`,
      );
    }

    return quotation;
  }

  private async findLatestQuotationRevision(quotation: {
    id: string;
    organizationId: string;
    sourceQuotationId: string | null;
  }) {
    const rootQuotationId = quotation.sourceQuotationId ?? quotation.id;

    return this.prisma.quotation.findFirst({
      where: {
        organizationId: quotation.organizationId,

        OR: [
          {
            id: rootQuotationId,
          },
          {
            sourceQuotationId: rootQuotationId,
          },
        ],
      },

      orderBy: [
        {
          revisionNumber: 'desc',
        },
        {
          createdAt: 'desc',
        },
      ],

      select: {
        id: true,
        quotationNumber: true,
        revisionNumber: true,
        status: true,
      },
    });
  }

  async create(
    user: JwtPayload,
    tenant: TenantContext,
    dto: CreateQuotationDto,
  ) {
    await this.ensureCustomerExists(tenant.organizationId, dto.customerId);

    const totals = this.calculateTotals({
      items: dto.items,
      discountType: dto.discountType ?? 'NONE',
      discountValue: dto.discountValue ?? 0,
      taxRate: dto.taxRate ?? 0,
    });

    return this.prisma.$transaction(async (tx) => {
      const sequence = await tx.organizationSequence.upsert({
        where: {
          organizationId: tenant.organizationId,
        },

        create: {
          organizationId: tenant.organizationId,

          quotation: 1,
        },

        update: {
          quotation: {
            increment: 1,
          },
        },

        select: {
          quotation: true,
        },
      });

      const quotationNumber = `Q-${new Date().getFullYear()}-${String(
        sequence.quotation,
      ).padStart(6, '0')}`;

      return tx.quotation.create({
        data: {
          organizationId: tenant.organizationId,

          customerId: dto.customerId,

          createdById: user.sub,

          quotationNumber,

          validUntil: dto.validUntil ? new Date(dto.validUntil) : null,

          discountType: dto.discountType ?? 'NONE',

          discountValue: totals.discountValue,

          subtotal: totals.subtotal,

          discountAmount: totals.discountAmount,

          taxRate: totals.taxRate,

          taxAmount: totals.taxAmount,

          total: totals.total,

          notes: dto.notes?.trim() || null,

          terms: dto.terms?.trim() || null,

          items: {
            create: dto.items.map((item, index) => {
              const quantity = new Prisma.Decimal(item.quantity);

              const unitPrice = new Prisma.Decimal(item.unitPrice);

              return {
                name: item.name.trim(),

                description: item.description?.trim() || null,

                quantity,

                unit: item.unit.trim(),

                unitPrice,

                total: quantity.mul(unitPrice).toDecimalPlaces(2),

                sortOrder: index,
              };
            }),
          },
        },

        include: {
          customer: {
            select: {
              id: true,
              type: true,
              name: true,
              companyName: true,
              email: true,
              phone: true,
            },
          },

          items: {
            orderBy: {
              sortOrder: 'asc',
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
    });
  }

  async findAll(tenant: TenantContext, query: QuotationQueryDto) {
    const page = query.page;
    const limit = query.limit;

    const skip = (page - 1) * limit;

    const search = query.search?.trim();

    const where: Prisma.QuotationWhereInput = {
      organizationId: tenant.organizationId,

      ...(query.status
        ? {
            status: query.status as Prisma.QuotationWhereInput['status'],
          }
        : {}),

      ...(search
        ? {
            OR: [
              {
                quotationNumber: {
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
      this.prisma.quotation.findMany({
        where,

        skip,
        take: limit,

        orderBy: {
          createdAt: 'desc',
        },

        select: {
          id: true,
          quotationNumber: true,
          status: true,

          issueDate: true,
          validUntil: true,

          subtotal: true,
          discountAmount: true,
          taxAmount: true,
          total: true,
          customerResponseNote: true,
          changesRequestedAt: true,
          rejectedAt: true,
          revisionNumber: true,
          sourceQuotationId: true,

          createdAt: true,
          updatedAt: true,

          customer: {
            select: {
              id: true,
              name: true,
              companyName: true,
            },
          },

          _count: {
            select: {
              items: true,
            },
          },
        },
      }),

      this.prisma.quotation.count({
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
    const quotation = await this.prisma.quotation.findFirst({
      where: {
        id,

        organizationId: tenant.organizationId,
      },

      include: {
        customer: true,

        items: {
          orderBy: {
            sortOrder: 'asc',
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

    if (!quotation) {
      throw new NotFoundException('Quotation not found.');
    }

    const rootQuotationId = quotation.sourceQuotationId ?? quotation.id;

    const latestQuotation = await this.prisma.quotation.findFirst({
      where: {
        organizationId: tenant.organizationId,

        OR: [
          {
            id: rootQuotationId,
          },

          {
            sourceQuotationId: rootQuotationId,
          },
        ],
      },

      orderBy: [
        {
          revisionNumber: 'desc',
        },

        {
          createdAt: 'desc',
        },
      ],

      select: {
        id: true,

        quotationNumber: true,

        revisionNumber: true,

        status: true,
      },
    });

    return {
      ...quotation,

      revisionInfo: {
        isLatest: latestQuotation?.id === quotation.id,

        latestQuotationId: latestQuotation?.id ?? quotation.id,

        latestQuotationNumber:
          latestQuotation?.quotationNumber ?? quotation.quotationNumber,

        latestRevisionNumber:
          latestQuotation?.revisionNumber ?? quotation.revisionNumber ?? 1,
      },
    };
  }

  async update(tenant: TenantContext, id: string, dto: UpdateQuotationDto) {
    const quotation = await this.prisma.quotation.findFirst({
      where: {
        id,

        organizationId: tenant.organizationId,
      },

      include: {
        items: true,
      },
    });

    if (!quotation) {
      throw new NotFoundException('Quotation not found.');
    }

    if (quotation.status !== 'DRAFT') {
      throw new BadRequestException('Only draft quotations can be edited.');
    }

    if (dto.customerId) {
      await this.ensureCustomerExists(tenant.organizationId, dto.customerId);
    }

    const items =
      dto.items ??
      quotation.items.map((item) => ({
        name: item.name,

        description: item.description ?? undefined,

        quantity: item.quantity.toNumber(),

        unit: item.unit,

        unitPrice: item.unitPrice.toNumber(),
      }));

    const discountType = dto.discountType ?? quotation.discountType;

    const discountValue =
      dto.discountValue ?? quotation.discountValue.toNumber();

    const taxRate = dto.taxRate ?? quotation.taxRate.toNumber();

    const totals = this.calculateTotals({
      items,
      discountType,
      discountValue,
      taxRate,
    });

    return this.prisma.$transaction(async (tx) => {
      if (dto.items) {
        await tx.quotationItem.deleteMany({
          where: {
            quotationId: id,
          },
        });
      }

      return tx.quotation.update({
        where: {
          id,
        },

        data: {
          ...(dto.customerId !== undefined && {
            customerId: dto.customerId,
          }),

          ...(dto.validUntil !== undefined && {
            validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
          }),

          ...(dto.discountType !== undefined && {
            discountType: dto.discountType,
          }),

          discountValue: totals.discountValue,

          subtotal: totals.subtotal,

          discountAmount: totals.discountAmount,

          taxRate: totals.taxRate,

          taxAmount: totals.taxAmount,

          total: totals.total,

          ...(dto.notes !== undefined && {
            notes: dto.notes.trim() || null,
          }),

          ...(dto.terms !== undefined && {
            terms: dto.terms.trim() || null,
          }),

          ...(dto.items
            ? {
                items: {
                  create: dto.items.map((item, index) => {
                    const quantity = new Prisma.Decimal(item.quantity);

                    const unitPrice = new Prisma.Decimal(item.unitPrice);

                    return {
                      name: item.name.trim(),

                      description: item.description?.trim() || null,

                      quantity,

                      unit: item.unit.trim(),

                      unitPrice,

                      total: quantity.mul(unitPrice).toDecimalPlaces(2),

                      sortOrder: index,
                    };
                  }),
                },
              }
            : {}),
        },

        include: {
          customer: true,

          items: {
            orderBy: {
              sortOrder: 'asc',
            },
          },
        },
      });
    });
  }

  private calculateTotals(input: {
    items: {
      quantity: number;
      unitPrice: number;
    }[];

    discountType: 'NONE' | 'FIXED' | 'PERCENTAGE';

    discountValue: number;

    taxRate: number;
  }) {
    const subtotal = input.items.reduce((sum, item) => {
      const lineTotal = new Prisma.Decimal(item.quantity)
        .mul(item.unitPrice)
        .toDecimalPlaces(2);

      return sum.plus(lineTotal);
    }, new Prisma.Decimal(0));

    const discountValue = new Prisma.Decimal(input.discountValue);

    let discountAmount = new Prisma.Decimal(0);

    if (input.discountType === 'FIXED') {
      discountAmount = discountValue;
    }

    if (input.discountType === 'PERCENTAGE') {
      if (discountValue.greaterThan(100)) {
        throw new BadRequestException('Discount percentage cannot exceed 100.');
      }

      discountAmount = subtotal.mul(discountValue).div(100);
    }

    if (discountAmount.greaterThan(subtotal)) {
      discountAmount = subtotal;
    }

    discountAmount = discountAmount.toDecimalPlaces(2);

    const taxableAmount = subtotal.minus(discountAmount);

    const taxRate = new Prisma.Decimal(input.taxRate);

    const taxAmount = taxableAmount.mul(taxRate).div(100).toDecimalPlaces(2);

    const total = taxableAmount.plus(taxAmount).toDecimalPlaces(2);

    return {
      subtotal: subtotal.toDecimalPlaces(2),

      discountValue,
      discountAmount,

      taxRate,
      taxAmount,
      total,
    };
  }

  private async ensureCustomerExists(
    organizationId: string,
    customerId: string,
  ) {
    const customer = await this.prisma.customer.findFirst({
      where: {
        id: customerId,
        organizationId,
        status: 'ACTIVE',
      },

      select: {
        id: true,
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found.');
    }

    return customer;
  }

  async send(tenant: TenantContext, id: string) {
    const quotation = await this.prisma.quotation.findFirst({
      where: {
        id,
        organizationId: tenant.organizationId,
      },

      select: {
        id: true,
        status: true,
        validUntil: true,
      },
    });

    if (!quotation) {
      throw new NotFoundException('Quotation not found.');
    }

    if (quotation.status !== 'DRAFT') {
      throw new BadRequestException('Only draft quotations can be sent.');
    }

    if (quotation.validUntil && quotation.validUntil < new Date()) {
      throw new BadRequestException('This quotation has already expired.');
    }

    const token = randomBytes(32).toString('base64url');

    const tokenHash = this.hashPublicToken(token);

    const sentAt = new Date();

    const updated = await this.prisma.quotation.update({
      where: {
        id,
      },

      data: {
        status: 'SENT',
        publicTokenHash: tokenHash,
        sentAt,
      },

      select: {
        id: true,
        quotationNumber: true,
        status: true,
        sentAt: true,
      },
    });

    const webUrl =
      this.configService.get<string>('WEB_URL') ?? 'http://localhost:3000';

    return {
      ...updated,

      publicUrl: `${webUrl}/quote/${token}`,
    };
  }

  async findPublicQuotation(token: string) {
    const tokenHash = this.hashPublicToken(token);

    let quotation = await this.prisma.quotation.findUnique({
      where: {
        publicTokenHash: tokenHash,
      },

      include: {
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
        },
      },
    });

    if (!quotation) {
      throw new NotFoundException('Quotation not found.');
    }

    const latestQuotation = await this.findLatestQuotationRevision(quotation);

    const isLatestRevision =
      !latestQuotation || latestQuotation.id === quotation.id;

    if (
      isLatestRevision &&
      quotation.validUntil &&
      quotation.validUntil < new Date() &&
      (quotation.status === 'SENT' || quotation.status === 'VIEWED')
    ) {
      quotation = await this.prisma.quotation.update({
        where: {
          id: quotation.id,
        },

        data: {
          status: 'EXPIRED',
        },

        include: {
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
          },
        },
      });
    }

    if (isLatestRevision && quotation.status === 'SENT') {
      quotation = await this.prisma.quotation.update({
        where: {
          id: quotation.id,
        },

        data: {
          status: 'VIEWED',
          viewedAt: new Date(),
        },

        include: {
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
          },
        },
      });
    }

    return {
      quotationNumber: quotation.quotationNumber,

      status: quotation.status,

      issueDate: quotation.issueDate,

      validUntil: quotation.validUntil,

      organization: quotation.organization,

      customer: quotation.customer,

      items: quotation.items,

      subtotal: quotation.subtotal,

      discountType: quotation.discountType,

      discountValue: quotation.discountValue,

      discountAmount: quotation.discountAmount,

      taxRate: quotation.taxRate,

      taxAmount: quotation.taxAmount,

      total: quotation.total,

      notes: quotation.notes,

      terms: quotation.terms,

      customerResponseNote: quotation.customerResponseNote,
      revisionInfo: {
        isLatest: isLatestRevision,

        latestQuotationNumber:
          latestQuotation?.quotationNumber ?? quotation.quotationNumber,

        latestRevisionNumber:
          latestQuotation?.revisionNumber ?? quotation.revisionNumber ?? 1,
      },
    };
  }

  async approvePublicQuotation(token: string, dto: RespondQuotationDto) {
    const quotation = await this.getRespondableQuotation(token);

    const approvedAt = new Date();

    const updated = await this.prisma.quotation.update({
      where: {
        id: quotation.id,
      },

      data: {
        status: 'APPROVED',

        approvedAt,

        customerResponseNote: dto.note?.trim() || null,
      },

      select: {
        quotationNumber: true,
        status: true,
        approvedAt: true,
      },
    });

    return {
      message: 'Quotation approved successfully.',

      quotation: updated,
    };
  }

  async rejectPublicQuotation(
    token: string,
    dto: CustomerQuotationFeedbackDto,
  ) {
    const quotation = await this.getRespondableQuotation(token);

    const rejectedAt = new Date();

    const updated = await this.prisma.quotation.update({
      where: {
        id: quotation.id,
      },

      data: {
        status: 'REJECTED',

        rejectedAt,

        customerResponseNote: dto.note.trim(),
      },

      select: {
        quotationNumber: true,
        status: true,
        rejectedAt: true,
        customerResponseNote: true,
      },
    });

    return {
      message: 'Quotation declined.',

      quotation: updated,
    };
  }

  async convertToJob(
    user: JwtPayload,
    tenant: TenantContext,
    id: string,
    dto: ConvertQuotationToJobDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const quotation = await tx.quotation.findFirst({
        where: {
          id,
          organizationId: tenant.organizationId,
        },

        include: {
          customer: {
            select: {
              id: true,
              name: true,
              companyName: true,
            },
          },

          items: {
            orderBy: {
              sortOrder: 'asc',
            },
          },

          job: {
            select: {
              id: true,
              jobNumber: true,
            },
          },
        },
      });

      if (!quotation) {
        throw new NotFoundException('Quotation not found.');
      }

      if (quotation.job) {
        throw new BadRequestException(
          `This quotation has already been converted to job ${quotation.job.jobNumber}.`,
        );
      }

      if (quotation.status !== 'APPROVED') {
        throw new BadRequestException(
          'Only approved quotations can be converted to a job.',
        );
      }

      /*
       * Claim the quotation for conversion.
       *
       * If another request converts it at the same time,
       * only one request should successfully change
       * APPROVED → CONVERTED.
       */
      const conversion = await tx.quotation.updateMany({
        where: {
          id: quotation.id,
          organizationId: tenant.organizationId,
          status: 'APPROVED',
        },

        data: {
          status: 'CONVERTED',
        },
      });

      if (conversion.count !== 1) {
        throw new BadRequestException(
          'This quotation has already been converted or is no longer approved.',
        );
      }

      const sequence = await tx.organizationSequence.upsert({
        where: {
          organizationId: tenant.organizationId,
        },

        create: {
          organizationId: tenant.organizationId,

          job: 1,
        },

        update: {
          job: {
            increment: 1,
          },
        },

        select: {
          job: true,
        },
      });

      const jobNumber = `JOB-${new Date().getFullYear()}-${String(
        sequence.job,
      ).padStart(6, '0')}`;

      const defaultTitle = quotation.items[0]?.name
        ? `${quotation.items[0].name} - ${quotation.customer.companyName ?? quotation.customer.name}`
        : `Job for ${quotation.customer.companyName ?? quotation.customer.name}`;

      const job = await tx.job.create({
        data: {
          organizationId: tenant.organizationId,

          customerId: quotation.customerId,

          quotationId: quotation.id,

          createdById: user.sub,

          jobNumber,

          title: dto.title?.trim() || defaultTitle,

          description: dto.description?.trim() || null,

          priority: dto.priority ?? 'NORMAL',

          dueDate: dto.dueDate ? new Date(dto.dueDate) : null,

          subtotal: quotation.subtotal,

          discountAmount: quotation.discountAmount,

          taxAmount: quotation.taxAmount,

          total: quotation.total,

          items: {
            create: quotation.items.map((item) => ({
              name: item.name,

              description: item.description,

              quantity: item.quantity,

              unit: item.unit,

              unitPrice: item.unitPrice,

              total: item.total,

              sortOrder: item.sortOrder,
            })),
          },

          updates: {
            create: {
              status: 'PENDING',

              message: `Job created from quotation ${quotation.quotationNumber}.`,

              publicMessage:
                'Your quotation has been approved and your job has been confirmed.',

              createdById: user.sub,
            },
          },
        },

        include: {
          customer: {
            select: {
              id: true,
              name: true,
              companyName: true,
              email: true,
              phone: true,
            },
          },

          quotation: {
            select: {
              id: true,
              quotationNumber: true,
              status: true,
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
          },
        },
      });

      return {
        message: 'Quotation converted to job successfully.',

        job,
      };
    });
  }

  async requestChangesPublicQuotation(
    token: string,
    dto: CustomerQuotationFeedbackDto,
  ) {
    const quotation = await this.getRespondableQuotation(token);

    const changesRequestedAt = new Date();

    const updated = await this.prisma.quotation.update({
      where: {
        id: quotation.id,
      },

      data: {
        status: 'CHANGES_REQUESTED',

        changesRequestedAt,

        customerResponseNote: dto.note.trim(),
      },

      select: {
        quotationNumber: true,
        status: true,
        changesRequestedAt: true,
        customerResponseNote: true,
      },
    });

    return {
      message: 'Change request submitted successfully.',

      quotation: updated,
    };
  }

  async createRevision(user: JwtPayload, tenant: TenantContext, id: string) {
    return this.prisma.$transaction(async (tx) => {
      const quotation = await tx.quotation.findFirst({
        where: {
          id,

          organizationId: tenant.organizationId,
        },

        include: {
          items: {
            orderBy: {
              sortOrder: 'asc',
            },
          },
        },
      });

      if (!quotation) {
        throw new NotFoundException('Quotation not found.');
      }

      if (
        quotation.status !== 'CHANGES_REQUESTED' &&
        quotation.status !== 'REJECTED'
      ) {
        throw new BadRequestException(
          'Only quotations with requested changes or rejected quotations can be revised.',
        );
      }

      const rootQuotationId = quotation.sourceQuotationId ?? quotation.id;

      const latestQuotation = await tx.quotation.findFirst({
        where: {
          organizationId: tenant.organizationId,

          OR: [
            {
              id: rootQuotationId,
            },
            {
              sourceQuotationId: rootQuotationId,
            },
          ],
        },

        orderBy: {
          revisionNumber: 'desc',
        },

        select: {
          id: true,
          quotationNumber: true,
          revisionNumber: true,
          status: true,
        },
      });

      if (!latestQuotation) {
        throw new NotFoundException('Quotation revision history not found.');
      }

      if (latestQuotation.id !== quotation.id) {
        throw new BadRequestException(
          `This quotation is no longer the latest revision. The current revision is ${latestQuotation.quotationNumber}.`,
        );
      }

      /*
       * Prevent multiple open draft
       * revisions for the same quote.
       */
      const existingDraft = await tx.quotation.findFirst({
        where: {
          organizationId: tenant.organizationId,

          sourceQuotationId: rootQuotationId,

          status: 'DRAFT',
        },

        select: {
          id: true,
          quotationNumber: true,
        },
      });

      if (existingDraft) {
        throw new BadRequestException(
          `A draft revision already exists: ${existingDraft.quotationNumber}.`,
        );
      }

      /*
       * Get original quotation number.
       */
      const rootQuotation = quotation.sourceQuotationId
        ? await tx.quotation.findUnique({
            where: {
              id: quotation.sourceQuotationId,
            },

            select: {
              quotationNumber: true,
            },
          })
        : {
            quotationNumber: quotation.quotationNumber,
          };

      if (!rootQuotation) {
        throw new NotFoundException('Original quotation not found.');
      }

      /*
       * Find latest revision number.
       */
      const revisions = await tx.quotation.aggregate({
        where: {
          organizationId: tenant.organizationId,

          OR: [
            {
              id: rootQuotationId,
            },

            {
              sourceQuotationId: rootQuotationId,
            },
          ],
        },

        _max: {
          revisionNumber: true,
        },
      });

      const nextRevision = (revisions._max.revisionNumber ?? 1) + 1;

      const quotationNumber = `${rootQuotation.quotationNumber}-R${nextRevision}`;

      const revisedQuotation = await tx.quotation.create({
        data: {
          organizationId: tenant.organizationId,

          customerId: quotation.customerId,

          createdById: user.sub,

          quotationNumber,

          revisionNumber: nextRevision,

          sourceQuotationId: rootQuotationId,

          status: 'DRAFT',

          /*
           * New revision starts now.
           */
          issueDate: new Date(),

          validUntil: quotation.validUntil,

          subtotal: quotation.subtotal,

          discountType: quotation.discountType,

          discountValue: quotation.discountValue,

          discountAmount: quotation.discountAmount,

          taxRate: quotation.taxRate,

          taxAmount: quotation.taxAmount,

          total: quotation.total,

          notes: quotation.notes,

          terms: quotation.terms,

          items: {
            create: quotation.items.map((item) => ({
              name: item.name,

              description: item.description,

              quantity: item.quantity,

              unit: item.unit,

              unitPrice: item.unitPrice,

              total: item.total,

              sortOrder: item.sortOrder,
            })),
          },
        },

        include: {
          customer: true,

          items: {
            orderBy: {
              sortOrder: 'asc',
            },
          },
        },
      });

      return {
        message: 'Quotation revision created successfully.',

        quotation: revisedQuotation,

        requestedChanges: {
          fromQuotation: quotation.quotationNumber,

          note: quotation.customerResponseNote,
        },
      };
    });
  }
}
