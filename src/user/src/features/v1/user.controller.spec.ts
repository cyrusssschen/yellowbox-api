import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from '../../dto/user.dto';
import { LoginRequestDto } from '../../dto/login.dto';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            createUser: jest.fn(),
            findUserById: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  describe('createUser', () => {
    it('should call userService.createUser with correct parameters', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'testpassword',
      };
      const expectedResult = { id: '123', email: 'test@example.com' };

      jest.spyOn(userService, 'createUser').mockResolvedValue(expectedResult);

      const result = await userController.createUser(createUserDto);

      expect(userService.createUser).toHaveBeenCalledWith(
        createUserDto.email.toLowerCase(),
        createUserDto.password,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getUserById', () => {
    it('should call userService.findUserById with correct userId', async () => {
      const userId = '123';
      const expectedResult = { id: '123', email: 'test@example.com' };

      jest.spyOn(userService, 'findUserById').mockResolvedValue(expectedResult);

      const result = await userController.getUserById(userId);

      expect(userService.findUserById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedResult);
    });

    it('should return null if userService.findUserById returns null', async () => {
      const userId = '123';

      jest.spyOn(userService, 'findUserById').mockResolvedValue(null);

      const result = await userController.getUserById(userId);

      expect(userService.findUserById).toHaveBeenCalledWith(userId);
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should call userService.login with correct parameters', async () => {
      const loginRequestDto: LoginRequestDto = {
        email: 'test@example.com',
        password: 'testpassword',
      };
      const expectedResult = { accessToken: 'jwt_token' };

      jest.spyOn(userService, 'login').mockResolvedValue(expectedResult as any);

      const result = await userController.login(loginRequestDto);

      expect(userService.login).toHaveBeenCalledWith(
        loginRequestDto.email,
        loginRequestDto.password,
      );
      expect(result).toEqual(expectedResult);
    });
  });
});
