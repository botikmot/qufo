import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';

import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { PublicJobsController } from './public-jobs.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [AuthModule, NotificationsModule],

  controllers: [JobsController, PublicJobsController],

  providers: [JobsService],

  exports: [JobsService],
})
export class JobsModule {}
