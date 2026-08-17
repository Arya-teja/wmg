import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            refreshToken: {
              updateMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined and expose required admin user-management methods', () => {
    expect(service).toBeDefined();
    expect(service.findAll).toBeInstanceOf(Function);
    expect(service.findOne).toBeInstanceOf(Function);
    expect(service.updateUserRole).toBeInstanceOf(Function);
    expect(service.deactivateUser).toBeInstanceOf(Function);
    expect(service.activateUser).toBeInstanceOf(Function);
  });
});
