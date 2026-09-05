import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RedeemAppSumoCodeDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  code!: string;
}
