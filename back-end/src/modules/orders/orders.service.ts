import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-orders.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { VouchersService } from '../vouchers/vouchers.service';
import { MidtransService } from './payment/midtrans.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly vouchersService: VouchersService,
    private readonly midtransService: MidtransService,
  ) {}

  async createOrder(userId: string, dto: CreateOrderDto) {
    // get cart from user with all item and product
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    //validate stock for each item in cart
    for (const item of cart.items) {
      if (item.quantity > item.product.stock) {
        throw new BadRequestException(
          `Not enough stock for product ${item.product.name}`,
        );
      }
    }

    //calculate total price
    const total = cart.items.reduce((acc, item) => {
      return acc + Number(item.product.price) * item.quantity;
    }, 0);

    //validate voucher and calculate discount (if have voucher)
    const voucher = dto.voucherId
      ? await this.prisma.voucher.findUnique({
          where: { id: dto.voucherId },
        })
      : null;

    if (dto.voucherId && !voucher) {
      throw new NotFoundException('Voucher tidak ditemukan');
    }

    if (voucher) {
      await this.vouchersService.validateVoucher(voucher.code, total);
    }

    //calculate discount
    const discountTotal = voucher
      ? this.vouchersService.calculateDiscount(voucher, total)
      : 0;

    //calculate grand total
    const grandTotal = total - discountTotal;

    const order = await this.prisma.$transaction(async (tx) => {
      for (const item of cart.items) {
        //update stock
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
      //create order
      const newOrder = await tx.order.create({
        data: {
          userId,
          voucherId: dto.voucherId,
          recipientName: dto.recipientName,
          recipientPhone: dto.recipientPhone,
          shippingAddress: dto.shippingAddress,
          total,
          discountTotal,
          grandTotal,
          status: 'PENDING',
        },
      });

      //create order items
      await tx.orderItem.createMany({
        data: cart.items.map((item) => ({
          orderId: newOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        })),
      });

      //payment record
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          provider: 'midtrans',
          amount: grandTotal,
          status: 'PENDING',
        },
      });

      //decrement voucher stock if voucher is used
      if (voucher) {
        await tx.voucher.update({
          where: { id: voucher.id },
          data: { quota: { decrement: 1 } },
        });
      }

      //clear cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    const midtransItems = cart.items.map((item) => ({
      id: item.productId,
      name: item.product.name,
      price: Number(item.product.price),
      quantity: item.quantity,
    }));

    // Kalau ada diskon, tambahkan sebagai item terpisah dengan harga negatif
    // supaya total item_details tetap sama persis dengan grandTotal
    if (discountTotal > 0) {
      midtransItems.push({
        id: 'DISCOUNT',
        name: voucher ? `Diskon Voucher (${voucher.code})` : 'Diskon',
        price: -discountTotal,
        quantity: 1,
      });
    }

    const midtransTransaction = await this.midtransService.createTransaction({
      orderId: order.id,
      amount: grandTotal,
      customerName: user?.name || 'Customer',
      customerEmail: user?.email || '',
      items: midtransItems,
    });

    await this.prisma.payment.update({
      where: { orderId: order.id },
      data: {
        paymentUrl: midtransTransaction.redirect_url,
        externalId: midtransTransaction.token,
      },
    });

    //return all order with items and product
    return this.prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payment: true,
        voucher: true,
      },
    });
  }

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: { include: { product: true } },
        payment: true,
        user: { select: { id: true, email: true, name: true } },
      },
    });
  }

  //find user order by userId and orderId
  async findUserOrder(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payment: true,
        voucher: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  //private for admin to find all order with items and product
  async findAllOrders() {
    return this.prisma.order.findMany({
      include: {
        user: { select: { id: true, email: true, name: true } },
        items: {
          include: {
            product: true,
          },
        },
        payment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async handleMidtransWebhook(body: any) {
    const { order_id, transaction_status, fraud_status } = body;
    console.log('Webhook body dari Midtrans:', JSON.stringify(body, null, 2));

    // Tentukan status payment berdasarkan notifikasi Midtrans
    let paymentStatus: string;
    let orderStatus: string;

    if (
      transaction_status === 'capture' ||
      transaction_status === 'settlement'
    ) {
      if (fraud_status === 'accept' || !fraud_status) {
        paymentStatus = 'SUCCESS';
        orderStatus = 'PAID';
      } else {
        paymentStatus = 'FAILED';
        orderStatus = 'CANCELLED';
      }
    } else if (
      transaction_status === 'deny' ||
      transaction_status === 'cancel' ||
      transaction_status === 'expire'
    ) {
      paymentStatus = 'FAILED';
      orderStatus = 'CANCELLED';
    } else {
      paymentStatus = 'PENDING';
      orderStatus = 'PENDING';
    }

    // Update status Payment
    await this.prisma.payment.update({
      where: { orderId: order_id },
      data: {
        status: paymentStatus as any,
        paidAt: paymentStatus === 'SUCCESS' ? new Date() : null,
        rawPayload: body,
      },
    });

    // Update status Order
    await this.prisma.order.update({
      where: { id: order_id },
      data: { status: orderStatus as any },
    });

    return { status: 'ok' };
  }
}
