import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';

import { Roles } from '../auth/decorators/roles.decorator';

import { AuthGuard } from '../auth/guards/auth.guard';

import { RolesGuard } from '../auth/guards/roles.guard';

import { TenantGuard } from '../auth/guards/tenant.guard';

import type { TenantContext } from '../auth/types/tenant-context.type';

import { SubscriptionsBillingService } from './subscriptions-billing.service';
import { CreateSubscriptionCheckoutDto } from './dto/create-subscription-checkout.dto';
import { CapturePayPalOrderDto } from './dto/capture-paypal-order.dto';

@Controller('subscriptions/billing')
@UseGuards(AuthGuard, TenantGuard, RolesGuard)
export class SubscriptionsBillingController {
  constructor(private readonly billingService: SubscriptionsBillingService) {}

  @Roles('OWNER', 'ADMIN')
  @Get()
  getBillingSummary(
    @CurrentTenant()
    tenant: TenantContext,
  ) {
    return this.billingService.getBillingSummary(tenant);
  }

  @Roles('OWNER', 'ADMIN')
  @Post('checkout')
  createCheckout(
    @CurrentTenant()
    tenant: TenantContext,

    @Body()
    dto: CreateSubscriptionCheckoutDto,
  ) {
    return this.billingService.createCheckout(tenant, dto);
  }

  @Get('payments')
  async getPayments(
    @CurrentTenant()
    tenant: TenantContext,
  ) {
    return this.billingService.getPaymentHistory(tenant.organizationId);
  }

  @Post('paypal/capture')
  async capturePayPal(
    @CurrentTenant()
    tenant: TenantContext,

    @Body()
    dto: CapturePayPalOrderDto,
  ) {
    return this.billingService.capturePayPalOrder(
      tenant.organizationId,
      dto.orderId,
    );
  }
}
