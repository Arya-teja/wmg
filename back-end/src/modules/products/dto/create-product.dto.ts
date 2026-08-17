import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  IsUUID,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductLabel } from '@prisma/client';
import { CreateProductImageDto } from './cretae-product-image.dto';
import { CreateProductColorDto } from './create-product-color.dto';
import { CreateProductSizeStockDto } from './create-product-size-stock.dto';

export class CreateProductDto {
  @IsString()
  name!: string;

  @IsString()
  description!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsEnum(ProductLabel)
  @IsOptional()
  label?: ProductLabel;

  @IsUUID()
  categoryId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductSizeStockDto)
  sizeStocks!: CreateProductSizeStockDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  @IsOptional()
  images?: CreateProductImageDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductColorDto)
  @IsOptional()
  colors?: CreateProductColorDto[];
}
