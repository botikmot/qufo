import {
  BadRequestException,
  Injectable,
  Logger,
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
import {
  createHash,
  randomBytes,
  createCipheriv,
  createDecipheriv,
} from 'node:crypto';
import { RespondQuotationDto } from './dto/respond-quotation.dto';
import { ConvertQuotationToJobDto } from './dto/convert-quotation-to-job.dto';
import { CustomerQuotationFeedbackDto } from './dto/customer-quotation-feedback.dto';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { JobsService } from '../jobs/jobs.service';

@Injectable()
export class QuotationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly realtimeGateway: RealtimeGateway,
    private readonly notificationsService: NotificationsService,
    private readonly jobsService: JobsService,
  ) {}

  private hashPublicToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private readonly logger = new Logger(QuotationsService.name);

  private getPublicLinkEncryptionKey() {
    const encodedKey = this.configService.getOrThrow<string>(
      'PUBLIC_LINK_ENCRYPTION_KEY',
    );

    const key = Buffer.from(encodedKey, 'base64');

    if (key.length !== 32) {
      throw new Error(
        'PUBLIC_LINK_ENCRYPTION_KEY must decode to exactly 32 bytes.',
      );
    }

    return key;
  }

  private encryptPublicToken(token: string) {
    const key = this.getPublicLinkEncryptionKey();

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

  private decryptPublicToken(value: string) {
    const [ivValue, authTagValue, encryptedValue] = value.split('.');

    if (!ivValue || !authTagValue || !encryptedValue) {
      throw new Error('Invalid encrypted public token.');
    }

    const decipher = createDecipheriv(
      'aes-256-gcm',
      this.getPublicLinkEncryptionKey(),
      Buffer.from(ivValue, 'base64url'),
    );

    decipher.setAuthTag(Buffer.from(authTagValue, 'base64url'));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedValue, 'base64url')),

      decipher.final(),
    ]);

    return decrypted.toString('utf8');
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
      const organization = await tx.organization.findUnique({
        where: {
          id: tenant.organizationId,
        },
        select: {
          id: true,
          currency: true,
          quotationTerms: true,
          quotationFooterNote: true,
        },
      });

      if (!organization) {
        throw new NotFoundException('Organization not found.');
      }

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

          currency: organization.currency,

          validUntil: dto.validUntil ? new Date(dto.validUntil) : null,

          discountType: dto.discountType ?? 'NONE',

          discountValue: totals.discountValue,

          subtotal: totals.subtotal,

          discountAmount: totals.discountAmount,

          taxRate: totals.taxRate,

          taxAmount: totals.taxAmount,

          total: totals.total,

          notes: dto.notes?.trim() || null,

          terms:
            dto.terms?.trim() || organization.quotationTerms?.trim() || null,

          footerNote:
            dto.footerNote?.trim() ||
            organization.quotationFooterNote?.trim() ||
            null,

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
                imageUrl: item.imageUrl?.trim() || null,
                imageKey: item.imageKey?.trim() || null,
                warrantyDuration: item.warrantyDuration ?? null,
                warrantyUnit: item.warrantyUnit ?? null,
                warrantyTerms: item.warrantyTerms?.trim() || null,
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
              email: true,
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

          currency: true,

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
        organization: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            logoUrl: true,
            quotationSignatureUrl: true,
            quotationSignatoryName: true,
            quotationSignatoryTitle: true,
            showQuotationSignature: true,
          },
        },

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
            email: true,
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
        imageUrl: item.imageUrl ?? undefined,

        imageKey: item.imageKey ?? undefined,

        warrantyDuration: item.warrantyDuration ?? undefined,

        warrantyUnit: item.warrantyUnit ?? undefined,

        warrantyTerms: item.warrantyTerms ?? undefined,
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

          footerNote:
            dto.footerNote !== undefined
              ? dto.footerNote.trim() || null
              : undefined,

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
                      imageUrl: item.imageUrl?.trim() || null,

                      imageKey: item.imageKey?.trim() || null,

                      warrantyDuration: item.warrantyDuration ?? null,

                      warrantyUnit: item.warrantyUnit ?? null,

                      warrantyTerms: item.warrantyTerms?.trim() || null,

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

  async send(tenant: TenantContext, id: string, pdfFile?: Express.Multer.File) {
    const quotation = await this.prisma.quotation.findFirst({
      where: {
        id,
        organizationId: tenant.organizationId,
      },

      select: {
        id: true,
        status: true,
        validUntil: true,

        customer: {
          select: {
            name: true,
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

    const tokenEncrypted = this.encryptPublicToken(token);

    const sentAt = new Date();

    const updated = await this.prisma.quotation.update({
      where: {
        id,
      },

      data: {
        status: 'SENT',
        publicTokenHash: tokenHash,
        publicTokenEncrypted: tokenEncrypted,
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

    const publicUrl = `${webUrl}/quote/${token}`;

    const customerEmailAllowed =
      this.notificationsService.canSendEmail() &&
      quotation.organization.customerEmailNotificationsEnabled === true;

    const customerEmail = quotation.customer?.email ?? null;

    let emailSent = false;

    if (customerEmailAllowed && customerEmail) {
      emailSent = await this.notificationsService.sendQuotationToCustomer({
        recipientEmail: customerEmail,

        customerName: quotation.customer.name ?? 'Customer',

        businessName: quotation.organization.name ?? 'QUFO',

        businessLogoUrl: quotation.organization.logoUrl ?? null,

        quotationNumber: updated.quotationNumber,

        publicUrl,

        validUntil: quotation.validUntil,

        pdfAttachment: pdfFile
          ? {
              filename: `${updated.quotationNumber}.pdf`,

              content: pdfFile.buffer,
            }
          : undefined,
      });
    }

    return {
      ...updated,

      publicUrl,

      email: {
        attempted: Boolean(quotation.customer?.email),

        sent: emailSent,

        recipient: quotation.customer?.email ?? null,
        skippedReason: !this.notificationsService.canSendEmail()
          ? 'EMAIL_DISABLED'
          : !quotation.organization.customerEmailNotificationsEnabled
            ? 'BUSINESS_EMAIL_DISABLED'
            : !customerEmail
              ? 'CUSTOMER_EMAIL_MISSING'
              : null,
      },
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

      currency: quotation.currency,

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

    const result = await this.prisma.quotation.updateMany({
      where: {
        id: quotation.id,

        status: {
          in: ['SENT', 'VIEWED'],
        },
      },

      data: {
        status: 'APPROVED',

        approvedAt,

        customerResponseNote: dto.note?.trim() || null,
      },
    });

    if (result.count !== 1) {
      throw new BadRequestException(
        'This quotation has already received a response.',
      );
    }

    const updated = await this.prisma.quotation.findUnique({
      where: {
        id: quotation.id,
      },

      select: {
        id: true,

        quotationNumber: true,

        status: true,

        approvedAt: true,

        customerResponseNote: true,

        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        organization: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            address: true,
            email: true,
            phone: true,

            customerEmailNotificationsEnabled: true,
          },
        },

        createdBy: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!updated) {
      throw new NotFoundException('Quotation not found after approval.');
    }

    /*
     * Notify the business interface
     * that the customer approved.
     */
    this.realtimeGateway.emitQuotationUpdated(quotation.organizationId, {
      quotationId: quotation.id,

      quotationNumber: updated.quotationNumber,

      status: updated.status,

      customerResponseNote: updated.customerResponseNote,

      respondedAt: updated.approvedAt,
    });

    /*
     * Notify the business user.
     *
     * This is an internal/business
     * notification and is not
     * controlled by the customer
     * email preference.
     */
    if (updated.createdBy.email) {
      void this.notificationsService.sendQuotationApproved({
        recipientEmail: updated.createdBy.email,

        quotationId: updated.id,

        quotationNumber: updated.quotationNumber,

        customerName: updated.customer.name,

        note: updated.customerResponseNote,
      });
    }

    /*
     * The quotation approval has
     * already succeeded.
     *
     * Automatic job/email failure
     * must not invalidate the
     * customer's approval.
     */
    const jobConfirmation = await (async () => {
      try {
        const conversion = await this.convertApprovedQuotationToJob(
          updated.createdBy.id,

          quotation.organizationId,

          quotation.id,

          new ConvertQuotationToJobDto(),

          true,
        );

        const job = conversion.job;

        /*
         * Generate one stable
         * customer tracking link.
         */
        const tracking = await this.jobsService.ensureTrackingLink(
          quotation.organizationId,

          job.id,
        );

        /*
         * Notify active business
         * clients that the quotation
         * is now converted.
         */
        this.realtimeGateway.emitQuotationUpdated(quotation.organizationId, {
          quotationId: quotation.id,

          quotationNumber: updated.quotationNumber,

          status: 'CONVERTED',

          customerResponseNote: updated.customerResponseNote,

          respondedAt: updated.approvedAt,
        });

        const customerEmail = job.customer.email ?? updated.customer.email;

        const shouldSendEmail =
          this.notificationsService.canSendEmail() &&
          updated.organization.customerEmailNotificationsEnabled &&
          Boolean(customerEmail) &&
          !job.confirmationEmailSentAt;

        /*
         * Self-hosted, disabled business
         * email, missing customer email,
         * or already sent:
         *
         * Do not ask the frontend to
         * generate/upload a PDF.
         */
        if (!shouldSendEmail) {
          return null;
        }

        /*
         * Return only the customer-safe
         * data needed by the web app to
         * generate the same Job PDF.
         */
        return {
          emailRequired: true,

          trackingUrl: tracking.trackingUrl,

          pdfData: {
            jobNumber: job.jobNumber,

            quotationNumber: job.quotation.quotationNumber,

            createdAt: job.createdAt.toISOString(),

            dueDate: job.dueDate?.toISOString() ?? null,

            status: job.status,

            priority: job.priority,

            title: job.title,

            description: job.description,

            currency: job.currency,

            business: {
              name: updated.organization.name,

              logoUrl: updated.organization.logoUrl,

              address: updated.organization.address,

              email: updated.organization.email,

              phone: updated.organization.phone,
            },

            customer: {
              name: job.customer.name,

              companyName: job.customer.companyName,

              address: job.customer.address ?? null,

              email: job.customer.email ?? null,

              phone: job.customer.phone ?? null,
            },

            items: job.items.map((item) => ({
              id: item.id,

              name: item.name,

              description: item.description,

              quantity: Number(item.quantity),

              unit: item.unit,

              unitPrice: Number(item.unitPrice),

              total: Number(item.total),

              imageUrl: item.imageUrl,

              imageKey: item.imageKey,

              warrantyDuration: item.warrantyDuration,

              warrantyUnit: item.warrantyUnit,

              warrantyTerms: item.warrantyTerms,
            })),

            subtotal: Number(job.subtotal),

            discountAmount: Number(job.discountAmount),

            taxAmount: Number(job.taxAmount),

            total: Number(job.total),
          },
        };
      } catch (error) {
        this.logger.error(
          `Quotation ${updated.quotationNumber} was approved, but automatic job confirmation preparation failed.`,

          error instanceof Error ? error.stack : String(error),
        );

        return null;
      }
    })();

    return {
      message: 'Quotation approved successfully.',

      quotation: updated,
      jobConfirmation,
    };
  }

  async rejectPublicQuotation(
    token: string,
    dto: CustomerQuotationFeedbackDto,
  ) {
    const quotation = await this.getRespondableQuotation(token);

    const rejectedAt = new Date();

    const result = await this.prisma.quotation.updateMany({
      where: {
        id: quotation.id,

        status: {
          in: ['SENT', 'VIEWED'],
        },
      },

      data: {
        status: 'REJECTED',

        rejectedAt,

        customerResponseNote: dto.note.trim(),
      },
    });

    if (result.count !== 1) {
      throw new BadRequestException(
        'This quotation has already received a response.',
      );
    }

    const updated = await this.prisma.quotation.findUnique({
      where: {
        id: quotation.id,
      },

      select: {
        id: true,

        quotationNumber: true,

        status: true,

        rejectedAt: true,

        customerResponseNote: true,

        customer: {
          select: {
            name: true,
          },
        },

        createdBy: {
          select: {
            email: true,
          },
        },
      },
    });

    if (updated) {
      this.realtimeGateway.emitQuotationUpdated(quotation.organizationId, {
        quotationId: quotation.id,

        quotationNumber: updated.quotationNumber,

        status: updated.status,

        customerResponseNote: updated.customerResponseNote,

        respondedAt: updated.rejectedAt,
      });

      if (updated.createdBy?.email) {
        void this.notificationsService.sendQuotationDeclined({
          recipientEmail: updated.createdBy.email,

          quotationId: updated.id,

          quotationNumber: updated.quotationNumber,

          customerName: updated.customer?.name ?? 'Customer',

          message: updated.customerResponseNote,
        });
      }
    }

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
    return this.convertApprovedQuotationToJob(
      user.sub,
      tenant.organizationId,
      id,
      dto,
      false,
    );
  }

  private async convertApprovedQuotationToJob(
    createdById: string,
    organizationId: string,
    id: string,
    dto: ConvertQuotationToJobDto,
    automatic = false,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const quotation = await tx.quotation.findFirst({
        where: {
          id,
          organizationId,
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
       * Claim the quotation for
       * conversion.
       *
       * Only one request can change
       * APPROVED → CONVERTED.
       */
      const conversion = await tx.quotation.updateMany({
        where: {
          id: quotation.id,

          organizationId,

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

      /*
       * Generate the next job
       * sequence number.
       */
      const sequence = await tx.organizationSequence.upsert({
        where: {
          organizationId,
        },

        create: {
          organizationId,

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

      const customerDisplayName =
        quotation.customer.companyName ?? quotation.customer.name;

      const defaultTitle = quotation.items[0]?.name
        ? `${quotation.items[0].name} - ${customerDisplayName}`
        : `Job for ${customerDisplayName}`;

      /*
       * Automatic conversions cannot
       * ask the business for a due date.
       *
       * Quotation validUntil is not a
       * production completion date, so
       * automatic jobs start with null.
       */
      const dueDate = dto.dueDate
        ? new Date(dto.dueDate)
        : automatic
          ? null
          : quotation.validUntil;

      const job = await tx.job.create({
        data: {
          organizationId,

          customerId: quotation.customerId,

          quotationId: quotation.id,

          createdById,

          jobNumber,

          currency: quotation.currency,

          title: dto.title?.trim() || defaultTitle,

          description: dto.description?.trim() || null,

          priority: dto.priority ?? 'NORMAL',

          dueDate,

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

              imageUrl: item.imageUrl,

              imageKey: item.imageKey,

              warrantyDuration: item.warrantyDuration,

              warrantyUnit: item.warrantyUnit,

              warrantyTerms: item.warrantyTerms,

              sortOrder: item.sortOrder,
            })),
          },

          updates: {
            create: {
              status: 'PENDING',

              message: `Job created from quotation ${quotation.quotationNumber}.`,

              publicMessage:
                'Your quotation has been approved and your job has been confirmed.',

              createdById,
            },
          },
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

          customer: {
            select: {
              id: true,
              name: true,
              companyName: true,
              email: true,
              phone: true,
              address: true,
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

    const result = await this.prisma.quotation.updateMany({
      where: {
        id: quotation.id,

        status: {
          in: ['SENT', 'VIEWED'],
        },
      },

      data: {
        status: 'CHANGES_REQUESTED',

        changesRequestedAt,

        customerResponseNote: dto.note.trim(),
      },
    });

    if (result.count !== 1) {
      throw new BadRequestException(
        'This quotation has already received a response.',
      );
    }

    const updated = await this.prisma.quotation.findUnique({
      where: {
        id: quotation.id,
      },

      select: {
        id: true,

        quotationNumber: true,

        status: true,

        changesRequestedAt: true,

        customerResponseNote: true,

        customer: {
          select: {
            name: true,
          },
        },

        createdBy: {
          select: {
            email: true,
          },
        },
      },
    });

    if (updated) {
      this.realtimeGateway.emitQuotationUpdated(quotation.organizationId, {
        quotationId: quotation.id,

        quotationNumber: updated.quotationNumber,

        status: updated.status,

        customerResponseNote: updated.customerResponseNote,

        respondedAt: updated.changesRequestedAt,
      });

      if (updated.createdBy?.email) {
        void this.notificationsService.sendQuotationRevisionRequested({
          recipientEmail: updated.createdBy.email,

          quotationId: updated.id,

          quotationNumber: updated.quotationNumber,

          customerName: updated.customer?.name ?? 'Customer',

          message: updated.customerResponseNote,
        });
      }
    }

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

          currency: quotation.currency,

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

          footerNote: quotation.footerNote,

          items: {
            create: quotation.items.map((item) => ({
              name: item.name,

              description: item.description,

              quantity: item.quantity,

              unit: item.unit,

              unitPrice: item.unitPrice,

              total: item.total,
              imageUrl: item.imageUrl,

              imageKey: item.imageKey,

              warrantyDuration: item.warrantyDuration,

              warrantyUnit: item.warrantyUnit,

              warrantyTerms: item.warrantyTerms,

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

  async getPublicLink(tenant: TenantContext, id: string) {
    const quotation = await this.prisma.quotation.findFirst({
      where: {
        id,
        organizationId: tenant.organizationId,
      },

      select: {
        id: true,
        status: true,
        publicTokenHash: true,
        publicTokenEncrypted: true,
      },
    });

    if (!quotation) {
      throw new NotFoundException('Quotation not found.');
    }

    if (quotation.status === 'DRAFT') {
      throw new BadRequestException('This quotation has not been sent yet.');
    }

    if (!quotation.publicTokenHash) {
      throw new BadRequestException(
        'This quotation does not have a public link.',
      );
    }

    /*
     * Legacy quotations created before
     * encrypted token storage cannot be
     * recovered from the hash alone.
     */
    if (!quotation.publicTokenEncrypted) {
      throw new BadRequestException(
        'The original public link cannot be recovered for this quotation. Generate a new public link.',
      );
    }

    const token = this.decryptPublicToken(quotation.publicTokenEncrypted);

    const webUrl =
      this.configService.get<string>('WEB_URL') ?? 'http://localhost:3000';

    return {
      publicUrl: `${webUrl}/quote/${token}`,
    };
  }

  async regeneratePublicLink(tenant: TenantContext, id: string) {
    const quotation = await this.prisma.quotation.findFirst({
      where: {
        id,

        organizationId: tenant.organizationId,
      },

      select: {
        id: true,
        status: true,
      },
    });

    if (!quotation) {
      throw new NotFoundException('Quotation not found.');
    }

    if (quotation.status === 'DRAFT') {
      throw new BadRequestException('Send the quotation first.');
    }

    const token = randomBytes(32).toString('base64url');

    const tokenHash = this.hashPublicToken(token);

    const tokenEncrypted = this.encryptPublicToken(token);

    await this.prisma.quotation.update({
      where: {
        id,
      },

      data: {
        publicTokenHash: tokenHash,

        publicTokenEncrypted: tokenEncrypted,
      },
    });

    const webUrl =
      this.configService.get<string>('WEB_URL') ?? 'http://localhost:3000';

    return {
      publicUrl: `${webUrl}/quote/${token}`,
    };
  }

  async sendPublicJobConfirmation(token: string, pdfFile: Express.Multer.File) {
    const tokenHash = this.hashPublicToken(token);

    const quotation = await this.prisma.quotation.findFirst({
      where: {
        publicTokenHash: tokenHash,
      },

      select: {
        id: true,
        quotationNumber: true,
        status: true,
        organizationId: true,

        organization: {
          select: {
            name: true,
            logoUrl: true,

            customerEmailNotificationsEnabled: true,
          },
        },

        customer: {
          select: {
            name: true,
            email: true,
          },
        },

        job: {
          select: {
            id: true,
            jobNumber: true,
            dueDate: true,

            confirmationEmailSentAt: true,
          },
        },
      },
    });

    if (!quotation) {
      throw new NotFoundException('Quotation not found.');
    }

    if (quotation.status !== 'CONVERTED' || !quotation.job) {
      throw new BadRequestException(
        'This quotation has not been converted to a job.',
      );
    }

    /*
     * Avoid sending the same
     * confirmation more than once.
     */
    if (quotation.job.confirmationEmailSentAt) {
      return {
        sent: false,
        alreadySent: true,

        message: 'Job confirmation email was already sent.',
      };
    }

    /*
     * Self-hosted/global email
     * or business-level setting
     * can prevent the email.
     */
    if (!this.notificationsService.canSendEmail()) {
      return {
        sent: false,
        skipped: true,

        reason: 'EMAIL_DISABLED',

        message: 'Email notifications are globally disabled.',
      };
    }

    if (!quotation.organization.customerEmailNotificationsEnabled) {
      return {
        sent: false,
        skipped: true,

        reason: 'BUSINESS_EMAIL_DISABLED',

        message: 'Customer email notifications are disabled for this business.',
      };
    }

    if (!quotation.customer.email) {
      return {
        sent: false,
        skipped: true,

        reason: 'CUSTOMER_EMAIL_MISSING',

        message: 'The customer does not have an email address.',
      };
    }

    /*
     * This restores the existing
     * tracking URL when one already
     * exists. It does not regenerate
     * the QR token.
     */
    const tracking = await this.jobsService.ensureTrackingLink(
      quotation.organizationId,
      quotation.job.id,
    );

    const emailSent = await this.notificationsService.sendJobConfirmation({
      recipientEmail: quotation.customer.email,

      customerName: quotation.customer.name,

      businessName: quotation.organization.name,

      businessLogoUrl: quotation.organization.logoUrl,

      jobNumber: quotation.job.jobNumber,

      trackingUrl: tracking.trackingUrl,

      dueDate: quotation.job.dueDate,

      pdfAttachment: {
        filename: `${quotation.job.jobNumber}-confirmation.pdf`,

        content: pdfFile.buffer,
      },
    });

    if (!emailSent) {
      this.logger.warn(
        `Unable to send confirmation email for job ${quotation.job.jobNumber}.`,
      );

      return {
        sent: false,
        alreadySent: false,

        message: 'The confirmation email could not be sent.',
      };
    }

    /*
     * Only mark it as sent after
     * NotificationsService succeeds.
     */
    await this.prisma.job.update({
      where: {
        id: quotation.job.id,
      },

      data: {
        confirmationEmailSentAt: new Date(),
      },
    });

    return {
      sent: true,
      alreadySent: false,

      recipient: quotation.customer.email,

      jobNumber: quotation.job.jobNumber,

      message: 'Job confirmation email sent successfully.',
    };
  }
}
