import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '../auth/guards/auth.guard';

import { PlatformAdminGuard } from '../auth/guards/platform-admin.guard';

import { PlatformAdminService } from './platform-admin.service';
import { ListPlatformTenantsQueryDto } from './dto/list-platform-tenants-query.dto';
import { RenewPlatformTenantDto } from './dto/renew-platform-tenant.dto';

@Controller('platform-admin')
@UseGuards(AuthGuard, PlatformAdminGuard)
export class PlatformAdminController {
  constructor(private readonly platformAdminService: PlatformAdminService) {}

  @Get('dashboard')
  getDashboard() {
    return this.platformAdminService.getDashboard();
  }

  @Get('tenants')
  getTenants(
    @Query()
    query: ListPlatformTenantsQueryDto,
  ) {
    return this.platformAdminService.getTenants(query);
  }

  @Get('tenants/:id')
  getTenant(
    @Param('id')
    id: string,
  ) {
    return this.platformAdminService.getTenant(id);
  }

  @Post('tenants/:id/renew')
  renewTenant(
    @Param('id')
    id: string,

    @Body()
    dto: RenewPlatformTenantDto,
  ) {
    return this.platformAdminService.renewTenant(id, dto);
  }
}
