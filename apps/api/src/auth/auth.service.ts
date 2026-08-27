import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './types/jwt-payload.type';

import { createHash, randomBytes } from 'node:crypto';
import { LegalConsentType } from '../generated/prisma/enums';

import { LEGAL_VERSIONS } from '../common/constants/legal.constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private readonly REFRESH_TOKEN_DAYS = 30;

  private hashRefreshToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private generateRefreshToken() {
    return randomBytes(48).toString('base64url');
  }

  private getRefreshExpiry() {
    const expiresAt = new Date();

    expiresAt.setDate(expiresAt.getDate() + this.REFRESH_TOKEN_DAYS);

    return expiresAt;
  }

  private async createRefreshSession(userId: string) {
    const refreshToken = this.generateRefreshToken();

    const tokenHash = this.hashRefreshToken(refreshToken);

    await this.prisma.refreshSession.create({
      data: {
        userId,
        tokenHash,
        expiresAt: this.getRefreshExpiry(),
      },
    });

    return refreshToken;
  }

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const name = dto.name.trim();
    const businessName = dto.businessName.trim();
    const countryCode = dto.countryCode.trim().toUpperCase();
    const currency = dto.currency.trim().toUpperCase();

    const existingUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      throw new ConflictException('An account with this email already exists.');
    }

    if (!dto.acceptedTerms) {
      throw new BadRequestException(
        'You must accept the Terms of Service and acknowledge the Privacy Policy.',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const slug = await this.generateUniqueOrganizationSlug(businessName);

    const trialStartedAt = new Date();

    const trialEndsAt = new Date(
      trialStartedAt.getTime() + 30 * 24 * 60 * 60 * 1000,
    );

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
        },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          createdAt: true,
        },
      });

      const organization = await tx.organization.create({
        data: {
          name: businessName,
          slug,

          businessType: dto.businessType?.trim() || null,

          countryCode,
          currency,

          sequence: {
            create: {},
          },

          memberships: {
            create: {
              userId: user.id,
              role: 'OWNER',
            },
          },

          subscription: {
            create: {
              plan: 'STANDARD',
              status: 'TRIALING',
              trialStartedAt,
              trialEndsAt,
            },
          },
        },

        include: {
          subscription: true,

          memberships: {
            where: {
              userId: user.id,
            },

            select: {
              id: true,
              role: true,
              joinedAt: true,
            },
          },
        },
      });

      await tx.legalConsent.createMany({
        data: [
          {
            userId: user.id,
            type: LegalConsentType.TERMS_OF_SERVICE,
            version: LEGAL_VERSIONS.TERMS_OF_SERVICE,
          },
          {
            userId: user.id,
            type: LegalConsentType.PRIVACY_POLICY,
            version: LEGAL_VERSIONS.PRIVACY_POLICY,
          },
        ],
      });

      return {
        user,
        organization,
      };
    });

    return {
      message: 'QUFO account created successfully.',

      user: result.user,

      organization: {
        id: result.organization.id,
        name: result.organization.name,
        slug: result.organization.slug,
        businessType: result.organization.businessType,
        countryCode: result.organization.countryCode,
        currency: result.organization.currency,
        role: result.organization.memberships[0]?.role ?? 'OWNER',
      },

      subscription: {
        plan: result.organization.subscription?.plan,
        status: result.organization.subscription?.status,
        trialStartedAt: result.organization.subscription?.trialStartedAt,
        trialEndsAt: result.organization.subscription?.trialEndsAt,
      },
    };
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },

      include: {
        memberships: {
          where: {
            isActive: true,
          },

          include: {
            organization: {
              include: {
                subscription: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Your account is currently unavailable.');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    const refreshToken = await this.createRefreshSession(user.id);

    await this.prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        lastLoginAt: new Date(),
      },
    });

    return {
      accessToken,
      refreshToken,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        platformRole: user.platformRole,
      },

      organizations: user.memberships.map((membership) => ({
        id: membership.organization.id,
        name: membership.organization.name,
        slug: membership.organization.slug,

        countryCode: membership.organization.countryCode,
        currency: membership.organization.currency,

        role: membership.role,

        subscription: membership.organization.subscription
          ? {
              plan: membership.organization.subscription.plan,

              status: membership.organization.subscription.status,

              trialEndsAt: membership.organization.subscription.trialEndsAt,

              currentPeriodEnd:
                membership.organization.subscription.currentPeriodEnd,
            }
          : null,
      })),
    };
  }

  private async generateUniqueOrganizationSlug(businessName: string) {
    const baseSlug =
      businessName
        .normalize('NFKD')
        .toLowerCase()
        .trim()
        .replace(/['’]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'business';

    let slug = baseSlug;
    let counter = 1;

    while (
      await this.prisma.organization.findUnique({
        where: {
          slug,
        },
        select: {
          id: true,
        },
      })
    ) {
      counter += 1;
      slug = `${baseSlug}-${counter}`;
    }

    return slug;
  }

  async refresh(refreshToken?: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh session is required.');
    }

    const tokenHash = this.hashRefreshToken(refreshToken);

    const session = await this.prisma.refreshSession.findUnique({
      where: {
        tokenHash,
      },

      include: {
        user: true,
      },
    });

    if (!session || session.revokedAt || session.expiresAt <= new Date()) {
      throw new UnauthorizedException('Refresh session is invalid or expired.');
    }

    if (session.user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User account is not active.');
    }

    /*
     * Rotate refresh token.
     */
    const newRefreshToken = this.generateRefreshToken();

    const newTokenHash = this.hashRefreshToken(newRefreshToken);

    const rotated = await this.prisma.refreshSession.updateMany({
      where: {
        id: session.id,

        tokenHash,

        revokedAt: null,
      },

      data: {
        tokenHash: newTokenHash,

        lastUsedAt: new Date(),
      },
    });

    if (rotated.count !== 1) {
      throw new UnauthorizedException(
        'Refresh session has already been rotated.',
      );
    }

    const accessToken = await this.jwtService.signAsync({
      sub: session.user.id,

      email: session.user.email,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken?: string) {
    if (!refreshToken) {
      return;
    }

    const tokenHash = this.hashRefreshToken(refreshToken);

    await this.prisma.refreshSession.updateMany({
      where: {
        tokenHash,
        revokedAt: null,
      },

      data: {
        revokedAt: new Date(),
      },
    });
  }
}
