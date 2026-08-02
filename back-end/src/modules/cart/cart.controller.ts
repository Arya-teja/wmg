import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guards';

@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Req() req) {
    return this.cartService.getCart(req.user.userId);
  }

  @Post('items')
  addToCart(@Req() req, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(req.user.userId, dto);
  }

  @Patch('items/:itemId')
  updateCartItem(@Req() req, @Param('itemId') paramItemId: string, @Body() dto: UpdateCartItemDto) {
    return this.cartService.updateCartItem(req.user.userId, paramItemId, dto);
  }

  @Delete('items/:itemId')
  removeCartItem(@Req() req, @Param('itemId') paramItemId: string) {
    return this.cartService.removeCartItem(req.user.userId, paramItemId);
  }
}
