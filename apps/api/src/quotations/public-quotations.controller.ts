import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { RespondQuotationDto } from './dto/respond-quotation.dto';
import { QuotationsService } from './quotations.service';
import { CustomerQuotationFeedbackDto } from './dto/customer-quotation-feedback.dto';

import { FileInterceptor } from '@nestjs/platform-express';

@Controller('public/quotations')
export class PublicQuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Get(':token')
  findPublicQuotation(
    @Param('token')
    token: string,
  ) {
    return this.quotationsService.findPublicQuotation(token);
  }

  @Post(':token/approve')
  approve(
    @Param('token')
    token: string,

    @Body()
    dto: RespondQuotationDto,
  ) {
    return this.quotationsService.approvePublicQuotation(token, dto);
  }

  @Post(':token/reject')
  reject(
    @Param('token')
    token: string,

    @Body()
    dto: CustomerQuotationFeedbackDto,
  ) {
    return this.quotationsService.rejectPublicQuotation(token, dto);
  }

  @Post(':token/request-changes')
  requestChanges(
    @Param('token')
    token: string,

    @Body()
    dto: CustomerQuotationFeedbackDto,
  ) {
    return this.quotationsService.requestChangesPublicQuotation(token, dto);
  }

  @Post(':token/job-confirmation')
  @UseInterceptors(
    FileInterceptor('pdf', {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  sendJobConfirmation(
    @Param('token')
    token: string,

    @UploadedFile()
    pdfFile?: Express.Multer.File,
  ) {
    if (!pdfFile) {
      throw new BadRequestException('Job confirmation PDF is required.');
    }

    if (pdfFile.mimetype !== 'application/pdf') {
      throw new BadRequestException(
        'Job confirmation attachment must be a PDF.',
      );
    }

    const signature = pdfFile.buffer.subarray(0, 5).toString();

    if (signature !== '%PDF-') {
      throw new BadRequestException('Invalid PDF attachment.');
    }

    return this.quotationsService.sendPublicJobConfirmation(token, pdfFile);
  }
}
