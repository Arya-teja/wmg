import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  IsUUID,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateProductImageDto } from './cretae-product-image.dto';
import { CreateProductColorDto } from './create-product-color.dto';

export class CreateProductDto {
  @IsString()
  name!: string;

  @IsString()
  description!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsNumber()
  @Min(0)
  stock!: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsUUID()
  categoryId!: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  sizes?: string[];

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