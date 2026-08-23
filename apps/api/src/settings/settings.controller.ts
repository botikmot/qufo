import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';

import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { SubscriptionGuard } from '../auth/guards/subscription.guard';

import type { TenantContext } from '../auth/types/tenant-context.type';

import { UpdateBusinessSettingsDto } from './dto/update-business-settings.dto';
import { UpdateProfileSettingsDto } from './dto/update-profile-settings.dto';
import { SettingsService } from './settings.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.type';

@Controller('settings')
@UseGuards(AuthGuard, TenantGuard, SubscriptionGuard, RolesGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('business')
  getBusinessSettings(
    @CurrentUser()
    user: JwtPayload,

    @CurrentTenant()
    tenant: TenantContext,
  ) {
    return this.settingsService.getBusinessSettings(user, tenant);
  }

  @Roles('OWNER', 'ADMIN')
  @Patch('business')
  updateBusinessSettings(
    @CurrentTenant()
    tenant: TenantContext,

    @Body()
    dto: UpdateBusinessSettingsDto,
  ) {
    return this.settingsService.updateBusinessSettings(tenant, dto);
  }

  @Get('profile')
  getProfileSettings(
    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.settingsService.getProfileSettings(user);
  }

  @Patch('profile')
  updateProfileSettings(
    @CurrentUser()
    user: JwtPayload,

    @Body()
    dto: UpdateProfileSettingsDto,
  ) {
    return this.settingsService.updateProfileSettings(user, dto);
  }

  @Get('subscription')
  getSubscriptionSettings(
    @CurrentTenant()
    tenant: TenantContext,
  ) {
    return this.settingsService.getSubscriptionSettings(tenant);
  }
}
