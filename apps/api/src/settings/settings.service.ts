import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import type { TenantContext } from '../auth/types/tenant-context.type';

import { UpdateBusinessSettingsDto } from './dto/update-business-settings.dto';
import { UpdateProfileSettingsDto } from './dto/update-profile-settings.dto';
import { JwtPayload } from '../auth/types/jwt-payload.type';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getBusinessSettings(user: JwtPayload, tenant: TenantContext) {
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
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found.');
    }

    let fallbackEmail = organization.email;

    if (!fallbackEmail) {
      const currentUser = await this.prisma.user.findUnique({
        where: {
          id: user.sub,
        },

        select: {
          email: true,
        },
      });

      fallbackEmail = currentUser?.email ?? null;
    }

    return {
      ...organization,

      email: fallbackEmail,
    };
  }

  async updateBusinessSettings(
    tenant: TenantContext,
    dto: UpdateBusinessSettingsDto,
  ) {
    const organization = await this.prisma.organization.update({
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

        ...(dto.logoUrl !== undefined && {
          logoUrl: dto.logoUrl.trim() || null,
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
        status: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Business settings updated successfully.',

      organization,
    };
  }

  async getProfileSettings(user: JwtPayload) {
    const profile = await this.prisma.user.findUnique({
      where: {
        id: user.sub,
      },

      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        status: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('User profile not found.');
    }

    return profile;
  }

  async updateProfileSettings(user: JwtPayload, dto: UpdateProfileSettingsDto) {
    const profile = await this.prisma.user.update({
      where: {
        id: user.sub,
      },

      data: {
        ...(dto.name !== undefined && {
          name: dto.name.trim(),
        }),

        ...(dto.phone !== undefined && {
          phone: dto.phone.trim() || null,
        }),

        ...(dto.avatarUrl !== undefined && {
          avatarUrl: dto.avatarUrl.trim() || null,
        }),
      },

      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        status: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Profile updated successfully.',

      profile,
    };
  }

  async getSubscriptionSettings(tenant: TenantContext) {
    const subscription = await this.prisma.subscription.findUnique({
      where: {
        organizationId: tenant.organizationId,
      },

      select: {
        id: true,
        plan: true,
        status: true,

        trialStartedAt: true,
        trialEndsAt: true,

        currentPeriodStart: true,
        currentPeriodEnd: true,

        cancelAtPeriodEnd: true,

        createdAt: true,
        updatedAt: true,
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found.');
    }

    return subscription;
  }
}
