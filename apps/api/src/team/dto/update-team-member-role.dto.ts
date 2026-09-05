import { IsIn, IsString } from 'class-validator';

import {
  TEAM_INVITABLE_ROLES,
  type TeamInvitableRole,
} from './create-team-invitation.dto';

export class UpdateTeamMemberRoleDto {
  @IsString()
  @IsIn(TEAM_INVITABLE_ROLES)
  role!: TeamInvitableRole;
}
