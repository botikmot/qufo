import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateQuotationSignatureSettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  quotationSignatoryName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  quotationSignatoryTitle?: string;

  @IsOptional()
  @IsBoolean()
  showQuotationSignature?: boolean;
}
