import { Controller, Get, UseGuards } from '@nestjs/common';

import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';

import { AuthGuard } from '../auth/guards/auth.guard';
import { SubscriptionGuard } from '../auth/guards/subscription.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';

import type { TenantContext } from '../auth/types/tenant-context.type';

import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(AuthGuard, TenantGuard, SubscriptionGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getDashboard(
    @CurrentTenant()
    tenant: TenantContext,
  ) {
    return this.dashboardService.getDashboard(tenant);
  }
}
