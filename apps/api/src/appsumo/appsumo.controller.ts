import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { AuthGuard } from '../auth/guards/auth.guard';

import { TenantGuard } from '../auth/guards/tenant.guard';

import { RolesGuard } from '../auth/guards/roles.guard';

import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';

import { Roles } from '../auth/decorators/roles.decorator';

import type { TenantContext } from '../auth/types/tenant-context.type';

import { AppSumoService } from './appsumo.service';

import { RedeemAppSumoCodeDto } from './dto/redeem-appsumo-code.dto';

@Controller('appsumo')
@UseGuards(AuthGuard, TenantGuard, RolesGuard)
export class AppSumoController {
  constructor(private readonly appSumoService: AppSumoService) {}

  @Roles('OWNER')
  @Post('redeem')
  redeem(
    @CurrentTenant()
    tenant: TenantContext,

    @Body()
    dto: RedeemAppSumoCodeDto,
  ) {
    return this.appSumoService.redeem(tenant, dto);
  }
}
