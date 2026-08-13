import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class PaymentQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsIn(['CASH', 'GCASH', 'MAYA', 'BANK_TRANSFER', 'CARD', 'CHECK', 'OTHER'])
  method?:
    'CASH' | 'GCASH' | 'MAYA' | 'BANK_TRANSFER' | 'CARD' | 'CHECK' | 'OTHER';

  @IsOptional()
  @IsIn(['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'VOIDED'])
  status?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'VOIDED';

  @IsOptional()
  @IsString()
  jobId?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}
