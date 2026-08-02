import { DiscountType } from '@prisma/client/wasm';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsEnum,
  Min,
  IsInt,
} from 'class-validator';

export class CreateVoucherDto {
  @IsString()
  code!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(DiscountType) 
  discountType!: DiscountType;

  @IsNumber()
  @Min(0)
  discountValue!: number;

  @IsNumber()
  @Min(0)
  minPurchaseAmount!: number;

  @IsNumber()
  @Min(0)
  maxDiscountAmount!: number;

  @IsInt()
  @Min(1)
  quota!: number;

  @IsDateString()
  expiresAt!: string;
}
