import { SetMetadata } from '@nestjs/common';

import type { OrganizationRole } from '../types/tenant-context.type';

export const ROLES_KEY = 'organization_roles';

export const Roles = (...roles: OrganizationRole[]) =>
  SetMetadata(ROLES_KEY, roles);
