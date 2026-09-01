import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';

import { AuthGuard } from '../auth/guards/auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { SubscriptionGuard } from '../auth/guards/subscription.guard';

import type { TenantContext } from '../auth/types/tenant-context.type';

import { UploadsService } from './uploads.service';

@Controller('uploads')
@UseGuards(AuthGuard, TenantGuard, SubscriptionGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('quotation-item-image')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  uploadQuotationItemImage(
    @CurrentTenant()
    tenant: TenantContext,

    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return this.uploadsService.uploadQuotationItemImage(
      file,
      tenant.organizationId,
    );
  }

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
    return this.uploadsService.uploadQuotationSignature(
      file,
      tenant.organizationId,
    );
  }
}
