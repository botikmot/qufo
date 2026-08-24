import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import type { AuthenticatedRequest } from '../types/authenticated-request.type';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PlatformAdminGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const authenticatedUser = request.user;

    if (!authenticatedUser) {
      throw new UnauthorizedException('Authentication required.');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: authenticatedUser.sub,
      },

      select: {
        id: true,
        status: true,
        platformRole: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User account not found.');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User account is not active.');
    }

    if (user.platformRole !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Platform administrator access required.');
    }

    return true;
  }
}
