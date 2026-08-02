import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createProductDto: CreateProductDto) {
    const slug = this.generateSlug(createProductDto.name);

    const existingSlug = await this.prisma.product.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      throw new ConflictException('Product with this name already exists');
    }

    const { images, colors, ...productData } = createProductDto;

    return this.prisma.product.create({
      data: {
        ...productData,
        slug,
        images: images
          ? {
              create: images.map((img, index) => ({
                url: img.url,
                order: img.order ?? index,
              })),
            }
          : undefined,
        colors: colors
          ? {
              create: colors.map((c) => ({
                name: c.name,
                hex: c.hex,
              })),
            }
          : undefined,
      },
      include: {
        images: true,
        colors: true,
        category: true,
      },
    });
  }

  findAll() {
    return this.prisma.product.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        reviews: true,
        images: true,
        colors: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    await this.findOne(id);

    const { images, colors, ...productData } = updateProductDto;

    return this.prisma.product.update({
      where: { id },
      data: {
        ...productData,
      },
      include: {
        images: true,
        colors: true,
        category: true,
      },
    });
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        reviews: true,
        images: {
          orderBy: { order: 'asc' },
        },
        colors: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  remove(id: string) {
    return this.prisma.product.delete({
      where: { id },
    });
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
