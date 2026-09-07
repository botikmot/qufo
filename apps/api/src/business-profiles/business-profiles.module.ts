import { Module } from '@nestjs/common';

import { BusinessProfilesController } from './business-profiles.controller';
import { BusinessProfilesService } from './business-profiles.service';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [UploadsModule],
  controllers: [BusinessProfilesController],

  providers: [BusinessProfilesService],

  exports: [BusinessProfilesService],
})
export class BusinessProfilesModule {}
