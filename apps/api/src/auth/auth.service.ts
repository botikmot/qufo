import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './types/jwt-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const name = dto.name.trim();
    const businessName = dto.businessName.trim();

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

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Your account is currently unavailable.');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload);

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

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },

      organizations: user.memberships.map((membership) => ({
        id: membership.organization.id,
        name: membership.organization.name,
        slug: membership.organization.slug,

        role: membership.role,

        subscription: membership.organization.subscription
          ? {
              plan: membership.organization.subscription.plan,

              status: membership.organization.subscription.status,

              trialEndsAt: membership.organization.subscription.trialEndsAt,
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
}
