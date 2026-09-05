import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';

import { TeamModule } from '../team/team.module';

import { AppSumoController } from './appsumo.controller';

import { AppSumoService } from './appsumo.service';

@Module({
  imports: [AuthModule, TeamModule],

  controllers: [AppSumoController],

  providers: [AppSumoService],

  exports: [AppSumoService],
})
export class AppSumoModule {}
