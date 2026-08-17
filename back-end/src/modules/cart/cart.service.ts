import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

const PRODUCT_INCLUDE = {
  images: { orderBy: { order: 'asc' as const } },
  colors: true,
  sizeStocks: true,
};

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: { include: PRODUCT_INCLUDE },
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: { include: PRODUCT_INCLUDE },
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
        sizeStocks: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.sizeStocks.length > 0 && !dto.size) {
      throw new BadRequestException('Please select a size');
    }

    if (product.colors.length > 0 && !dto.color) {
      throw new BadRequestException('Please select a color');
    }

    if (dto.size) {
      const sizeStock = product.sizeStocks.find((s) => s.size === dto.size);
      if (!sizeStock || sizeStock.stock < dto.quantity) {
        throw new BadRequestException('Insufficient stock for this size');
      }
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

    if (existingCartItem) {
      return this.prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + dto.quantity,
        },
        include: {
          product: { include: PRODUCT_INCLUDE },
        },
      });
    }

    return this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: dto.productId,
        quantity: dto.quantity,
        size: dto.size,
        color: dto.color,
      },
      include: {
        product: { include: PRODUCT_INCLUDE },
      },
    });
  }

  async updateCartItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const cartItem = await this.findCartItemOwnedByUser(userId, itemId);

    if (cartItem.size) {
      const sizeStock = await this.prisma.productSizeStock.findUnique({
        where: {
          productId_size: {
            productId: cartItem.productId,
            size: cartItem.size,
          },
        },
      });

      if (!sizeStock || sizeStock.stock < dto.quantity) {
        throw new BadRequestException('Insufficient stock for this size');
      }
    }

    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: {
        quantity: dto.quantity,
      },
      include: {
        product: { include: PRODUCT_INCLUDE },
      },
    });
  }

  async removeCartItem(userId: string, itemId: string) {
    await this.findCartItemOwnedByUser(userId, itemId);

    return this.prisma.cartItem.delete({
      where: { id: itemId },
    });
  }

  private async getOrCreateCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({ where: { userId } });

    if (!cart) {
      cart = await this.prisma.cart.create({ data: { userId } });
    }

    return cart;
  }

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
