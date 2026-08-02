import { IsUUID, IsInt, Min, IsString, IsOptional } from 'class-validator';

export class AddToCartDto {
  @IsUUID()
  productId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsString()
  @IsOptional()
  size!: string;

  @IsString()
  @IsOptional()
  color!: string;
}
