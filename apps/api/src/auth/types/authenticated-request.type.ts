import type { Request } from 'express';

import type { JwtPayload } from './jwt-payload.type';
import type { TenantContext } from './tenant-context.type';

export type AuthenticatedRequest = Request & {
  user: JwtPayload;
  tenant?: TenantContext;
};
