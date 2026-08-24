import { Type } from 'class-transformer';

import { IsInt, Max, Min } from 'class-validator';

export class RenewPlatformTenantDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  durationMonths: number = 1;
}
