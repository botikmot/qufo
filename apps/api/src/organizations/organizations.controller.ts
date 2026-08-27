import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';

import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SubscriptionGuard } from '../auth/guards/subscription.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';

import type { TenantContext } from '../auth/types/tenant-context.type';

import { UpdateOrganizationDto } from './dto/update-organization.dto';

import { OrganizationsService } from './organizations.service';

@Controller('organizations')
@UseGuards(AuthGuard, TenantGuard, SubscriptionGuard, RolesGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get('current')
  findCurrent(
    @CurrentTenant()
    tenant: TenantContext,
  ) {
    return this.organizationsService.findCurrent(tenant);
  }

  @Roles('OWNER', 'ADMIN')
  @Patch('current')
  update(
    @CurrentTenant()
    tenant: TenantContext,

    @Body()
    dto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(tenant, dto);
  }
}
