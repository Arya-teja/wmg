import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            updateUserRole: jest.fn(),
            deactivateUser: jest.fn(),
            activateUser: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined and expose admin user endpoints', () => {
    expect(controller).toBeDefined();
    expect(controller.findAll).toBeInstanceOf(Function);
    expect(controller.findOne).toBeInstanceOf(Function);
    expect(controller.updateUserRole).toBeInstanceOf(Function);
    expect(controller.deactivateUser).toBeInstanceOf(Function);
    expect(controller.activateUser).toBeInstanceOf(Function);
  });
});
