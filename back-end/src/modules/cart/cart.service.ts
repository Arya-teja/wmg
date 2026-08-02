import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // If the cart does not exist, create a new one
    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }
    return cart;
  }

  async addToCart(userId: string, dto: AddToCartDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      include: {
        colors: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.stock < dto.quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    // Validasi: kalau produk punya varian sizes, size WAJIB dipilih
    if (product.sizes.length > 0 && !dto.size) {
      throw new BadRequestException('Please select a size');
    }

    // Validasi: kalau produk punya varian colors, color WAJIB dipilih
    if (product.colors.length > 0 && !dto.color) {
      throw new BadRequestException('Please select a color');
    }

    const cart = await this.getOrCreateCart(userId);

    const existingCartItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId_size_color: {
          cartId: cart.id,
          productId: dto.productId,
          size: dto.size,
          color: dto.color,
        },
      },
    });

    //kalau cart item sudah ada, maka update quantity
    if (existingCartItem) {
      return this.prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + dto.quantity,
        },
      });
    }

    //kalau cart item belum ada, maka buat baru
    return this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: dto.productId,
        quantity: dto.quantity,
        size: dto.size,
        color: dto.color,
      },
    });
  }

  async updateCartItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const cartItem = await this.findCartItemOwnedByUser(userId, itemId);

    if (cartItem.product.stock < dto.quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: {
        quantity: dto.quantity,
      },
      include: {
        product: true,
      },
    });
  }

  async removeCartItem(userId: string, itemId: string) {
    await this.findCartItemOwnedByUser(userId, itemId);

    return this.prisma.cartItem.delete({
      where: { id: itemId },
    });
  }
  //  buat function untuk ngecek apakah cart ada atau tidak, kalau tidak ada maka buat baru
  private async getOrCreateCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({ where: { userId } });

    if (!cart) {
      cart = await this.prisma.cart.create({ data: { userId } });
    }

    return cart;
  }

  //buat function untuk ngecek apakah cart item ada atau tidak, kalau tidak ada maka throw error
  private async findCartItemOwnedByUser(userId: string, itemId: string) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: {
        id: itemId,
      },
      include: {
        product: true,
        cart: true,
      },
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      throw new NotFoundException('Cart item not found');
    }

    return cartItem;
  }
}
