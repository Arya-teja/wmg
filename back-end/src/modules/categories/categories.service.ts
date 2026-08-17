import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    //ubah nama kategori menjadi slug
    const slug = this.generateSlug(createCategoryDto.name);

    const existingSlug = await this.prisma.category.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      throw new ConflictException('Category with this name already exists');
    }

    return this.prisma.category.create({
      data: { ...createCategoryDto, slug },
    });
  }

  async findAll() {
    return this.prisma.category.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOne(id);

    const incomingPublicId = updateCategoryDto.publicId;
    const shouldDeleteOldImage =
      incomingPublicId !== undefined &&
      !!category.publicId &&
      category.publicId !== incomingPublicId;

    const updatedCategory = await this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });

    if (shouldDeleteOldImage) {
      await this.uploadService.deleteImage(category.publicId!);
    }

    return updatedCategory;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.category.delete({ where: { id } });
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
