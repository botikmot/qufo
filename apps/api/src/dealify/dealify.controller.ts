import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { AuthGuard } from '../auth/guards/auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

import type { TenantContext } from '../auth/types/tenant-context.type';

import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

import { DealifyService } from './dealify.service';
import { RedeemDealifyCodeDto } from './dto/redeem-dealify-code.dto';

@Controller('dealify')
@UseGuards(AuthGuard, TenantGuard, RolesGuard, ThrottlerGuard)
export class DealifyController {
  constructor(private readonly dealifyService: DealifyService) {}

  @Roles('OWNER')
  @Throttle({
    default: {
      limit: 5,
      ttl: 10 * 60 * 1000,
    },
  })
  @Post('redeem')
  redeem(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: RedeemDealifyCodeDto,
  ) {
    return this.dealifyService.redeem(tenant, dto);
  }
}
