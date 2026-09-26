import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';

import { DealifyController } from './dealify.controller';
import { DealifyService } from './dealify.service';

@Module({
  imports: [PrismaModule],
  controllers: [DealifyController],
  providers: [DealifyService],
  exports: [DealifyService],
})
export class DealifyModule {}
