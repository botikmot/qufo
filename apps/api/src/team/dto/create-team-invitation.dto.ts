import { IsEmail, IsIn, IsString, MaxLength } from 'class-validator';

export const TEAM_INVITABLE_ROLES = ['ADMIN', 'MANAGER', 'STAFF'] as const;

export type TeamInvitableRole = (typeof TEAM_INVITABLE_ROLES)[number];

export class CreateTeamInvitationDto {
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @IsString()
  @IsIn(TEAM_INVITABLE_ROLES)
  role!: TeamInvitableRole;
}
