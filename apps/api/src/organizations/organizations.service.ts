import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import type { TenantContext } from '../auth/types/tenant-context.type';

import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findCurrent(tenant: TenantContext) {
    const organization = await this.prisma.organization.findUnique({
      where: {
        id: tenant.organizationId,
      },

      select: {
        id: true,
        name: true,
        slug: true,
        businessType: true,

        email: true,
        phone: true,
        address: true,
        logoUrl: true,
        quotationTerms: true,
        quotationFooterNote: true,

        quotationSignatureUrl: true,
        quotationSignatoryName: true,
        quotationSignatoryTitle: true,
        showQuotationSignature: true,

        countryCode: true,
        currency: true,

        status: true,
        createdAt: true,
        updatedAt: true,

        _count: {
          select: {
            quotations: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found.');
    }

    return {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      businessType: organization.businessType,

      email: organization.email,
      phone: organization.phone,
      address: organization.address,
      logoUrl: organization.logoUrl,
      quotationTerms: organization.quotationTerms,
      quotationFooterNote: organization.quotationFooterNote,
      quotationSignatureUrl: organization.quotationSignatureUrl,
      quotationSignatoryName: organization.quotationSignatoryName,
      quotationSignatoryTitle: organization.quotationSignatoryTitle,
      showQuotationSignature: organization.showQuotationSignature,

      countryCode: organization.countryCode,
      currency: organization.currency,

      status: organization.status,

      currencyLocked: organization._count.quotations > 0,

      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
    };
  }

  async update(tenant: TenantContext, dto: UpdateOrganizationDto) {
    const organization = await this.prisma.organization.findUnique({
      where: {
        id: tenant.organizationId,
      },

      select: {
        id: true,
        currency: true,

        _count: {
          select: {
            quotations: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found.');
    }

    const requestedCurrency = dto.currency?.trim().toUpperCase();

    const currencyIsChanging =
      requestedCurrency !== undefined &&
      requestedCurrency !== organization.currency;

    if (currencyIsChanging && organization._count.quotations > 0) {
      throw new BadRequestException(
        'Business currency cannot be changed after quotations have been created.',
      );
    }

    return this.prisma.organization.update({
      where: {
        id: tenant.organizationId,
      },

      data: {
        ...(dto.name !== undefined && {
          name: dto.name.trim(),
        }),

        ...(dto.businessType !== undefined && {
          businessType: dto.businessType.trim() || null,
        }),

        ...(dto.email !== undefined && {
          email: dto.email.trim().toLowerCase() || null,
        }),

        ...(dto.phone !== undefined && {
          phone: dto.phone.trim() || null,
        }),

        ...(dto.address !== undefined && {
          address: dto.address.trim() || null,
        }),

        ...(dto.countryCode !== undefined && {
          countryCode: dto.countryCode.trim().toUpperCase() || null,
        }),

        ...(dto.quotationTerms !== undefined && {
          quotationTerms: dto.quotationTerms.trim() || null,
        }),

        ...(dto.quotationFooterNote !== undefined && {
          quotationFooterNote: dto.quotationFooterNote.trim() || null,
        }),

        ...(requestedCurrency !== undefined && {
          currency: requestedCurrency,
        }),
      },

      select: {
        id: true,
        name: true,
        slug: true,
        businessType: true,

        email: true,
        phone: true,
        address: true,
        logoUrl: true,
        quotationTerms: true,
        quotationFooterNote: true,

        countryCode: true,
        currency: true,

        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
