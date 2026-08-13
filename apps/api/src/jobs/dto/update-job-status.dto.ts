import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateJobStatusDto {
  @IsIn([
    'QUEUED',
    'IN_PROGRESS',
    'FOR_REVIEW',
    'READY',
    'DELIVERED',
    'COMPLETED',
    'CANCELLED',
  ])
  status:
    | 'QUEUED'
    | 'IN_PROGRESS'
    | 'FOR_REVIEW'
    | 'READY'
    | 'DELIVERED'
    | 'COMPLETED'
    | 'CANCELLED';

  // Internal staff note
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;

  // Customer-safe tracking message
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  publicMessage?: string;
}
