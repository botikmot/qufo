import { Module } from '@nestjs/common';

import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';
import { WorkspaceStorageService } from './workspace-storage.service';
import { OrphanedUploadsCleanupService } from './orphaned-uploads-cleanup.service';

@Module({
  controllers: [UploadsController],
  providers: [
    UploadsService,
    WorkspaceStorageService,
    OrphanedUploadsCleanupService,
  ],

  exports: [
    UploadsService,
    WorkspaceStorageService,
    OrphanedUploadsCleanupService,
  ],
})
export class UploadsModule {}
