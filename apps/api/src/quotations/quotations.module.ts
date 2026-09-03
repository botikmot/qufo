import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { JobsModule } from '../jobs/jobs.module';

import { QuotationsController } from './quotations.controller';
import { QuotationsService } from './quotations.service';
import { PublicQuotationsController } from './public-quotations.controller';
import { RealtimeModule } from '../realtime/realtime.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [AuthModule, RealtimeModule, NotificationsModule, JobsModule],

  controllers: [QuotationsController, PublicQuotationsController],

  providers: [QuotationsService],

  exports: [QuotationsService],
})
export class QuotationsModule {}
