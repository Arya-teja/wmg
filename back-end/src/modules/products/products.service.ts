import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const slug = this.generateSlug(createProductDto.name);
    const existingSlug = await this.prisma.product.findUnique({
      where: { slug },
    });
    if (existingSlug) {
      throw new ConflictException('Product with this name already exists');
    }

    const { images, colors, sizeStocks, ...productData } = createProductDto;

    return this.prisma.product.create({
      data: {
        ...productData,
        slug,
        images: images
          ? {
              create: images.map((img, index) => ({
                url: img.url,
                publicId: img.publicId,
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
        sizeStocks: {
          create: sizeStocks.map((s) => ({
            size: s.size,
            stock: s.stock,
          })),
        },
      },
      include: {
        images: true,
        colors: true,
        category: true,
        sizeStocks: true,
      },
    });
  }

  findAll() {
    return this.prisma.product.findMany({
      include: {
        category: true,
        sizeStocks: true,
        images: true,
        colors: true,
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
        sizeStocks: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    await this.findOne(id);

    const { images, colors, sizeStocks, ...productData } = updateProductDto;

    // Hitung publicId yang benar-benar akan dihapus dari Cloudinary:
    // yaitu publicId lama yang TIDAK ADA lagi di payload baru dari frontend
    let publicIdsToDelete: string[] = [];
    if (images !== undefined) {
      const oldImages = await this.prisma.productImage.findMany({
        where: { productId: id },
        select: { publicId: true },
      });
      const oldPublicIds = oldImages
        .map((img) => img.publicId)
        .filter((pid): pid is string => !!pid);

      const incomingPublicIds = new Set(
        images
          .map((img) => img.publicId)
          .filter((pid): pid is string => !!pid),
      );

      publicIdsToDelete = oldPublicIds.filter(
        (pid) => !incomingPublicIds.has(pid),
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Update field scalar produk (name, description, price, imageUrl, categoryId)
      await tx.product.update({
        where: { id },
        data: productData,
      });

      // 2. Images — full replace (aman karena cuma simpan URL Cloudinary, bukan file)
      if (images !== undefined) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        if (images.length > 0) {
          await tx.productImage.createMany({
            data: images.map((img, index) => ({
              productId: id,
              url: img.url,
              publicId: img.publicId,
              order: img.order ?? index,
            })),
          });
        }
      }

      // 3. Colors — full replace
      if (colors !== undefined) {
        await tx.productColor.deleteMany({ where: { productId: id } });
        if (colors.length > 0) {
          await tx.productColor.createMany({
            data: colors.map((c) => ({
              productId: id,
              name: c.name,
              hex: c.hex,
            })),
          });
        }
      }

      // 4. SizeStocks — upsert per size + hapus size yang tidak ada lagi di payload
      if (sizeStocks !== undefined) {
        const incomingSizes = sizeStocks.map((s) => s.size);

        await tx.productSizeStock.deleteMany({
          where: {
            productId: id,
            size: { notIn: incomingSizes },
          },
        });

        for (const s of sizeStocks) {
          await tx.productSizeStock.upsert({
            where: {
              productId_size: { productId: id, size: s.size },
            },
            update: { stock: s.stock },
            create: { productId: id, size: s.size, stock: s.stock },
          });
        }
      }

      return tx.product.findUnique({
        where: { id },
        include: {
          images: { orderBy: { order: 'asc' } },
          colors: true,
          category: true,
          sizeStocks: true,
        },
      });
    });

    // 5. Hapus di Cloudinary SETELAH transaction DB commit,
    //    dan CUMA yang benar-benar sudah tidak dipakai lagi.
    if (publicIdsToDelete.length > 0) {
      await Promise.allSettled(
        publicIdsToDelete.map((pid) => this.uploadService.deleteImage(pid)),
      );
    }

    return result;
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        reviews: true,
        sizeStocks: true,
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