import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RedeemDealifyCodeDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  code!: string;
}
