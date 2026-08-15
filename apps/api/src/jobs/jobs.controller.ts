import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Delete,
} from '@nestjs/common';

import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';

import type { JwtPayload } from '../auth/types/jwt-payload.type';
import type { TenantContext } from '../auth/types/tenant-context.type';

import { JobQueryDto } from './dto/job-query.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';

import { JobsService } from './jobs.service';
import { SubscriptionGuard } from '../auth/guards/subscription.guard';

@Controller('jobs')
@UseGuards(AuthGuard, TenantGuard, SubscriptionGuard, RolesGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  findAll(
    @CurrentTenant()
    tenant: TenantContext,

    @Query()
    query: JobQueryDto,
  ) {
    return this.jobsService.findAll(tenant, query);
  }

  @Get(':id')
  findOne(
    @CurrentTenant()
    tenant: TenantContext,

    @Param('id')
    id: string,
  ) {
    return this.jobsService.findOne(tenant, id);
  }

  @Roles('OWNER', 'ADMIN', 'MANAGER')
  @Patch(':id')
  update(
    @CurrentTenant()
    tenant: TenantContext,

    @Param('id')
    id: string,

    @Body()
    dto: UpdateJobDto,
  ) {
    return this.jobsService.update(tenant, id, dto);
  }

  @Roles('OWNER', 'ADMIN', 'MANAGER', 'STAFF')
  @Post(':id/status')
  updateStatus(
    @CurrentUser()
    user: JwtPayload,

    @CurrentTenant()
    tenant: TenantContext,

    @Param('id')
    id: string,

    @Body()
    dto: UpdateJobStatusDto,
  ) {
    return this.jobsService.updateStatus(user, tenant, id, dto);
  }

  @Roles('OWNER', 'ADMIN', 'MANAGER')
  @Post(':id/tracking-link')
  generateTrackingLink(
    @CurrentTenant()
    tenant: TenantContext,

    @Param('id')
    id: string,
  ) {
    return this.jobsService.generateTrackingLink(tenant, id);
  }

  @Roles('OWNER', 'ADMIN', 'MANAGER')
  @Delete(':id/tracking-link')
  disableTracking(
    @CurrentTenant()
    tenant: TenantContext,

    @Param('id')
    id: string,
  ) {
    return this.jobsService.disableTracking(tenant, id);
  }

  @Roles('OWNER', 'ADMIN', 'MANAGER')
  @Post(':id/reopen')
  reopen(
    @CurrentUser()
    user: JwtPayload,

    @CurrentTenant()
    tenant: TenantContext,

    @Param('id')
    id: string,
  ) {
    return this.jobsService.reopen(user, tenant, id);
  }
}
