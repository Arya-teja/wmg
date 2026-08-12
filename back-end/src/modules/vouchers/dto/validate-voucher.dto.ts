import { IsString, IsNumber, Min } from 'class-validator';

export class ValidateVoucherDto {
  @IsString()
  code!: string;

  @IsNumber()
  @Min(0)
  purchaseAmount!: number;
}
