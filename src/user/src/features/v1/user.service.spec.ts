import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FirebaseService } from 'shared/src/firebase';
import { encryptPassword, isPasswordMatch } from 'shared/src/utils/encryption';
import ApplicationException from 'shared/src/types/exceptions/application.exception';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

jest.mock('shared/src/utils/encryption', () => ({
  encryptPassword: jest.fn(),
  isPasswordMatch: jest.fn(),
}));

describe('UserService', () => {
  let userService: UserService;
  let firebaseService: FirebaseService;
  let jwtService: JwtService;

  const mockFirebaseService = {
    getFirestore: jest.fn().mockReturnValue({
      collection: jest.fn().mockReturnThis(),
      doc: jest.fn().mockReturnThis(),
      set: jest.fn(),
      get: jest.fn(),
      where: jest.fn().mockReturnThis(),
    }),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: FirebaseService, useValue: mockFirebaseService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    firebaseService = module.get<FirebaseService>(FirebaseService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('createUser', () => {
    it('should create a new user and return user details', async () => {
      const email = 'test@example.com';
      const password = 'testpassword';
      const encryptedPassword = 'encrypted_password';

      // Mock findUserByEmail to return undefined (user does not exist)
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(undefined);
      // Mock encryptPassword
      (encryptPassword as jest.Mock).mockResolvedValue(encryptedPassword);
      // Mock Firestore set method
      const setSpy = jest
        .spyOn(mockFirebaseService.getFirestore().collection().doc(), 'set')
        .mockResolvedValue(undefined);

      const result = await userService.createUser(email, password);

      expect(userService.findUserByEmail).toHaveBeenCalledWith(email);
      expect(encryptPassword).toHaveBeenCalledWith(password);
      expect(setSpy).toHaveBeenCalledWith({
        email,
        password: encryptedPassword,
      });
      expect(result).toEqual({
        id: 'mock-uuid',
        email,
      });
    });

    it('should throw ConflictException if user already exists', async () => {
      const email = 'test@example.com';
      const password = 'testpassword';
      const existingUser = { id: 'existing-user-id', email };

      // Mock findUserByEmail to return an existing user
      jest
        .spyOn(userService, 'findUserByEmail')
        .mockResolvedValue(existingUser as any);

      await expect(userService.createUser(email, password)).rejects.toThrow(
        ConflictException,
      );
      expect(userService.findUserByEmail).toHaveBeenCalledWith(email);
    });
  });

  describe('findUserById', () => {
    it('should return user details if the user exists', async () => {
      const id = 'mock-uuid';
      const mockUserData = { id, email: 'test@example.com' };

      // Mock Firestore get method
      jest
        .spyOn(mockFirebaseService.getFirestore().collection().doc(), 'get')
        .mockResolvedValue({
          exists: true,
          data: () => mockUserData,
        });

      const result = await userService.findUserById(id);
      expect(result).toEqual(mockUserData);
    });

    it('should return undefined if the user does not exist', async () => {
      const id = 'mock-uuid';

      // Mock Firestore get method to return non-existing user
      jest
        .spyOn(mockFirebaseService.getFirestore().collection().doc(), 'get')
        .mockResolvedValue({
          exists: false,
        });

      const result = await userService.findUserById(id);
      expect(result).toBeUndefined();
    });
  });

  describe('findUserByEmail', () => {
    it('should return user details if the user exists', async () => {
      const email = 'test@example.com';
      const mockUserDocs = [
        {
          data: () => ({ id: 'mock-uuid', email, password: 'hashed_password' }),
        },
      ];

      // Mock Firestore where method
      jest
        .spyOn(mockFirebaseService.getFirestore().collection(), 'get')
        .mockResolvedValue({
          empty: false,
          docs: mockUserDocs,
        });

      const result = await userService.findUserByEmail(email);
      expect(result).toEqual({
        email,
        id: 'mock-uuid',
        password: 'hashed_password',
      });
    });

    it('should return undefined if the user does not exist', async () => {
      const email = 'test@example.com';

      // Mock Firestore where method to return an empty result
      jest
        .spyOn(mockFirebaseService.getFirestore().collection(), 'get')
        .mockResolvedValue({
          empty: true,
          docs: [],
        });

      const result = await userService.findUserByEmail(email);
      expect(result).toBeUndefined();
    });
  });

  describe('login', () => {
    it('should return JWT token if email and password are valid', async () => {
      const email = 'test@example.com';
      const password = 'testpassword';
      const mockUser = { id: 'mock-uuid', email, password: 'hashed_password' };

      // Mock findUserByEmail to return a user
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(mockUser);
      // Mock password match check
      (isPasswordMatch as jest.Mock).mockResolvedValue(true);
      // Mock JWT sign
      jest.spyOn(jwtService, 'sign').mockReturnValue('mock-jwt-token');

      const result = await userService.login(email, password);
      expect(userService.findUserByEmail).toHaveBeenCalledWith(email);
      expect(isPasswordMatch).toHaveBeenCalledWith(password, mockUser.password);
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: mockUser.id });
      expect(result).toEqual('mock-jwt-token');
    });

    it('should throw NotFoundException if user is not found', async () => {
      const email = 'test@example.com';
      const password = 'testpassword';

      // Mock findUserByEmail to return undefined (user not found)
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(undefined);

      await expect(userService.login(email, password)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ApplicationException if password is incorrect', async () => {
      const email = 'test@example.com';
      const password = 'testpassword';
      const mockUser = { id: 'mock-uuid', email, password: 'hashed_password' };

      // Mock findUserByEmail to return a user
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(mockUser);
      // Mock password mismatch
      (isPasswordMatch as jest.Mock).mockResolvedValue(false);

      await expect(userService.login(email, password)).rejects.toThrow(
        ApplicationException,
      );
      expect(isPasswordMatch).toHaveBeenCalledWith(password, mockUser.password);
    });
  });
});
