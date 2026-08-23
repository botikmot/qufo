import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SubscriptionGuard } from '../auth/guards/subscription.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';

import type { JwtPayload } from '../auth/types/jwt-payload.type';
import type { TenantContext } from '../auth/types/tenant-context.type';

import { SendSupportMessageDto } from './dto/send-support-message.dto';
import { SupportService } from './support.service';

@Controller('support')
@UseGuards(AuthGuard, TenantGuard, SubscriptionGuard, RolesGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('contact')
  sendMessage(
    @CurrentUser()
    user: JwtPayload,

    @CurrentTenant()
    tenant: TenantContext,

    @Body()
    dto: SendSupportMessageDto,
  ) {
    return this.supportService.sendMessage(user, tenant, dto);
  }
}
