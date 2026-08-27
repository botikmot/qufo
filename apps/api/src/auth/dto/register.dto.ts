import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsBoolean,
  IsIn,
  Length,
} from 'class-validator';

const SUPPORTED_COUNTRY_CODES = [
  'PH',
  'US',
  'AU',
  'GB',
  'CA',
  'SG',
  'JP',
  'NZ',
] as const;

const SUPPORTED_CURRENCIES = [
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

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  businessName: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  businessType?: string;

  @IsString()
  @Length(2, 2)
  @IsIn(SUPPORTED_COUNTRY_CODES)
  countryCode: string;

  @IsString()
  @Length(3, 3)
  @IsIn(SUPPORTED_CURRENCIES)
  currency: string;

  @IsBoolean()
  acceptedTerms: boolean;
}
