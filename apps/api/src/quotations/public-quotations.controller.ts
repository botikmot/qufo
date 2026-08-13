import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { RespondQuotationDto } from './dto/respond-quotation.dto';
import { QuotationsService } from './quotations.service';
import { CustomerQuotationFeedbackDto } from './dto/customer-quotation-feedback.dto';

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
}
