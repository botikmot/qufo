import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

import { CreateQuotationItemDto } from './create-quotation-item.dto';

export class CreateQuotationDto {
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @IsOptional()
  @IsIn(['NONE', 'FIXED', 'PERCENTAGE'])
  discountType?: 'NONE' | 'FIXED' | 'PERCENTAGE';

  @IsOptional()
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  discountValue?: number;

  @IsOptional()
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  @Max(100)
  taxRate?: number;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  terms?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({
    each: true,
  })
  @Type(() => CreateQuotationItemDto)
  items: CreateQuotationItemDto[];
}
