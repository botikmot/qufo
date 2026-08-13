import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { RespondQuotationDto } from './dto/respond-quotation.dto';
import { QuotationsService } from './quotations.service';

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
    dto: RespondQuotationDto,
  ) {
    return this.quotationsService.rejectPublicQuotation(token, dto);
  }
}
