import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-orders.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guards';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createOrder(@Req() req: any, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findUserOrders(@Req() req: any) {
    return this.ordersService.findUserOrder(req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/all')
  async findAllOrders() {
    return this.ordersService.findAllOrders();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/status')
  async updateOrderStatus(
    @Param('id') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(orderId, dto.status);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Req() req: any, @Param('id') orderId: string) {
    return this.ordersService.findOne(req.user.userId, orderId);
  }

  // TIDAK pakai @UseGuards - endpoint ini dipanggil oleh Midtrans, bukan user login
  @Post('webhook/midtrans')
  async handleMidtransWebhook(@Body() body: any) {
    return this.ordersService.handleMidtransWebhook(body);
  }
}
