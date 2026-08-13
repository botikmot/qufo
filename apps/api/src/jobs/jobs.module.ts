import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';

import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { PublicJobsController } from './public-jobs.controller';

@Module({
  imports: [AuthModule],

  controllers: [JobsController, PublicJobsController],

  providers: [JobsService],

  exports: [JobsService],
})
export class JobsModule {}
