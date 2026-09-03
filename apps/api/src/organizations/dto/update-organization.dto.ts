import {
  IsEmail,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export const SUPPORTED_CURRENCIES = [
  'PHP',
  'USD',
  'AUD',
  'GBP',
  'EUR',
  'CAD',
  'SGD',
  'JPY',
  'NZD',
] as const;

export class UpdateOrganizationDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  businessType?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsString()
  @Length(2, 2)
  countryCode?: string;

  @IsOptional()
  @IsIn(SUPPORTED_CURRENCIES)
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  quotationTerms?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  quotationFooterNote?: string;

  @IsOptional()
  @IsBoolean()
  customerEmailNotificationsEnabled?: boolean;
}
