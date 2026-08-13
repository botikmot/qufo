import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RespondQuotationDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;
}
