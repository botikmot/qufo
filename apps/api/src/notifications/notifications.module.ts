import { Module } from '@nestjs/common';

import { NotificationsService } from './notifications.service';
import { CustomerEmailQuotaService } from './customer-email-quota.service';

@Module({
  providers: [NotificationsService, CustomerEmailQuotaService],
  exports: [NotificationsService, CustomerEmailQuotaService],
})
export class NotificationsModule {}
