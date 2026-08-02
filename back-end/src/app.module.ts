import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './modules/products/products.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CartModule } from './modules/cart/cart.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { VouchersModule } from './modules/vouchers/vouchers.module';
import { OrdersModule } from './modules/orders/orders.module';

@Module({
  imports: [ProductsModule, AuthModule, UsersModule, PrismaModule, CategoriesModule, CartModule, ReviewsModule, VouchersModule, OrdersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
