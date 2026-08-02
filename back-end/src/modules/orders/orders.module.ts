import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { VouchersModule } from '../vouchers/vouchers.module';
import { MidtransService } from './payment/midtrans.service';

@Module({
  imports: [VouchersModule],
  controllers: [OrdersController],
  providers: [OrdersService, MidtransService],
})
export class OrdersModule {}
