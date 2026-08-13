import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import type { AuthenticatedRequest } from '../types/authenticated-request.type';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.user) {
      throw new UnauthorizedException('Authentication required.');
    }

    const header = request.headers['x-organization-id'];

    const organizationId =
      typeof header === 'string' ? header.trim() : undefined;

    if (!organizationId) {
      throw new BadRequestException('X-Organization-Id header is required.');
    }

    const membership = await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: request.user.sub,
        },
      },

      include: {
        organization: {
          include: {
            subscription: true,
          },
        },
      },
    });

    if (!membership || !membership.isActive) {
      throw new ForbiddenException(
        'You do not have access to this organization.',
      );
    }

    if (membership.organization.status !== 'ACTIVE') {
      throw new ForbiddenException(
        'This organization is currently unavailable.',
      );
    }

    request.tenant = {
      organizationId: membership.organization.id,

      organizationName: membership.organization.name,

      organizationSlug: membership.organization.slug,

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
    };

    return true;
  }
}
