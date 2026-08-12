import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { VouchersModule } from '../vouchers/vouchers.module';
import { MidtransService } from './payment/midtrans.service';
import { OrdersExpiryService } from './order-expiry.service';

@Module({
  imports: [VouchersModule],
  controllers: [OrdersController],
  providers: [OrdersService, MidtransService, OrdersExpiryService],
})
export class OrdersModule {}
