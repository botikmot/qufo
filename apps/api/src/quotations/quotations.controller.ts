import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';

import type { JwtPayload } from '../auth/types/jwt-payload.type';
import type { TenantContext } from '../auth/types/tenant-context.type';

import { CreateQuotationDto } from './dto/create-quotation.dto';
import { QuotationQueryDto } from './dto/quotation-query.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';

import { QuotationsService } from './quotations.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { ConvertQuotationToJobDto } from './dto/convert-quotation-to-job.dto';
import { SubscriptionGuard } from '../auth/guards/subscription.guard';

@Controller('quotations')
@UseGuards(AuthGuard, TenantGuard, SubscriptionGuard, RolesGuard)
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Post()
  create(
    @CurrentUser()
    user: JwtPayload,

    @CurrentTenant()
    tenant: TenantContext,

    @Body()
    dto: CreateQuotationDto,
  ) {
    return this.quotationsService.create(user, tenant, dto);
  }

  @Get()
  findAll(
    @CurrentTenant()
    tenant: TenantContext,

    @Query()
    query: QuotationQueryDto,
  ) {
    return this.quotationsService.findAll(tenant, query);
  }

  @Roles('OWNER', 'ADMIN', 'MANAGER')
  @Get(':id/public-link')
  getPublicLink(
    @CurrentTenant()
    tenant: TenantContext,

    @Param('id')
    id: string,
  ) {
    return this.quotationsService.getPublicLink(tenant, id);
  }

  @Roles('OWNER', 'ADMIN', 'MANAGER')
  @Post(':id/public-link/regenerate')
  regeneratePublicLink(
    @CurrentTenant()
    tenant: TenantContext,

    @Param('id')
    id: string,
  ) {
    return this.quotationsService.regeneratePublicLink(tenant, id);
  }

  @Get(':id')
  findOne(
    @CurrentTenant()
    tenant: TenantContext,

    @Param('id')
    id: string,
  ) {
    return this.quotationsService.findOne(tenant, id);
  }

  @Patch(':id')
  update(
    @CurrentTenant()
    tenant: TenantContext,

    @Param('id')
    id: string,

    @Body()
    dto: UpdateQuotationDto,
  ) {
    return this.quotationsService.update(tenant, id, dto);
  }

  @Roles('OWNER', 'ADMIN', 'MANAGER')
  @Post(':id/send')
  send(
    @CurrentTenant()
    tenant: TenantContext,

    @Param('id')
    id: string,
  ) {
    return this.quotationsService.send(tenant, id);
  }

  @Roles('OWNER', 'ADMIN', 'MANAGER')
  @Post(':id/convert-to-job')
  convertToJob(
    @CurrentUser()
    user: JwtPayload,

    @CurrentTenant()
    tenant: TenantContext,

    @Param('id')
    id: string,

    @Body()
    dto: ConvertQuotationToJobDto,
  ) {
    return this.quotationsService.convertToJob(user, tenant, id, dto);
  }

  @Roles('OWNER', 'ADMIN', 'MANAGER')
  @Post(':id/revise')
  createRevision(
    @CurrentUser()
    user: JwtPayload,

    @CurrentTenant()
    tenant: TenantContext,

    @Param('id')
    id: string,
  ) {
    return this.quotationsService.createRevision(user, tenant, id);
  }
}
