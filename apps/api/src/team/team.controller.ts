import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';

import { CurrentUser } from '../auth/decorators/current-user.decorator';

import { Roles } from '../auth/decorators/roles.decorator';

import { AuthGuard } from '../auth/guards/auth.guard';

import { RolesGuard } from '../auth/guards/roles.guard';

import { SubscriptionGuard } from '../auth/guards/subscription.guard';

import { TenantGuard } from '../auth/guards/tenant.guard';

import type { JwtPayload } from '../auth/types/jwt-payload.type';

import type { TenantContext } from '../auth/types/tenant-context.type';

import { CreateTeamInvitationDto } from './dto/create-team-invitation.dto';

import { UpdateTeamMemberRoleDto } from './dto/update-team-member-role.dto';

import { TeamService } from './team.service';

@Controller('team')
@UseGuards(AuthGuard, TenantGuard, SubscriptionGuard, RolesGuard)
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Roles('OWNER', 'ADMIN')
  @Get()
  getTeam(
    @CurrentUser()
    user: JwtPayload,

    @CurrentTenant()
    tenant: TenantContext,
  ) {
    return this.teamService.getTeam(user, tenant);
  }

  @Roles('OWNER', 'ADMIN')
  @Post('invitations')
  createInvitation(
    @CurrentUser()
    user: JwtPayload,

    @CurrentTenant()
    tenant: TenantContext,

    @Body()
    dto: CreateTeamInvitationDto,
  ) {
    return this.teamService.createInvitation(user, tenant, dto);
  }

  @Roles('OWNER', 'ADMIN')
  @Post('invitations/:id/resend')
  resendInvitation(
    @CurrentUser()
    user: JwtPayload,

    @CurrentTenant()
    tenant: TenantContext,

    @Param('id')
    invitationId: string,
  ) {
    return this.teamService.resendInvitation(user, tenant, invitationId);
  }

  @Roles('OWNER', 'ADMIN')
  @Delete('invitations/:id')
  cancelInvitation(
    @CurrentTenant()
    tenant: TenantContext,

    @Param('id')
    invitationId: string,
  ) {
    return this.teamService.cancelInvitation(tenant, invitationId);
  }

  @Roles('OWNER', 'ADMIN')
  @Patch('members/:id/role')
  updateMemberRole(
    @CurrentUser()
    user: JwtPayload,

    @CurrentTenant()
    tenant: TenantContext,

    @Param('id')
    membershipId: string,

    @Body()
    dto: UpdateTeamMemberRoleDto,
  ) {
    return this.teamService.updateMemberRole(user, tenant, membershipId, dto);
  }

  @Roles('OWNER', 'ADMIN')
  @Post('members/:id/deactivate')
  deactivateMember(
    @CurrentUser()
    user: JwtPayload,

    @CurrentTenant()
    tenant: TenantContext,

    @Param('id')
    membershipId: string,
  ) {
    return this.teamService.deactivateMember(user, tenant, membershipId);
  }

  @Roles('OWNER', 'ADMIN')
  @Post('members/:id/reactivate')
  reactivateMember(
    @CurrentUser()
    user: JwtPayload,

    @CurrentTenant()
    tenant: TenantContext,

    @Param('id')
    membershipId: string,
  ) {
    return this.teamService.reactivateMember(user, tenant, membershipId);
  }
}
