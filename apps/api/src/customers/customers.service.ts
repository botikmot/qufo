import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import type { JwtPayload } from '../auth/types/jwt-payload.type';
import type { TenantContext } from '../auth/types/tenant-context.type';

import { CreateCustomerDto } from './dto/create-customer.dto';
import { CustomerQueryDto } from './dto/customer-query.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    user: JwtPayload,
    tenant: TenantContext,
    dto: CreateCustomerDto,
  ) {
    return this.prisma.customer.create({
      data: {
        organizationId: tenant.organizationId,
        createdById: user.sub,

        type: dto.type ?? 'INDIVIDUAL',

        name: dto.name.trim(),

        companyName: dto.companyName?.trim() || null,

        email: dto.email?.trim().toLowerCase() || null,

        phone: dto.phone?.trim() || null,

        address: dto.address?.trim() || null,

        notes: dto.notes?.trim() || null,
      },

      select: {
        id: true,
        type: true,
        status: true,

        name: true,
        companyName: true,

        email: true,
        phone: true,

        address: true,
        notes: true,

        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findAll(tenant: TenantContext, query: CustomerQueryDto) {
    const page = query.page;
    const limit = query.limit;

    const skip = (page - 1) * limit;

    const search = query.search?.trim();

    const where = {
      organizationId: tenant.organizationId,

      status: query.status ?? 'ACTIVE',

      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },

              {
                companyName: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },

              {
                email: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },

              {
                phone: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.customer.findMany({
        where,

        skip,
        take: limit,

        orderBy: {
          createdAt: 'desc',
        },

        select: {
          id: true,
          type: true,
          status: true,

          name: true,
          companyName: true,

          email: true,
          phone: true,

          address: true,

          createdAt: true,
          updatedAt: true,

          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),

      this.prisma.customer.count({
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
    const customer = await this.prisma.customer.findFirst({
      where: {
        id,
        organizationId: tenant.organizationId,
      },

      select: {
        id: true,
        type: true,
        status: true,

        name: true,
        companyName: true,

        email: true,
        phone: true,

        address: true,
        notes: true,

        createdAt: true,
        updatedAt: true,

        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found.');
    }

    return customer;
  }

  async update(tenant: TenantContext, id: string, dto: UpdateCustomerDto) {
    await this.ensureCustomerExists(tenant.organizationId, id);

    return this.prisma.customer.update({
      where: {
        id,
      },

      data: {
        ...(dto.type !== undefined && {
          type: dto.type,
        }),

        ...(dto.name !== undefined && {
          name: dto.name.trim(),
        }),

        ...(dto.companyName !== undefined && {
          companyName: dto.companyName.trim() || null,
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

        ...(dto.notes !== undefined && {
          notes: dto.notes.trim() || null,
        }),
      },

      select: {
        id: true,
        type: true,
        status: true,

        name: true,
        companyName: true,

        email: true,
        phone: true,

        address: true,
        notes: true,

        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async archive(tenant: TenantContext, id: string) {
    await this.ensureCustomerExists(tenant.organizationId, id);

    await this.prisma.customer.update({
      where: {
        id,
      },

      data: {
        status: 'ARCHIVED',
      },
    });
  }

  private async ensureCustomerExists(organizationId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: {
        id,
        organizationId,
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
}
