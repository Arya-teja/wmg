import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  UseGuards,
  Body,
} from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt.guards';

@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  //Upload voucher
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateVoucherDto) {
    return this.vouchersService.create(dto);
  }

  //Get all vouchers
  @Get()
  findAll() {
    return this.vouchersService.findAll();
  }

  //Get voucher by id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vouchersService.findOne(id);
  }

  //Update voucher by id
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateVoucherDto) {
    return this.vouchersService.update(id, dto);
  }

    //Delete voucher by id
    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    remove(@Param('id') id: string) {
      return this.vouchersService.remove(id);
    }
}
