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
import { GoogleAuthService } from './google-auth.service';
import { GoogleLoginDto } from './dto/google-login.dto';
import { CompleteGoogleRegistrationDto } from './dto/complete-google-registration.dto';

import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly googleAuthService: GoogleAuthService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
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

  private async createLoginSession(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
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
      throw new UnauthorizedException('Account not found.');
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

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();

    const name = dto.name.trim();

    const invitationToken = dto.invitationToken?.trim() || null;

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

    /*
     * Invitation registration creates only the user and
     * membership. The pending invitation already reserves
     * the AppSumo team seat.
     */
    if (invitationToken) {
      const tokenHash = createHash('sha256')
        .update(invitationToken, 'utf8')
        .digest('hex');

      const now = new Date();

      const result = await this.prisma.$transaction(async (tx) => {
        const invitation = await tx.organizationInvitation.findUnique({
          where: {
            tokenHash,
          },

          select: {
            id: true,
            organizationId: true,
            email: true,
            role: true,
            status: true,
            expiresAt: true,

            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
                businessType: true,
                countryCode: true,
                currency: true,
                status: true,

                subscription: {
                  select: {
                    plan: true,
                    status: true,
                    trialStartedAt: true,
                    trialEndsAt: true,
                  },
                },
              },
            },
          },
        });

        if (!invitation) {
          throw new BadRequestException('This team invitation is invalid.');
        }

        if (invitation.status !== 'PENDING' || invitation.expiresAt <= now) {
          throw new BadRequestException(
            invitation.expiresAt <= now
              ? 'This team invitation has expired.'
              : 'This team invitation is no longer available.',
          );
        }

        if (invitation.organization.status !== 'ACTIVE') {
          throw new BadRequestException(
            'This organization is currently unavailable.',
          );
        }

        if (invitation.email.trim().toLowerCase() !== email) {
          throw new BadRequestException(
            'Register using the email address that received this invitation.',
          );
        }

        /*
         * OWNER is never an invitational role. Keep this
         * defense even though the invitation DTO also blocks it.
         */
        if (invitation.role === 'OWNER') {
          throw new BadRequestException('This team invitation is invalid.');
        }

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

        /*
         * Claim first using status + expiry conditions. If a
         * concurrent request changed the invitation, throwing
         * here rolls back the newly created user as well.
         */
        const claimed = await tx.organizationInvitation.updateMany({
          where: {
            id: invitation.id,
            status: 'PENDING',
            expiresAt: {
              gt: now,
            },
          },

          data: {
            status: 'ACCEPTED',
            acceptedById: user.id,
            acceptedAt: now,
          },
        });

        if (claimed.count !== 1) {
          throw new ConflictException(
            'This team invitation changed while it was being accepted.',
          );
        }

        const membership = await tx.organizationMember.create({
          data: {
            organizationId: invitation.organizationId,
            userId: user.id,
            role: invitation.role,
            isActive: true,
          },

          select: {
            id: true,
            role: true,
            joinedAt: true,
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
          organization: invitation.organization,
          membership,
        };
      });

      return {
        message: `QUFO account created and joined ${result.organization.name} successfully.`,
        joinedViaInvitation: true,
        user: result.user,

        organization: {
          id: result.organization.id,
          name: result.organization.name,
          slug: result.organization.slug,
          businessType: result.organization.businessType,
          countryCode: result.organization.countryCode,
          currency: result.organization.currency,
          role: result.membership.role,
        },

        subscription: {
          plan: result.organization.subscription?.plan,
          status: result.organization.subscription?.status,
          trialStartedAt: result.organization.subscription?.trialStartedAt,
          trialEndsAt: result.organization.subscription?.trialEndsAt,
        },
      };
    }

    /*
     * Existing normal owner registration flow.
     */
    const businessName = dto.businessName?.trim();

    const countryCode = dto.countryCode?.trim().toUpperCase();

    const currency = dto.currency?.trim().toUpperCase();

    if (!businessName || !countryCode || !currency) {
      throw new BadRequestException(
        'Business name, country, and currency are required.',
      );
    }

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
      joinedViaInvitation: false,
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

      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return this.createLoginSession(user.id);
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

  async googleLogin(dto: GoogleLoginDto) {
    const google = await this.googleAuthService.verifyCredential(
      dto.credential,
    );

    /*
     * First try the permanent
     * Google subject identifier.
     */
    let user = await this.prisma.user.findUnique({
      where: {
        googleId: google.googleId,
      },
      select: {
        id: true,
        googleId: true,
        email: true,
        avatarUrl: true,
        status: true,
      },
    });

    /*
     * If Google was never linked,
     * look for an existing QUFO
     * account with the verified
     * Google email.
     */
    if (!user) {
      const existingByEmail = await this.prisma.user.findUnique({
        where: {
          email: google.email,
        },

        select: {
          id: true,
          googleId: true,
          email: true,
          avatarUrl: true,
          status: true,
        },
      });

      if (existingByEmail) {
        /*
         * Don't silently replace an
         * existing different Google ID.
         */
        if (
          existingByEmail.googleId &&
          existingByEmail.googleId !== google.googleId
        ) {
          throw new ConflictException(
            'This account is already linked to another Google account.',
          );
        }

        user = await this.prisma.user.update({
          where: {
            id: existingByEmail.id,
          },

          data: {
            googleId: google.googleId,

            emailVerifiedAt: new Date(),

            avatarUrl: existingByEmail.avatarUrl ?? google.picture,
          },

          select: {
            id: true,
            googleId: true,
            email: true,
            avatarUrl: true,
            status: true,
          },
        });
      }
    }

    /*
     * Brand-new Google user:
     * do NOT create anything yet.
     *
     * Send them to workspace
     * onboarding first.
     */
    if (!user) {
      return {
        requiresOnboarding: true as const,

        profile: {
          name: google.name,
          email: google.email,
          picture: google.picture,
        },
      };
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Your account is currently unavailable.');
    }

    const session = await this.createLoginSession(user.id);

    return {
      requiresOnboarding: false as const,

      ...session,
    };
  }

  async completeGoogleRegistration(dto: CompleteGoogleRegistrationDto) {
    const google = await this.googleAuthService.verifyCredential(
      dto.credential,
    );

    if (!dto.acceptedTerms) {
      throw new BadRequestException(
        'You must accept the Terms of Service and acknowledge the Privacy Policy.',
      );
    }

    const businessName = dto.businessName.trim();

    const countryCode = dto.countryCode.trim().toUpperCase();

    const currency = dto.currency.trim().toUpperCase();

    /*
     * Protect against duplicate /
     * double submission.
     */
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          {
            googleId: google.googleId,
          },
          {
            email: google.email,
          },
        ],
      },

      select: {
        id: true,
      },
    });

    if (existingUser) {
      /*
       * Useful if user double-clicked
       * or request was retried.
       */
      return {
        requiresOnboarding: false,

        ...(await this.createLoginSession(existingUser.id)),
      };
    }

    const slug = await this.generateUniqueOrganizationSlug(businessName);

    const trialStartedAt = new Date();

    const trialEndsAt = new Date(
      trialStartedAt.getTime() + 30 * 24 * 60 * 60 * 1000,
    );

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: google.name,

          email: google.email,

          googleId: google.googleId,

          emailVerifiedAt: new Date(),

          avatarUrl: google.picture,
        },

        select: {
          id: true,
          name: true,
          email: true,
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

        select: {
          id: true,
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

    const session = await this.createLoginSession(result.user.id);

    return {
      requiresOnboarding: false,

      ...session,
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto.email.trim().toLowerCase();

    const genericResponse = {
      message:
        'If an account exists for that email, a password reset link has been sent.',
    };

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
      },
    });

    // Always return the same response.
    // Do not reveal whether an email exists.
    if (!user || user.status !== 'ACTIVE') {
      return genericResponse;
    }

    const rawToken = randomBytes(32).toString('hex');

    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await this.prisma.$transaction([
      // Invalidate all previous reset links
      this.prisma.passwordResetToken.deleteMany({
        where: {
          userId: user.id,
        },
      }),

      this.prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      }),
    ]);

    const webUrl =
      this.configService.get<string>('WEB_URL') ?? 'https://qufo.im';

    const resetUrl = `${webUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;

    await this.emailService.sendPasswordReset({
      to: user.email,
      name: user.name,
      resetUrl,
    });

    return genericResponse;
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = createHash('sha256').update(dto.token).digest('hex');

    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: {
        tokenHash,
      },
      include: {
        user: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (
      !resetToken ||
      resetToken.expiresAt.getTime() < Date.now() ||
      resetToken.user.status !== 'ACTIVE'
    ) {
      throw new BadRequestException(
        'This password reset link is invalid or has expired.',
      );
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: {
          id: resetToken.userId,
        },
        data: {
          passwordHash,
        },
      }),

      // Invalidate ALL password reset links for this user
      this.prisma.passwordResetToken.deleteMany({
        where: {
          userId: resetToken.userId,
        },
      }),

      // Force all devices to sign in again
      this.prisma.refreshSession.deleteMany({
        where: {
          userId: resetToken.userId,
        },
      }),
    ]);

    return {
      message:
        'Your password has been reset successfully. You can now sign in with your new password.',
    };
  }
}
