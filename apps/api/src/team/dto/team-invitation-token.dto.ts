import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class TeamInvitationTokenDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(32)
  @MaxLength(200)
  token!: string;
}
