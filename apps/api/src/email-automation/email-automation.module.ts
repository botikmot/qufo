import { Module } from '@nestjs/common';

import { EmailModule } from '../email/email.module';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailAutomationService } from './email-automation.service';

@Module({
  imports: [PrismaModule, EmailModule],
  providers: [EmailAutomationService],
  exports: [EmailAutomationService],
})
export class EmailAutomationModule {}
