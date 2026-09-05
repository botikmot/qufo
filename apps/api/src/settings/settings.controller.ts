import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SubscriptionGuard } from '../auth/guards/subscription.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';

import type { JwtPayload } from '../auth/types/jwt-payload.type';
import type { TenantContext } from '../auth/types/tenant-context.type';

import { UpdateBusinessSettingsDto } from './dto/update-business-settings.dto';
import { UpdateProfileSettingsDto } from './dto/update-profile-settings.dto';
import { UpdateQuotationSignatureSettingsDto } from './dto/update-quotation-signature-settings.dto';

import { SettingsService } from './settings.service';

@Controller('settings')
@UseGuards(AuthGuard, TenantGuard, SubscriptionGuard, RolesGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Roles('OWNER', 'ADMIN')
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

  @Roles('OWNER')
  @Get('subscription')
  getSubscriptionSettings(
    @CurrentTenant()
    tenant: TenantContext,
  ) {
    return this.settingsService.getSubscriptionSettings(tenant);
  }

  @Roles('OWNER', 'ADMIN')
  @Patch('business/logo')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  uploadBusinessLogo(
    @CurrentTenant()
    tenant: TenantContext,

    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return this.settingsService.uploadBusinessLogo(tenant.organizationId, file);
  }

  @Roles('OWNER', 'ADMIN')
  @Delete('business/logo')
  removeBusinessLogo(
    @CurrentTenant()
    tenant: TenantContext,
  ) {
    return this.settingsService.removeBusinessLogo(tenant.organizationId);
  }

  @Roles('OWNER', 'ADMIN')
  @Post('quotation-signature')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
    }),
  )
  uploadQuotationSignature(
    @CurrentTenant()
    tenant: TenantContext,

    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return this.settingsService.uploadQuotationSignature(
      tenant.organizationId,
      file,
    );
  }

  @Roles('OWNER', 'ADMIN')
  @Delete('quotation-signature')
  removeQuotationSignature(
    @CurrentTenant()
    tenant: TenantContext,
  ) {
    return this.settingsService.removeQuotationSignature(tenant.organizationId);
  }

  @Roles('OWNER', 'ADMIN')
  @Patch('quotation-signature')
  updateQuotationSignatureSettings(
    @CurrentTenant()
    tenant: TenantContext,

    @Body()
    dto: UpdateQuotationSignatureSettingsDto,
  ) {
    return this.settingsService.updateQuotationSignatureSettings(
      tenant.organizationId,
      dto,
    );
  }
}
