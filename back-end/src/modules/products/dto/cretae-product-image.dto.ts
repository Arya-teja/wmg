import { IsString, IsInt, IsOptional, Min } from 'class-validator';

export class CreateProductImageDto {
  @IsString()
  url!: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}
