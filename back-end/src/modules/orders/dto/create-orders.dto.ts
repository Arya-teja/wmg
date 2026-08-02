import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateOrderDto {
  @IsUUID()
  @IsOptional()
  voucherId?: string;

  @IsString()
  recipientName!: string;

  @IsString()
  recipientPhone!: string;

  @IsString()
  shippingAddress!: string;
}
