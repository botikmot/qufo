import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  jobId: string;

  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0.01)
  amount: number;

  @IsIn(['CASH', 'GCASH', 'MAYA', 'BANK_TRANSFER', 'CARD', 'CHECK', 'OTHER'])
  method:
    'CASH' | 'GCASH' | 'MAYA' | 'BANK_TRANSFER' | 'CARD' | 'CHECK' | 'OTHER';

  @IsOptional()
  @IsString()
  @MaxLength(150)
  referenceNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @IsOptional()
  @IsDateString()
  paidAt?: string;
}
