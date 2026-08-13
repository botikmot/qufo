import { Controller, Get, Param } from '@nestjs/common';

import { JobsService } from './jobs.service';

@Controller('public/jobs')
export class PublicJobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get(':token')
  track(
    @Param('token')
    token: string,
  ) {
    return this.jobsService.findPublicJob(token);
  }
}
