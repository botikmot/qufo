import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';

import { EmailModule } from '../email/email.module';

import { TeamController } from './team.controller';

import { TeamInvitationsController } from './team-invitations.controller';

import { TeamSeatLimitService } from './team-seat-limit.service';

import { TeamService } from './team.service';

@Module({
  imports: [AuthModule, EmailModule],

  controllers: [TeamController, TeamInvitationsController],

  providers: [TeamService, TeamSeatLimitService],

  exports: [TeamService, TeamSeatLimitService],
})
export class TeamModule {}
