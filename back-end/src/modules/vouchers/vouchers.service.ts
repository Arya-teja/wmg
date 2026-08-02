import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';


@Injectable()
export class VouchersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateVoucherDto) {
    const existingVoucher = await this.prisma.voucher.findUnique({
      where: { code: dto.code },
    });

    if (existingVoucher) {
      throw new ConflictException('Voucher with this code already used');
    }

    return this.prisma.voucher.create({
      data: {
        ...dto,
        expiresAt: new Date(dto.expiresAt),
      },
    });
  }

  async findAll() {
    return this.prisma.voucher.findMany();
  }

  async findOne(id: string) {
    const voucher = await this.prisma.voucher.findUnique({
      where: { id },
    });

    if (!voucher) {
      throw new NotFoundException('Voucher not found');
    }
    return voucher;
  }

  async update(id: string, dto: UpdateVoucherDto) {
    await this.findOne(id); // Check if voucher exists

    const data: any = { ...dto };
    if (dto.expiresAt) {
      data.expiresAt = new Date(dto.expiresAt);
    }

    return this.prisma.voucher.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if voucher exists

    return this.prisma.voucher.delete({
      where: { id },
    });
  }

  //Dipakai saat checkout di orders
  async validateVoucher(code: string, purchaseAmount: number) {
    const voucher = await this.prisma.voucher.findUnique({
      where: { code },
    });

    if (!voucher) {
      throw new NotFoundException('Voucher not found');
    }

    if (voucher.expiresAt < new Date()) {
      throw new BadRequestException('Voucher has expired');
    }

    if (voucher.quota <= 0) {
      throw new BadRequestException('Voucher quota has been used up');
    }

    if (purchaseAmount < Number(voucher.minPurchaseAmount)) {
      throw new BadRequestException(
        `Minimum Buy Rp${voucher.minPurchaseAmount} for this voucher`,
      );
    }

    return voucher;
  }

  //Hitung berapa potongan harga yang didapatkan dari voucher
  calculateDiscount(voucher: any, purchaseAmount: number) {
    let discount = 0;

    if (voucher.discountType === 'PERCENTAGE') {
      discount = (purchaseAmount * Number(voucher.discountValue)) / 100;
    } else {
      discount = Number(voucher.discountValue);
    }

    const maxDiscount = Number(voucher.maxDiscountAmount);
    if (discount > maxDiscount) {
      discount = maxDiscount;
    }
    return discount;
  }
}
