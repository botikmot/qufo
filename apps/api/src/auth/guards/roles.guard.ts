import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '../decorators/roles.decorator';

import type { AuthenticatedRequest } from '../types/authenticated-request.type';
import type { OrganizationRole } from '../types/tenant-context.type';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<OrganizationRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const role = request.tenant?.role;

    if (!role) {
      throw new ForbiddenException('Organization context is required.');
    }

    if (!requiredRoles.includes(role)) {
      throw new ForbiddenException(
        'You do not have permission to perform this action.',
      );
    }

    return true;
  }
}
