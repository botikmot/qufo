import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import type { TenantContext } from '../auth/types/tenant-context.type';

import { UpdateBusinessSettingsDto } from './dto/update-business-settings.dto';
import { UpdateProfileSettingsDto } from './dto/update-profile-settings.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import * as bcrypt from 'bcrypt';
import { UploadsService } from '../uploads/uploads.service';

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadsService: UploadsService,
  ) {}

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
        quotationTerms: true,
        quotationFooterNote: true,
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

        ...(dto.quotationTerms !== undefined && {
          quotationTerms: dto.quotationTerms.trim() || null,
        }),

        ...(dto.quotationFooterNote !== undefined && {
          quotationFooterNote: dto.quotationFooterNote.trim() || null,
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

        // Internal use only.
        passwordHash: true,
        googleId: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('User profile not found.');
    }

    const { passwordHash, googleId, ...safeProfile } = profile;

    return {
      ...safeProfile,

      security: {
        hasPassword: Boolean(passwordHash),

        googleLinked: Boolean(googleId),
      },
    };
  }

  async updateProfileSettings(user: JwtPayload, dto: UpdateProfileSettingsDto) {
    await this.prisma.user.update({
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
    });

    const profile = await this.getProfileSettings(user);

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

  async changePassword(user: JwtPayload, dto: ChangePasswordDto) {
    const account = await this.prisma.user.findUnique({
      where: {
        id: user.sub,
      },

      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!account) {
      throw new NotFoundException('User account not found.');
    }

    if (!account.passwordHash) {
      throw new BadRequestException(
        'This account uses Google sign-in and does not have a password yet.',
      );
    }

    const currentPasswordMatches: boolean = await bcrypt.compare(
      dto.currentPassword,
      account.passwordHash,
    );

    if (!currentPasswordMatches) {
      throw new BadRequestException('Current password is incorrect.');
    }

    const sameAsCurrentPassword: boolean = await bcrypt.compare(
      dto.newPassword,
      account.passwordHash,
    );

    if (sameAsCurrentPassword) {
      throw new BadRequestException(
        'New password must be different from your current password.',
      );
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.user.update({
      where: {
        id: account.id,
      },

      data: {
        passwordHash,
      },
    });

    return {
      message: 'Password changed successfully.',
    };
  }

  async uploadProfileAvatar(user: JwtPayload, file: Express.Multer.File) {
    const account = await this.prisma.user.findUnique({
      where: {
        id: user.sub,
      },

      select: {
        id: true,
        avatarUrl: true,
        avatarPublicId: true,
      },
    });

    if (!account) {
      throw new NotFoundException('User account not found.');
    }

    const uploaded = await this.uploadsService.uploadProfileImage(file);

    const updated = await this.prisma.user.update({
      where: {
        id: account.id,
      },

      data: {
        avatarUrl: uploaded.url,

        avatarPublicId: uploaded.publicId,
      },

      select: {
        id: true,
        avatarUrl: true,
      },
    });

    /*
     * Delete the previous image only after
     * the new image and DB update succeed.
     */
    if (
      account.avatarPublicId &&
      account.avatarPublicId !== uploaded.publicId
    ) {
      try {
        await this.uploadsService.deleteImage(account.avatarPublicId);
      } catch {
        /*
         * Don't fail the successful profile
         * update just because cleanup failed.
         */
      }
    }

    return {
      message: 'Profile photo updated successfully.',

      avatarUrl: updated.avatarUrl,
    };
  }

  async removeProfileAvatar(user: JwtPayload) {
    const account = await this.prisma.user.findUnique({
      where: {
        id: user.sub,
      },

      select: {
        id: true,
        avatarPublicId: true,
      },
    });

    if (!account) {
      throw new NotFoundException('User account not found.');
    }

    await this.prisma.user.update({
      where: {
        id: account.id,
      },

      data: {
        avatarUrl: null,
        avatarPublicId: null,
      },
    });

    if (account.avatarPublicId) {
      try {
        await this.uploadsService.deleteImage(account.avatarPublicId);
      } catch {
        // DB state is already safely updated.
      }
    }

    return {
      message: 'Profile photo removed successfully.',
    };
  }

  async uploadBusinessLogo(organizationId: string, file: Express.Multer.File) {
    const organization = await this.prisma.organization.findUnique({
      where: {
        id: organizationId,
      },

      select: {
        id: true,
        logoPublicId: true,
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const uploaded = await this.uploadsService.uploadBusinessLogo(
      file,
      organizationId,
    );

    const updated = await this.prisma.organization.update({
      where: {
        id: organizationId,
      },

      data: {
        logoUrl: uploaded.url,

        logoPublicId: uploaded.publicId,
      },

      select: {
        logoUrl: true,
        logoPublicId: true,
      },
    });

    /*
     * Only remove previous storage object after
     * the new upload and database update succeed.
     */
    if (
      organization.logoPublicId &&
      organization.logoPublicId !== uploaded.publicId
    ) {
      try {
        await this.uploadsService.deleteImage(organization.logoPublicId);
      } catch {
        /*
         * New logo has already been safely stored
         * and persisted. Cleanup failure should not
         * make the operation fail.
         */
      }
    }

    return updated;
  }

  async removeBusinessLogo(organizationId: string) {
    const organization = await this.prisma.organization.findUnique({
      where: {
        id: organizationId,
      },

      select: {
        logoPublicId: true,
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    if (organization.logoPublicId) {
      await this.uploadsService.deleteImage(organization.logoPublicId);
    }

    await this.prisma.organization.update({
      where: {
        id: organizationId,
      },

      data: {
        logoUrl: null,
        logoPublicId: null,
      },
    });

    return {
      removed: true,
    };
  }
}
