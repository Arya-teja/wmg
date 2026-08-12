import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { MidtransService } from './payment/midtrans.service';

@Injectable()
export class OrdersExpiryService {
  private readonly logger = new Logger(OrdersExpiryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly midtransService: MidtransService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async checkPendingOrders() {
    this.logger.log('Mengecek order PENDING yang mungkin sudah expired...');

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const pendingOrders = await this.prisma.order.findMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: oneDayAgo },
      },
      include: { payment: true },
    });

    if (pendingOrders.length === 0) {
      this.logger.log('Tidak ada order PENDING yang perlu dicek.');
      return;
    }

    this.logger.log(
      `Ditemukan ${pendingOrders.length} order PENDING lebih dari 24 jam.`,
    );

    for (const order of pendingOrders) {
      try {
        const midtransStatus = await this.midtransService.getTransactionStatus(
          order.id,
        );
        const transactionStatus = midtransStatus.transaction_status;

        if (
          transactionStatus === 'expire' ||
          transactionStatus === 'cancel' ||
          transactionStatus === 'deny'
        ) {
          await this.prisma.payment.update({
            where: { orderId: order.id },
            data: {
              status: 'EXPIRED',
              rawPayload: midtransStatus,
            },
          });

          await this.prisma.order.update({
            where: { id: order.id },
            data: { status: 'CANCELED' },
          });

          this.logger.log(`Order ${order.id} ditandai EXPIRED/CANCELED.`);
        } else if (
          transactionStatus === 'settlement' ||
          transactionStatus === 'capture'
        ) {
          // Jaga-jaga: kalau ternyata SUDAH dibayar tapi webhook lama tidak sampai
          await this.prisma.payment.update({
            where: { orderId: order.id },
            data: {
              status: 'SUCCESS',
              paidAt: new Date(),
              rawPayload: midtransStatus,
            },
          });

          await this.prisma.order.update({
            where: { id: order.id },
            data: { status: 'PAID' },
          });

          this.logger.log(
            `Order ${order.id} ternyata SUDAH DIBAYAR, status diperbarui.`,
          );
        }
      }  catch (error: any) {
        const isNotFound =
          error?.httpStatusCode === '404' ||
          error?.ApiResponse?.status_code === '404';

        if (isNotFound) {
          // Transaksi tidak/tidak lagi ada di sisi Midtrans (kadaluarsa dari sisi mereka
          // atau memang gagal dibuat) -> perlakukan sebagai expired juga
          await this.prisma.$transaction([
            this.prisma.payment.update({
              where: { orderId: order.id },
              data: { status: 'EXPIRED' },
            }),
            this.prisma.order.update({
              where: { id: order.id },
              data: { status: 'CANCELED' },
            }),
          ]);
          this.logger.log(
            `Order ${order.id} tidak ditemukan di Midtrans (404), diperlakukan sebagai kadaluarsa. Status diupdate jadi CANCELED.`,
          );
        } else {
          this.logger.error(`Gagal mengecek status order ${order.id} ke Midtrans: ${error.message}`);
        }
      }
    }
  }
}
