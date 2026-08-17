import { IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
    @IsString()
    name!: string;

    @IsString()
    @IsOptional()
    imageUrl?: string;

    @IsString()
    @IsOptional()
    publicId?: string;
}
