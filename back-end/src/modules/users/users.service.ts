import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly userSelect = {
    id: true,
    email: true,
    name: true,
    role: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
    _count: {
      select: {
        orders: true,
      },
    },
  } as const;

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: this.userSelect,
    });
  }

  async findOne(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: this.userSelect,
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw error;
    }
  }

  async updateUserRole(currentUserId: string, userId: string, role: Role) {
    if (currentUserId === userId && role !== Role.ADMIN) {
      throw new BadRequestException('Tidak bisa mengubah role akun sendiri');
    }

    await this.findOne(userId);

    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: this.userSelect,
    });
  }

  async deactivateUser(currentUserId: string, userId: string) {
    if (currentUserId === userId) {
      throw new BadRequestException('Tidak bisa menonaktifkan akun sendiri');
    }

    await this.findOne(userId);

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
      select: this.userSelect,
    });

    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true },
    });

    return user;
  }

  async activateUser(userId: string) {
    await this.findOne(userId);

    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
      select: this.userSelect,
    });
  }
}
