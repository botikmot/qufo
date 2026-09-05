import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { createHash, randomBytes } from 'node:crypto';

import { Prisma } from '../generated/prisma/client';

import type { JwtPayload } from '../auth/types/jwt-payload.type';

import type { TenantContext } from '../auth/types/tenant-context.type';

import { EmailService } from '../email/email.service';

import { PrismaService } from '../prisma/prisma.service';

import { CreateTeamInvitationDto } from './dto/create-team-invitation.dto';

import { UpdateTeamMemberRoleDto } from './dto/update-team-member-role.dto';

import { TeamSeatLimitService } from './team-seat-limit.service';

import { TeamInvitationTokenDto } from './dto/team-invitation-token.dto';

const INVITATION_EXPIRY_DAYS = 7;

const INVITATION_EXPIRY_MILLISECONDS =
  INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

type TeamMemberRecord = {
  id: string;
  role: TenantContext['role'];
  isActive: boolean;
  deactivatedAt: Date | null;
  seatLimitSuspendedAt: Date | null;
  joinedAt: Date;

  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    lastLoginAt: Date | null;
  };
};

@Injectable()
export class TeamService {
  constructor(
    private readonly prisma: PrismaService,

    private readonly configService: ConfigService,

    private readonly emailService: EmailService,

    private readonly teamSeatLimitService: TeamSeatLimitService,
  ) {}

  async getTeam(user: JwtPayload, tenant: TenantContext) {
    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      const seats = await this.teamSeatLimitService.getUsageInTransaction(
        tx,
        tenant.organizationId,
        now,
      );

      const [members, invitations] = await Promise.all([
        tx.organizationMember.findMany({
          where: {
            organizationId: tenant.organizationId,
          },

          orderBy: [
            {
              role: 'asc',
            },
            {
              joinedAt: 'asc',
            },
          ],

          select: {
            id: true,
            role: true,
            isActive: true,
            deactivatedAt: true,
            seatLimitSuspendedAt: true,
            joinedAt: true,

            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                lastLoginAt: true,
              },
            },
          },
        }),

        tx.organizationInvitation.findMany({
          where: {
            organizationId: tenant.organizationId,
            status: 'PENDING',
            expiresAt: {
              gt: now,
            },
          },

          orderBy: {
            createdAt: 'desc',
          },

          select: {
            id: true,
            email: true,
            role: true,
            status: true,
            expiresAt: true,
            lastSentAt: true,
            resendCount: true,
            createdAt: true,

            invitedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        }),
      ]);

      return {
        seats,

        permissions: {
          canManageTeam: tenant.role === 'OWNER' || tenant.role === 'ADMIN',
          canInviteAdmins: tenant.role === 'OWNER',
        },

        members: members.map((member) => ({
          ...this.serializeTeamMember(member),
          canManage: this.canManageMember(user, tenant, member),
        })),

        invitations,
      };
    });
  }

  async createInvitation(
    user: JwtPayload,
    tenant: TenantContext,
    dto: CreateTeamInvitationDto,
  ) {
    this.assertCanAssignRole(tenant, dto.role);

    const email = this.normalizeEmail(dto.email);

    const rawToken = randomBytes(32).toString('base64url');

    const tokenHash = this.hashToken(rawToken);

    const now = new Date();

    const expiresAt = new Date(now.getTime() + INVITATION_EXPIRY_MILLISECONDS);

    const invitation = await this.runSerializable(async (tx) => {
      /*
       * Mark expired invitations before checking
       * for a duplicate pending invitation.
       */
      await this.teamSeatLimitService.getUsageInTransaction(
        tx,
        tenant.organizationId,
        now,
      );

      const existingUser = await tx.user.findFirst({
        where: {
          email: {
            equals: email,
            mode: 'insensitive',
          },
        },

        select: {
          id: true,
          status: true,
        },
      });

      if (existingUser) {
        const membership = await tx.organizationMember.findUnique({
          where: {
            organizationId_userId: {
              organizationId: tenant.organizationId,
              userId: existingUser.id,
            },
          },

          select: {
            isActive: true,
          },
        });

        if (membership?.isActive) {
          throw new ConflictException(
            'This user is already an active member of the organization.',
          );
        }

        if (membership) {
          throw new ConflictException(
            'This user already has an inactive membership. Reactivate the member instead.',
          );
        }

        if (existingUser.status !== 'ACTIVE') {
          throw new ConflictException(
            'This user account is currently unavailable.',
          );
        }
      }

      const pendingInvitation = await tx.organizationInvitation.findFirst({
        where: {
          organizationId: tenant.organizationId,
          email: {
            equals: email,
            mode: 'insensitive',
          },
          status: 'PENDING',
          expiresAt: {
            gt: now,
          },
        },

        select: {
          id: true,
        },
      });

      if (pendingInvitation) {
        throw new ConflictException(
          'A pending invitation already exists for this email address.',
        );
      }

      await this.teamSeatLimitService.assertSeatAvailableInTransaction(
        tx,
        tenant.organizationId,
        now,
      );

      return tx.organizationInvitation.create({
        data: {
          organizationId: tenant.organizationId,
          email,
          role: dto.role,
          status: 'PENDING',
          tokenHash,
          invitedById: user.sub,
          expiresAt,
          lastSentAt: now,
        },

        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          expiresAt: true,
          lastSentAt: true,
          resendCount: true,
          createdAt: true,

          invitedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    });

    const invitationUrl = this.createInvitationUrl(rawToken);

    try {
      await this.emailService.sendTeamInvitation({
        to: invitation.email,
        organizationName: tenant.organizationName,
        inviterName: invitation.invitedBy?.name ?? 'A QUFO administrator',
        role: invitation.role,
        invitationUrl,
        expiresInDays: INVITATION_EXPIRY_DAYS,
      });
    } catch (error) {
      /*
       * A failed email must not keep consuming
       * a reserved team seat.
       */
      await this.prisma.organizationInvitation.updateMany({
        where: {
          id: invitation.id,
          status: 'PENDING',
        },

        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
        },
      });

      throw error;
    }

    const seats = await this.teamSeatLimitService.getUsage(
      tenant.organizationId,
    );

    return {
      message: `Invitation sent to ${invitation.email}.`,
      invitation,
      seats,
    };
  }

  async resendInvitation(
    user: JwtPayload,
    tenant: TenantContext,
    invitationId: string,
  ) {
    const rawToken = randomBytes(32).toString('base64url');

    const tokenHash = this.hashToken(rawToken);

    const now = new Date();

    const expiresAt = new Date(now.getTime() + INVITATION_EXPIRY_MILLISECONDS);

    const result = await this.runSerializable(async (tx) => {
      /*
       * Mark expired invitations first. An expired
       * invitation no longer reserves a team seat.
       */
      await this.teamSeatLimitService.getUsageInTransaction(
        tx,
        tenant.organizationId,
        now,
      );

      const existing = await tx.organizationInvitation.findFirst({
        where: {
          id: invitationId,
          organizationId: tenant.organizationId,
        },

        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          tokenHash: true,
          expiresAt: true,
          lastSentAt: true,
          resendCount: true,
          invitedById: true,
        },
      });

      if (!existing || existing.status !== 'PENDING') {
        throw new BadRequestException(
          'This team invitation is no longer available.',
        );
      }

      this.assertCanAssignRole(tenant, existing.role);

      const updated = await tx.organizationInvitation.updateMany({
        where: {
          id: existing.id,
          organizationId: tenant.organizationId,
          status: 'PENDING',
          tokenHash: existing.tokenHash,
          expiresAt: {
            gt: now,
          },
        },

        data: {
          tokenHash,
          expiresAt,
          lastSentAt: now,
          resendCount: {
            increment: 1,
          },
          invitedById: user.sub,
        },
      });

      if (updated.count !== 1) {
        throw new ConflictException(
          'This team invitation changed while it was being resent.',
        );
      }

      const invitation = await tx.organizationInvitation.findUnique({
        where: {
          id: existing.id,
        },

        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          expiresAt: true,
          lastSentAt: true,
          resendCount: true,
          createdAt: true,

          invitedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!invitation) {
        throw new ConflictException(
          'The updated team invitation could not be found.',
        );
      }

      return {
        previous: existing,
        invitation,
      };
    });

    try {
      await this.emailService.sendTeamInvitation({
        to: result.invitation.email,
        organizationName: tenant.organizationName,
        inviterName:
          result.invitation.invitedBy?.name ?? 'A QUFO administrator',
        role: result.invitation.role,
        invitationUrl: this.createInvitationUrl(rawToken),
        expiresInDays: INVITATION_EXPIRY_DAYS,
      });
    } catch (error) {
      /*
       * Restore the previous token if the new email fails.
       * This keeps the link from the first email usable.
       */
      await this.prisma.organizationInvitation.updateMany({
        where: {
          id: result.invitation.id,
          organizationId: tenant.organizationId,
          status: 'PENDING',
          tokenHash,
        },

        data: {
          tokenHash: result.previous.tokenHash,
          expiresAt: result.previous.expiresAt,
          lastSentAt: result.previous.lastSentAt,
          resendCount: result.previous.resendCount,
          invitedById: result.previous.invitedById,
        },
      });

      throw error;
    }

    const seats = await this.teamSeatLimitService.getUsage(
      tenant.organizationId,
    );

    return {
      message: `Invitation resent to ${result.invitation.email}.`,
      invitation: result.invitation,
      seats,
    };
  }

  async cancelInvitation(tenant: TenantContext, invitationId: string) {
    const now = new Date();

    const result = await this.runSerializable(async (tx) => {
      await this.teamSeatLimitService.getUsageInTransaction(
        tx,
        tenant.organizationId,
        now,
      );

      const invitation = await tx.organizationInvitation.findFirst({
        where: {
          id: invitationId,
          organizationId: tenant.organizationId,
        },

        select: {
          id: true,
          email: true,
          role: true,
          status: true,
        },
      });

      if (!invitation || invitation.status !== 'PENDING') {
        throw new BadRequestException(
          'This team invitation is no longer available.',
        );
      }

      this.assertCanAssignRole(tenant, invitation.role);

      const cancelled = await tx.organizationInvitation.updateMany({
        where: {
          id: invitation.id,
          organizationId: tenant.organizationId,
          status: 'PENDING',
        },

        data: {
          status: 'CANCELLED',
          cancelledAt: now,
        },
      });

      if (cancelled.count !== 1) {
        throw new ConflictException(
          'This team invitation changed while it was being cancelled.',
        );
      }

      const seats = await this.teamSeatLimitService.getUsageInTransaction(
        tx,
        tenant.organizationId,
        now,
      );

      return {
        invitation,
        seats,
      };
    });

    return {
      message: `Invitation for ${result.invitation.email} cancelled.`,
      invitationId: result.invitation.id,
      seats: result.seats,
    };
  }

  async updateMemberRole(
    user: JwtPayload,
    tenant: TenantContext,
    membershipId: string,
    dto: UpdateTeamMemberRoleDto,
  ) {
    this.assertCanAssignRole(tenant, dto.role);

    const now = new Date();

    const result = await this.runSerializable(async (tx) => {
      const existing = await tx.organizationMember.findFirst({
        where: {
          id: membershipId,
          organizationId: tenant.organizationId,
        },

        select: {
          id: true,
          userId: true,
          role: true,
          isActive: true,
          deactivatedAt: true,
          seatLimitSuspendedAt: true,
          joinedAt: true,

          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              lastLoginAt: true,
            },
          },
        },
      });

      if (!existing) {
        throw new BadRequestException('This team member could not be found.');
      }

      this.assertCanManageMember(user, tenant, existing);

      const member =
        existing.role === dto.role
          ? existing
          : await tx.organizationMember.update({
              where: {
                id: existing.id,
              },

              data: {
                role: dto.role,
              },

              select: {
                id: true,
                userId: true,
                role: true,
                isActive: true,
                deactivatedAt: true,
                seatLimitSuspendedAt: true,
                joinedAt: true,

                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                    lastLoginAt: true,
                  },
                },
              },
            });

      const seats = await this.teamSeatLimitService.getUsageInTransaction(
        tx,
        tenant.organizationId,
        now,
      );

      return {
        member,
        seats,
      };
    });

    return {
      message: `${result.member.user.name} is now ${this.formatRole(dto.role)}.`,
      member: {
        ...this.serializeTeamMember(result.member),
        canManage: this.canManageMember(user, tenant, result.member),
      },
      seats: result.seats,
    };
  }

  async deactivateMember(
    user: JwtPayload,
    tenant: TenantContext,
    membershipId: string,
  ) {
    const now = new Date();

    const result = await this.runSerializable(async (tx) => {
      const existing = await tx.organizationMember.findFirst({
        where: {
          id: membershipId,
          organizationId: tenant.organizationId,
        },

        select: {
          id: true,
          userId: true,
          role: true,
          isActive: true,
          deactivatedAt: true,
          seatLimitSuspendedAt: true,
          joinedAt: true,

          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              lastLoginAt: true,
            },
          },
        },
      });

      if (!existing) {
        throw new BadRequestException('This team member could not be found.');
      }

      this.assertCanManageMember(user, tenant, existing);

      const alreadyManuallyInactive =
        !existing.isActive &&
        existing.deactivatedAt !== null &&
        existing.seatLimitSuspendedAt === null;

      const member = alreadyManuallyInactive
        ? existing
        : await tx.organizationMember.update({
            where: {
              id: existing.id,
            },

            data: {
              isActive: false,
              deactivatedAt: now,
              seatLimitSuspendedAt: null,
            },

            select: {
              id: true,
              userId: true,
              role: true,
              isActive: true,
              deactivatedAt: true,
              seatLimitSuspendedAt: true,
              joinedAt: true,

              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                  lastLoginAt: true,
                },
              },
            },
          });

      const seats = await this.teamSeatLimitService.getUsageInTransaction(
        tx,
        tenant.organizationId,
        now,
      );

      return {
        alreadyManuallyInactive,
        member,
        seats,
      };
    });

    return {
      message: result.alreadyManuallyInactive
        ? `${result.member.user.name} is already inactive.`
        : `${result.member.user.name} has been deactivated.`,
      member: {
        ...this.serializeTeamMember(result.member),
        canManage: this.canManageMember(user, tenant, result.member),
      },
      seats: result.seats,
    };
  }

  async reactivateMember(
    user: JwtPayload,
    tenant: TenantContext,
    membershipId: string,
  ) {
    const now = new Date();

    const result = await this.runSerializable(async (tx) => {
      const existing = await tx.organizationMember.findFirst({
        where: {
          id: membershipId,
          organizationId: tenant.organizationId,
        },

        select: {
          id: true,
          userId: true,
          role: true,
          isActive: true,
          deactivatedAt: true,
          seatLimitSuspendedAt: true,
          joinedAt: true,

          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              lastLoginAt: true,
            },
          },
        },
      });

      if (!existing) {
        throw new BadRequestException('This team member could not be found.');
      }

      this.assertCanManageMember(user, tenant, existing);

      if (!existing.isActive) {
        await this.teamSeatLimitService.assertSeatAvailableInTransaction(
          tx,
          tenant.organizationId,
          now,
        );
      }

      const member = existing.isActive
        ? existing
        : await tx.organizationMember.update({
            where: {
              id: existing.id,
            },

            data: {
              isActive: true,
              deactivatedAt: null,
              seatLimitSuspendedAt: null,
            },

            select: {
              id: true,
              userId: true,
              role: true,
              isActive: true,
              deactivatedAt: true,
              seatLimitSuspendedAt: true,
              joinedAt: true,

              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                  lastLoginAt: true,
                },
              },
            },
          });

      const seats = await this.teamSeatLimitService.getUsageInTransaction(
        tx,
        tenant.organizationId,
        now,
      );

      return {
        alreadyActive: existing.isActive,
        member,
        seats,
      };
    });

    return {
      message: result.alreadyActive
        ? `${result.member.user.name} is already active.`
        : `${result.member.user.name} has been reactivated.`,
      member: {
        ...this.serializeTeamMember(result.member),
        canManage: this.canManageMember(user, tenant, result.member),
      },
      seats: result.seats,
    };
  }

  async resolveInvitation(dto: TeamInvitationTokenDto) {
    const tokenHash = this.hashToken(dto.token.trim());

    const now = new Date();

    const invitation = await this.prisma.organizationInvitation.findUnique({
      where: {
        tokenHash,
      },

      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        expiresAt: true,

        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
          },
        },

        invitedBy: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!invitation) {
      return {
        valid: false,
        reason: 'INVALID' as const,
        invitation: null,
      };
    }

    if (invitation.status === 'PENDING' && invitation.expiresAt <= now) {
      await this.prisma.organizationInvitation.updateMany({
        where: {
          id: invitation.id,
          status: 'PENDING',
        },

        data: {
          status: 'EXPIRED',
        },
      });

      return {
        valid: false,
        reason: 'EXPIRED' as const,
        invitation: null,
      };
    }

    if (invitation.status !== 'PENDING') {
      const reason =
        invitation.status === 'ACCEPTED'
          ? ('ACCEPTED' as const)
          : invitation.status === 'CANCELLED'
            ? ('CANCELLED' as const)
            : invitation.status === 'EXPIRED'
              ? ('EXPIRED' as const)
              : ('UNAVAILABLE' as const);

      return {
        valid: false,
        reason,
        invitation: null,
      };
    }

    return {
      valid: true,
      reason: null,

      invitation: {
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
        organization: invitation.organization,
        invitedByName: invitation.invitedBy?.name ?? null,
      },
    };
  }

  async acceptInvitation(user: JwtPayload, dto: TeamInvitationTokenDto) {
    const tokenHash = this.hashToken(dto.token.trim());

    const now = new Date();

    const result = await this.runSerializable(async (tx) => {
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
          acceptedById: true,

          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              status: true,
              subscription: {
                select: {
                  plan: true,
                  status: true,
                  trialEndsAt: true,
                  currentPeriodEnd: true,
                },
              },
            },
          },
        },
      });

      if (!invitation) {
        throw new BadRequestException('This team invitation is invalid.');
      }

      if (invitation.status === 'PENDING' && invitation.expiresAt <= now) {
        await tx.organizationInvitation.updateMany({
          where: {
            id: invitation.id,
            status: 'PENDING',
          },

          data: {
            status: 'EXPIRED',
          },
        });

        return {
          outcome: 'EXPIRED' as const,
        };
      }

      /*
       * Repeated acceptance by the same user
       * is treated as an idempotent request.
       */
      if (invitation.status === 'ACCEPTED') {
        if (invitation.acceptedById !== user.sub) {
          throw new BadRequestException(
            'This team invitation has already been accepted.',
          );
        }

        const membership = await tx.organizationMember.findUnique({
          where: {
            organizationId_userId: {
              organizationId: invitation.organizationId,
              userId: user.sub,
            },
          },

          select: {
            id: true,
            role: true,
            isActive: true,
            joinedAt: true,
          },
        });

        if (!membership) {
          throw new BadRequestException(
            'The accepted team membership could not be found.',
          );
        }

        const seats = await this.teamSeatLimitService.getUsageInTransaction(
          tx,
          invitation.organizationId,
          now,
        );

        return {
          outcome: 'ACCEPTED' as const,
          alreadyAccepted: true,

          organization: {
            id: invitation.organization.id,
            name: invitation.organization.name,
            slug: invitation.organization.slug,
            role: membership.role,
            subscription: invitation.organization.subscription,
          },

          membership,
          seats,
        };
      }

      if (invitation.status !== 'PENDING') {
        return {
          outcome: 'UNAVAILABLE' as const,
        };
      }

      if (invitation.organization.status !== 'ACTIVE') {
        throw new BadRequestException(
          'This organization is currently unavailable.',
        );
      }

      const acceptingUser = await tx.user.findUnique({
        where: {
          id: user.sub,
        },

        select: {
          id: true,
          email: true,
          status: true,
        },
      });

      if (!acceptingUser || acceptingUser.status !== 'ACTIVE') {
        throw new UnauthorizedException('Authentication required.');
      }

      if (
        this.normalizeEmail(acceptingUser.email) !==
        this.normalizeEmail(invitation.email)
      ) {
        throw new ForbiddenException(
          'Sign in using the email address that received this invitation.',
        );
      }

      /*
       * Atomically claim the still-valid invitation.
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
          acceptedById: acceptingUser.id,
          acceptedAt: now,
        },
      });

      if (claimed.count !== 1) {
        throw new ConflictException(
          'This team invitation changed while it was being accepted.',
        );
      }

      const membership = await tx.organizationMember.upsert({
        where: {
          organizationId_userId: {
            organizationId: invitation.organizationId,
            userId: acceptingUser.id,
          },
        },

        create: {
          organizationId: invitation.organizationId,
          userId: acceptingUser.id,
          role: invitation.role,
          isActive: true,
        },

        update: {
          role: invitation.role,
          isActive: true,
          deactivatedAt: null,
          seatLimitSuspendedAt: null,
        },

        select: {
          id: true,
          role: true,
          isActive: true,
          joinedAt: true,
        },
      });

      /*
       * The pending invitation already occupied one seat.
       * Acceptance converts that reservation into a member.
       */
      const seats = await this.teamSeatLimitService.getUsageInTransaction(
        tx,
        invitation.organizationId,
        now,
      );

      return {
        outcome: 'ACCEPTED' as const,
        alreadyAccepted: false,

        organization: {
          id: invitation.organization.id,
          name: invitation.organization.name,
          slug: invitation.organization.slug,
          role: membership.role,
          subscription: invitation.organization.subscription,
        },

        membership,
        seats,
      };
    });

    if (result.outcome === 'EXPIRED') {
      throw new BadRequestException('This team invitation has expired.');
    }

    if (result.outcome === 'UNAVAILABLE') {
      throw new BadRequestException(
        'This team invitation is no longer available.',
      );
    }

    return {
      message: result.alreadyAccepted
        ? 'This team invitation has already been accepted.'
        : `You joined ${result.organization.name} successfully.`,

      alreadyAccepted: result.alreadyAccepted,
      organization: result.organization,
      membership: result.membership,
      seats: result.seats,
    };
  }

  private serializeTeamMember(member: TeamMemberRecord) {
    return {
      id: member.id,
      role: member.role,
      isActive: member.isActive,
      deactivatedAt: member.deactivatedAt,
      seatLimitSuspendedAt: member.seatLimitSuspendedAt,
      joinedAt: member.joinedAt,
      suspensionReason: member.seatLimitSuspendedAt
        ? ('SEAT_LIMIT' as const)
        : member.isActive
          ? null
          : ('MANUAL' as const),
      user: member.user,
    };
  }

  private canManageMember(
    user: JwtPayload,
    tenant: TenantContext,
    member: Pick<TeamMemberRecord, 'role' | 'user'>,
  ) {
    if (member.user.id === user.sub || member.role === 'OWNER') {
      return false;
    }

    if (tenant.role === 'OWNER') {
      return true;
    }

    return tenant.role === 'ADMIN' && member.role !== 'ADMIN';
  }

  private assertCanManageMember(
    user: JwtPayload,
    tenant: TenantContext,
    member: Pick<TeamMemberRecord, 'role' | 'user'>,
  ) {
    if (this.canManageMember(user, tenant, member)) {
      return;
    }

    throw new ForbiddenException(
      'You do not have permission to manage this team member.',
    );
  }

  private assertCanAssignRole(
    tenant: TenantContext,
    role: CreateTeamInvitationDto['role'] | 'OWNER',
  ) {
    if (role === 'OWNER') {
      throw new ForbiddenException(
        'The workspace owner role cannot be assigned.',
      );
    }

    if (tenant.role === 'OWNER') {
      return;
    }

    if (tenant.role === 'ADMIN' && (role === 'MANAGER' || role === 'STAFF')) {
      return;
    }

    throw new ForbiddenException(
      'You do not have permission to assign this role.',
    );
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token, 'utf8').digest('hex');
  }

  private createInvitationUrl(rawToken: string) {
    const webUrl = (
      this.configService.get<string>('WEB_URL') ?? 'https://qufo.im'
    ).replace(/\/+$/, '');

    return `${webUrl}/join?token=${encodeURIComponent(rawToken)}`;
  }

  private formatRole(role: CreateTeamInvitationDto['role']) {
    return role.charAt(0) + role.slice(1).toLowerCase();
  }

  private async runSerializable<T>(
    operation: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    const maxAttempts = 3;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      try {
        return await this.prisma.$transaction(operation, {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        });
      } catch (error) {
        const shouldRetry =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2034' &&
          attempt < maxAttempts - 1;

        if (shouldRetry) {
          continue;
        }

        throw error;
      }
    }

    throw new Error('Unable to create the team invitation.');
  }
}
