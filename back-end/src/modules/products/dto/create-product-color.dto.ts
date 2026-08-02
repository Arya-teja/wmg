import { IsString } from 'class-validator';

export class CreateProductColorDto {
  @IsString()
  name!: string;

  @IsString()
  hex!: string;
}
