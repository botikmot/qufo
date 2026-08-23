import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';

export enum SupportMessageType {
  GENERAL = 'GENERAL',
  BUG = 'BUG',
  FEATURE = 'FEATURE',
}

export class SendSupportMessageDto {
  @IsEnum(SupportMessageType)
  type: SupportMessageType;

  @IsString()
  @MinLength(3)
  @MaxLength(150)
  subject: string;

  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  message: string;
}
