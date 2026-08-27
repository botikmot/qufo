import { Module } from '@nestjs/common';

import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { SettingsSecurityController } from './settings-security.controller';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [UploadsModule],
  controllers: [SettingsController, SettingsSecurityController],
  providers: [SettingsService],
})
export class SettingsModule {}
