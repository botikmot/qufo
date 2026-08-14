import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { SubscriptionGuard } from '../auth/guards/subscription.guard';

import type { JwtPayload } from '../auth/types/jwt-payload.type';
import type { TenantContext } from '../auth/types/tenant-context.type';

import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentQueryDto } from './dto/payment-query.dto';

import { PaymentsService } from './payments.service';

@Controller('payments')
@UseGuards(AuthGuard, TenantGuard, SubscriptionGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Roles('OWNER', 'ADMIN', 'MANAGER')
  @Post()
  create(
    @CurrentUser()
    user: JwtPayload,

    @CurrentTenant()
    tenant: TenantContext,

    @Body()
    dto: CreatePaymentDto,
  ) {
    return this.paymentsService.create(user, tenant, dto);
  }

  @Get()
  findAll(
    @CurrentTenant()
    tenant: TenantContext,

    @Query()
    query: PaymentQueryDto,
  ) {
    return this.paymentsService.findAll(tenant, query);
  }

  @Get('summary')
  getSummary(
    @CurrentTenant()
    tenant: TenantContext,
  ) {
    return this.paymentsService.getSummary(tenant);
  }

  @Get('job/:jobId')
  getJobPayments(
    @CurrentTenant()
    tenant: TenantContext,

    @Param('jobId')
    jobId: string,
  ) {
    return this.paymentsService.getJobPayments(tenant, jobId);
  }

  @Get(':id')
  findOne(
    @CurrentTenant()
    tenant: TenantContext,

    @Param('id')
    id: string,
  ) {
    return this.paymentsService.findOne(tenant, id);
  }

  @Roles('OWNER', 'ADMIN')
  @Post(':id/void')
  void(
    @CurrentTenant()
    tenant: TenantContext,

    @Param('id')
    id: string,
  ) {
    return this.paymentsService.void(tenant, id);
  }
}
