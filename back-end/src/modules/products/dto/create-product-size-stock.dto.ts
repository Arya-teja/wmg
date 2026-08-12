import { IsString, IsNumber, Min } from 'class-validator';

export class CreateProductSizeStockDto {
  @IsString()
  size!: string;

  @IsNumber()
  @Min(0)
  stock!: number;
}
