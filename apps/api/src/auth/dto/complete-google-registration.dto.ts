import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export class CompleteGoogleRegistrationDto {
  @IsString()
  @IsNotEmpty()
  credential: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  businessName: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  businessType?: string;

  @IsString()
  @Length(2, 2)
  countryCode: string;

  @IsString()
  @Length(3, 3)
  currency: string;

  @IsBoolean()
  acceptedTerms: boolean;
}
