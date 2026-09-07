import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import type { TenantContext } from '../auth/types/tenant-context.type';

import { CreateBusinessProfileDto } from './dto/create-business-profile.dto';
import { UpdateBusinessProfileDto } from './dto/update-business-profile.dto';
import { UploadsService } from '../uploads/uploads.service';

@Injectable()
export class BusinessProfilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadsService: UploadsService,
  ) {}

  async findAll(tenant: TenantContext) {
    const organization = await this.prisma.organization.findUnique({
      where: {
        id: tenant.organizationId,
      },

      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        logoUrl: true,
        quotationTerms: true,
        quotationFooterNote: true,
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found.');
    }

    const profiles = await this.prisma.businessProfile.findMany({
      where: {
        organizationId: tenant.organizationId,

        isActive: true,
      },

      orderBy: [
        {
          isDefault: 'desc',
        },
        {
          label: 'asc',
        },
      ],
    });

    return {
      /*
       * Existing organization remains the
       * built-in Main Business.
       */
      mainBusiness: {
        id: null,
        type: 'ORGANIZATION' as const,
        label: 'Main Business',
        name: organization.name,
        email: organization.email,
        phone: organization.phone,
        address: organization.address,
        logoUrl: organization.logoUrl,

        quotationTerms: organization.quotationTerms,

        quotationFooterNote: organization.quotationFooterNote,

        isDefault: !profiles.some((profile) => profile.isDefault),
      },

      profiles: profiles.map((profile) => ({
        ...profile,
        type: 'BUSINESS_PROFILE' as const,
      })),
    };
  }

  async create(tenant: TenantContext, dto: CreateBusinessProfileDto) {
    return this.prisma.$transaction(async (tx) => {
      const organization = await tx.organization.findUnique({
        where: {
          id: tenant.organizationId,
        },

        select: {
          id: true,
        },
      });

      if (!organization) {
        throw new NotFoundException('Organization not found.');
      }

      /*
       * Only one additional profile
       * may be the default.
       */
      if (dto.isDefault) {
        await tx.businessProfile.updateMany({
          where: {
            organizationId: tenant.organizationId,

            isDefault: true,
          },

          data: {
            isDefault: false,
          },
        });
      }

      return tx.businessProfile.create({
        data: {
          organizationId: tenant.organizationId,

          label: dto.label.trim(),
          name: dto.name.trim(),

          email: dto.email?.trim() || null,

          phone: dto.phone?.trim() || null,

          address: dto.address?.trim() || null,

          quotationTerms: dto.quotationTerms?.trim() || null,

          quotationFooterNote: dto.quotationFooterNote?.trim() || null,

          isDefault: dto.isDefault ?? false,
        },
      });
    });
  }

  async update(
    tenant: TenantContext,
    id: string,
    dto: UpdateBusinessProfileDto,
  ) {
    const existing = await this.prisma.businessProfile.findFirst({
      where: {
        id,

        organizationId: tenant.organizationId,
      },
    });

    if (!existing) {
      throw new NotFoundException('Business profile not found.');
    }

    return this.prisma.$transaction(async (tx) => {
      /*
       * If this becomes default,
       * unset every other profile.
       */
      if (dto.isDefault === true) {
        await tx.businessProfile.updateMany({
          where: {
            organizationId: tenant.organizationId,

            id: {
              not: id,
            },

            isDefault: true,
          },

          data: {
            isDefault: false,
          },
        });
      }

      return tx.businessProfile.update({
        where: {
          id,
        },

        data: {
          ...(dto.label !== undefined && {
            label: dto.label.trim(),
          }),

          ...(dto.name !== undefined && {
            name: dto.name.trim(),
          }),

          ...(dto.email !== undefined && {
            email: dto.email.trim() || null,
          }),

          ...(dto.phone !== undefined && {
            phone: dto.phone.trim() || null,
          }),

          ...(dto.address !== undefined && {
            address: dto.address.trim() || null,
          }),

          ...(dto.quotationTerms !== undefined && {
            quotationTerms: dto.quotationTerms.trim() || null,
          }),

          ...(dto.quotationFooterNote !== undefined && {
            quotationFooterNote: dto.quotationFooterNote.trim() || null,
          }),

          ...(dto.isDefault !== undefined && {
            isDefault: dto.isDefault,
          }),
        },
      });
    });
  }

  async archive(tenant: TenantContext, id: string) {
    const profile = await this.prisma.businessProfile.findFirst({
      where: {
        id,

        organizationId: tenant.organizationId,
      },

      select: {
        id: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Business profile not found.');
    }

    await this.prisma.businessProfile.update({
      where: {
        id,
      },

      data: {
        isActive: false,
        isDefault: false,
      },
    });

    return {
      archived: true,
      id,
    };
  }

  async setDefault(tenant: TenantContext, id: string) {
    return this.prisma.$transaction(async (tx) => {
      const profile = await tx.businessProfile.findFirst({
        where: {
          id,

          organizationId: tenant.organizationId,

          isActive: true,
        },

        select: {
          id: true,
        },
      });

      if (!profile) {
        throw new NotFoundException('Business profile not found.');
      }

      await tx.businessProfile.updateMany({
        where: {
          organizationId: tenant.organizationId,

          isDefault: true,
        },

        data: {
          isDefault: false,
        },
      });

      return tx.businessProfile.update({
        where: {
          id,
        },

        data: {
          isDefault: true,
        },
      });
    });
  }

  async useMainBusinessAsDefault(tenant: TenantContext) {
    await this.prisma.businessProfile.updateMany({
      where: {
        organizationId: tenant.organizationId,

        isDefault: true,
      },

      data: {
        isDefault: false,
      },
    });

    return {
      defaultBusiness: 'ORGANIZATION',
    };
  }

  async uploadLogo(
    tenant: TenantContext,
    id: string,
    file: Express.Multer.File,
  ) {
    const profile = await this.prisma.businessProfile.findFirst({
      where: {
        id,
        organizationId: tenant.organizationId,
      },

      select: {
        id: true,
        logoUrl: true,
        logoPublicId: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Business profile not found.');
    }

    const uploaded = await this.uploadsService.uploadBusinessProfileLogo(
      file,
      tenant.organizationId,
      profile.id,
    );

    const updated = await (async () => {
      try {
        return await this.prisma.businessProfile.update({
          where: {
            id: profile.id,
          },

          data: {
            logoUrl: uploaded.url,
            logoPublicId: uploaded.publicId,
          },
        });
      } catch (error: unknown) {
        /*
         * DB update failed.
         * Remove newly uploaded orphan asset.
         */
        try {
          await this.uploadsService.deleteImage(uploaded.publicId);
        } catch {
          // Original DB error is more important.
        }

        throw error;
      }
    })();

    /*
     * We may delete the OLD image only if
     * no quotation snapshot still uses it.
     */
    if (
      profile.logoUrl &&
      profile.logoPublicId &&
      profile.logoPublicId !== uploaded.publicId
    ) {
      const historicalReferences = await this.prisma.quotation.count({
        where: {
          organizationId: tenant.organizationId,

          businessProfileId: profile.id,

          businessLogoUrlSnapshot: profile.logoUrl,
        },
      });

      if (historicalReferences === 0) {
        try {
          await this.uploadsService.deleteImage(profile.logoPublicId);
        } catch {
          /*
           * New logo is already safely
           * persisted. Cleanup failure
           * should not fail the request.
           */
        }
      }
    }

    return updated;
  }

  async removeLogo(tenant: TenantContext, id: string) {
    const profile = await this.prisma.businessProfile.findFirst({
      where: {
        id,
        organizationId: tenant.organizationId,
      },

      select: {
        id: true,
        logoUrl: true,
        logoPublicId: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Business profile not found.');
    }

    /*
     * Clear DB first.
     */
    await this.prisma.businessProfile.update({
      where: {
        id: profile.id,
      },

      data: {
        logoUrl: null,
        logoPublicId: null,
      },
    });

    /*
     * If no historical quotation uses
     * this asset, physically delete it.
     */
    if (profile.logoUrl && profile.logoPublicId) {
      const historicalReferences = await this.prisma.quotation.count({
        where: {
          organizationId: tenant.organizationId,

          businessProfileId: profile.id,

          businessLogoUrlSnapshot: profile.logoUrl,
        },
      });

      if (historicalReferences === 0) {
        try {
          await this.uploadsService.deleteImage(profile.logoPublicId);
        } catch {
          // DB is already safely updated.
        }
      }
    }

    return {
      removed: true,
      id: profile.id,
    };
  }
}
