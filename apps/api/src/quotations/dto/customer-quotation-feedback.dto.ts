import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CustomerQuotationFeedbackDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  note: string;
}
