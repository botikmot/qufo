import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { AuthGuard } from '../auth/guards/auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

import type { TenantContext } from '../auth/types/tenant-context.type';

import { BusinessProfilesService } from './business-profiles.service';
import { CreateBusinessProfileDto } from './dto/create-business-profile.dto';
import { UpdateBusinessProfileDto } from './dto/update-business-profile.dto';

import { FileInterceptor } from '@nestjs/platform-express';

@Controller('business-profiles')
@UseGuards(AuthGuard, TenantGuard)
export class BusinessProfilesController {
  constructor(
    private readonly businessProfilesService: BusinessProfilesService,
  ) {}

  /*
   * All authenticated organization members
   * may read profiles because quotation
   * creation will need this list.
   */
  @Get()
  findAll(
    @CurrentTenant()
    tenant: TenantContext,
  ) {
    return this.businessProfilesService.findAll(tenant);
  }

  /*
   * Only OWNER / ADMIN may manage
   * business profiles.
   */
  @Post()
  @Roles('OWNER', 'ADMIN')
  @UseGuards(RolesGuard)
  create(
    @CurrentTenant()
    tenant: TenantContext,

    @Body()
    dto: CreateBusinessProfileDto,
  ) {
    return this.businessProfilesService.create(tenant, dto);
  }

  @Patch('main/default')
  @Roles('OWNER', 'ADMIN')
  @UseGuards(RolesGuard)
  useMainBusinessAsDefault(
    @CurrentTenant()
    tenant: TenantContext,
  ) {
    return this.businessProfilesService.useMainBusinessAsDefault(tenant);
  }

  @Post(':id/logo')
  @Roles('OWNER', 'ADMIN')
  @UseGuards(RolesGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  uploadLogo(
    @CurrentTenant()
    tenant: TenantContext,

    @Param('id')
    id: string,

    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return this.businessProfilesService.uploadLogo(tenant, id, file);
  }

  @Delete(':id/logo')
  @Roles('OWNER', 'ADMIN')
  @UseGuards(RolesGuard)
  removeLogo(
    @CurrentTenant()
    tenant: TenantContext,

    @Param('id')
    id: string,
  ) {
    return this.businessProfilesService.removeLogo(tenant, id);
  }

  @Patch(':id')
  @Roles('OWNER', 'ADMIN')
  @UseGuards(RolesGuard)
  update(
    @CurrentTenant()
    tenant: TenantContext,

    @Param('id')
    id: string,

    @Body()
    dto: UpdateBusinessProfileDto,
  ) {
    return this.businessProfilesService.update(tenant, id, dto);
  }

  @Patch(':id/default')
  @Roles('OWNER', 'ADMIN')
  @UseGuards(RolesGuard)
  setDefault(
    @CurrentTenant()
    tenant: TenantContext,

    @Param('id')
    id: string,
  ) {
    return this.businessProfilesService.setDefault(tenant, id);
  }

  /*
   * Soft archive only.
   * Do NOT physically delete because
   * old quotations may reference it.
   */
  @Delete(':id')
  @Roles('OWNER', 'ADMIN')
  @UseGuards(RolesGuard)
  archive(
    @CurrentTenant()
    tenant: TenantContext,

    @Param('id')
    id: string,
  ) {
    return this.businessProfilesService.archive(tenant, id);
  }
}
