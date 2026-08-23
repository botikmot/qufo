import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';

import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SubscriptionGuard } from '../auth/guards/subscription.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';

import type { TenantContext } from '../auth/types/tenant-context.type';

import { ReportsQueryDto } from './dto/reports-query.dto';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(AuthGuard, TenantGuard, SubscriptionGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  getReport(
    @CurrentTenant()
    tenant: TenantContext,

    @Query()
    query: ReportsQueryDto,
  ) {
    return this.reportsService.getReport(tenant, query);
  }
}
