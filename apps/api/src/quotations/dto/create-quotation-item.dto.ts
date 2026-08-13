import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

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
}
