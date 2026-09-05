import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../auth/decorators/current-user.decorator';

import { AuthGuard } from '../auth/guards/auth.guard';

import type { JwtPayload } from '../auth/types/jwt-payload.type';

import { TeamInvitationTokenDto } from './dto/team-invitation-token.dto';

import { TeamService } from './team.service';

@Controller('team-invitations')
export class TeamInvitationsController {
  constructor(private readonly teamService: TeamService) {}

  /*
   * Public endpoint used by the join page before
   * the invitee signs in or creates an account.
   */
  @Post('resolve')
  resolve(
    @Body()
    dto: TeamInvitationTokenDto,
  ) {
    return this.teamService.resolveInvitation(dto);
  }

  /*
   * AuthGuard only: a valid invitee may not have
   * an organization membership or tenant context yet.
   */
  @UseGuards(AuthGuard)
  @Post('accept')
  accept(
    @CurrentUser()
    user: JwtPayload,

    @Body()
    dto: TeamInvitationTokenDto,
  ) {
    return this.teamService.acceptInvitation(user, dto);
  }
}
