import { Injectable } from '@nestjs/common';
import * as Midtrans from 'midtrans-client';

@Injectable()
export class MidtransService {
  private snap: Midtrans.Snap;

  constructor() {
    this.snap = new Midtrans.Snap({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
      serverKey: process.env.MIDTRANS_SERVER_KEY!,
      clientKey: process.env.MIDTRANS_CLIENT_KEY!,
    });
  }

  async createTransaction(params: {
    orderId: string;
    amount: number;
    customerName: string;
    customerEmail: string;
    items: { id: string; name: string; price: number; quantity: number }[];
  }) {
    const transaction = await this.snap.createTransaction({
      transaction_details: {
        order_id: params.orderId,
        gross_amount: params.amount,
      },
      customer_details: {
        first_name: params.customerName,
        email: params.customerEmail,
      },
      item_details: params.items,
      callbacks: {
        finish: `${process.env.FRONTEND_URL}/orders/${params.orderId}`,
      },
    } as any);

    return transaction;
  }

  async getTransactionStatus(orderId: string) {
    return (this.snap as any).transaction.status(orderId);
  }
}
