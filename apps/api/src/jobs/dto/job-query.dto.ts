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

export class JobQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsIn([
    'PENDING',
    'QUEUED',
    'IN_PROGRESS',
    'FOR_REVIEW',
    'READY',
    'DELIVERED',
    'COMPLETED',
    'CANCELLED',
  ])
  status?:
    | 'PENDING'
    | 'QUEUED'
    | 'IN_PROGRESS'
    | 'FOR_REVIEW'
    | 'READY'
    | 'DELIVERED'
    | 'COMPLETED'
    | 'CANCELLED';

  @IsOptional()
  @IsIn(['LOW', 'NORMAL', 'HIGH', 'URGENT'])
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

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
