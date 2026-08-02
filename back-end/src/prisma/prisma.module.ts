import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() //agar bisa di pakai di module lain tanpa harus import lagi
@Module({
  providers: [PrismaService],
  exports: [PrismaService] 
})
export class PrismaModule {}
