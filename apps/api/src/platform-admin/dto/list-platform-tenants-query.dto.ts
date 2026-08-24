import { Type } from 'class-transformer';

import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export const PLATFORM_TENANT_SUBSCRIPTION_STATUSES = [
  'TRIALING',
  'ACTIVE',
  'PAST_DUE',
  'CANCELLED',
  'EXPIRED',
] as const;

export type PlatformTenantSubscriptionStatus =
  (typeof PLATFORM_TENANT_SUBSCRIPTION_STATUSES)[number];

export class ListPlatformTenantsQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(PLATFORM_TENANT_SUBSCRIPTION_STATUSES)
  status?: PlatformTenantSubscriptionStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}
