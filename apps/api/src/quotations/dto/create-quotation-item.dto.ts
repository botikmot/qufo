import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  IsEnum,
  IsInt,
  ValidateIf,
} from 'class-validator';

import { Type } from 'class-transformer';
import { WarrantyUnit } from '../../generated/prisma/enums';

export class CreateQuotationItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsNumber({
    maxDecimalPlaces: 3,
  })
  @Min(0.001)
  quantity: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  unit: string;

  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  unitPrice: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  imageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  imageKey?: string;

  /*
   * If ANY warranty field is supplied,
   * duration + unit become required.
   */
  @ValidateIf(
    (o: CreateQuotationItemDto) =>
      o.warrantyDuration !== undefined ||
      o.warrantyUnit !== undefined ||
      !!o.warrantyTerms?.trim(),
  )
  @Type(() => Number)
  @IsInt()
  @Min(1)
  warrantyDuration?: number;

  @ValidateIf(
    (o: CreateQuotationItemDto) =>
      o.warrantyDuration !== undefined ||
      o.warrantyUnit !== undefined ||
      !!o.warrantyTerms?.trim(),
  )
  @IsEnum(WarrantyUnit)
  warrantyUnit?: WarrantyUnit;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  warrantyTerms?: string;
}
