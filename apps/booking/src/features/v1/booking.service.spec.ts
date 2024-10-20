import { Test, TestingModule } from '@nestjs/testing';
import { BookingService } from './booking.service';
import { HttpService } from '@nestjs/axios';
import { FirebaseService } from '@yellowbox-api/shared';
import {
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AxiosError } from 'axios';
import { BookingStatus, LockerStatus } from '../../enums/booking.enum';

jest.mock('@yellowbox-api/shared');

describe('BookingService', () => {
  let bookingService: BookingService;
  let firebaseService: FirebaseService;
  let httpService: HttpService;

  const mockFirebaseService = {
    getFirestore: jest.fn().mockReturnValue({
      collection: jest.fn().mockReturnThis(),
      doc: jest.fn().mockReturnThis(),
      get: jest.fn(),
      set: jest.fn(),
      update: jest.fn(),
    }),
  };

  const mockHttpService = {
    get: jest.fn(),
    patch: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        { provide: FirebaseService, useValue: mockFirebaseService },
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    bookingService = module.get<BookingService>(BookingService);
    firebaseService = module.get<FirebaseService>(FirebaseService);
    httpService = module.get<HttpService>(HttpService);
  });

  describe('startBooking', () => {
    it('should start a booking if locker is available and user exists', async () => {
      const lockerId = 'locker_123';
      const userId = 'user_456';

      jest
        .spyOn(bookingService, 'getLockerStatus')
        .mockResolvedValue(LockerStatus.AVAILABLE);
      jest
        .spyOn(bookingService, 'getUserById')
        .mockResolvedValue({ id: userId });
      jest.spyOn(bookingService, 'updateLockerStatus').mockResolvedValue({});
      jest.spyOn(bookingService, 'bookLocker').mockResolvedValue({
        bookingId: 'booking_789',
        result: 'Booking started',
      });

      const result = await bookingService.startBooking(lockerId, userId);

      expect(bookingService.getLockerStatus).toHaveBeenCalledWith(lockerId);
      expect(bookingService.getUserById).toHaveBeenCalledWith(userId);
      expect(bookingService.updateLockerStatus).toHaveBeenCalledWith(
        lockerId,
        LockerStatus.BOOKED,
      );
      expect(bookingService.bookLocker).toHaveBeenCalledWith(lockerId, userId);
      expect(result).toEqual({
        bookingId: 'booking_789',
        result: 'Booking started',
      });
    });

    it('should throw ConflictException if locker is not available', async () => {
      const lockerId = 'locker_123';
      const userId = 'user_456';

      jest
        .spyOn(bookingService, 'getLockerStatus')
        .mockResolvedValue(LockerStatus.BOOKED);

      await expect(
        bookingService.startBooking(lockerId, userId),
      ).rejects.toThrow(ConflictException);
      expect(bookingService.getLockerStatus).toHaveBeenCalledWith(lockerId);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const lockerId = 'locker_123';
      const userId = 'user_456';

      jest
        .spyOn(bookingService, 'getLockerStatus')
        .mockResolvedValue(LockerStatus.AVAILABLE);
      jest.spyOn(bookingService, 'getUserById').mockResolvedValue({});

      await expect(
        bookingService.startBooking(lockerId, userId),
      ).rejects.toThrow(NotFoundException);
      expect(bookingService.getUserById).toHaveBeenCalledWith(userId);
    });
  });

  describe('endBooking', () => {
    it('should end a booking if booking exists and is active', async () => {
      const bookingId = 'booking_789';
      const lockerId = 'locker_123';
      const bookingData = { lockerId, status: BookingStatus.ACTIVE };

      jest
        .spyOn(firebaseService.getFirestore().collection('').doc(), 'get')
        .mockResolvedValue({
          exists: true,
          data: () => bookingData,
        } as any);

      jest.spyOn(bookingService, 'updateLockerStatus').mockResolvedValue({});

      const result = await bookingService.endBooking(bookingId);

      expect(bookingService.updateLockerStatus).toHaveBeenCalledWith(
        lockerId,
        LockerStatus.AVAILABLE,
      );
      expect(
        firebaseService.getFirestore().collection('').doc().update,
      ).toHaveBeenCalledWith({
        endedAt: expect.any(Number),
        status: BookingStatus.COMPLETED,
      });
      expect(result).toEqual({
        bookingId,
        endedAt: expect.any(Number),
        lockerId,
        result: 'Booking ended',
      });
    });

    it('should throw NotFoundException if booking does not exist', async () => {
      const bookingId = 'booking_789';

      jest
        .spyOn(firebaseService.getFirestore().collection('').doc(), 'get')
        .mockResolvedValue({
          exists: false,
        } as any);

      await expect(bookingService.endBooking(bookingId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if booking is already completed', async () => {
      const bookingId = 'booking_789';
      const bookingData = {
        lockerId: 'locker_123',
        status: BookingStatus.COMPLETED,
      };

      jest
        .spyOn(firebaseService.getFirestore().collection('').doc(), 'get')
        .mockResolvedValue({
          exists: true,
          data: () => bookingData,
        } as any);

      await expect(bookingService.endBooking(bookingId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getUserById', () => {
    it('should return user data if the user exists', async () => {
      const userId = 'user_123';
      const mockResponse = { data: { id: userId } };

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse) as any);

      const result = await bookingService.getUserById(userId);

      expect(httpService.get).toHaveBeenCalledWith(
        `/v1/user/${userId}`,
        expect.any(Object),
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw InternalServerErrorException on Axios error', async () => {
      const userId = 'user_123';
      const mockError = new AxiosError('error', '500', null, null, {
        status: 500,
        data: 'Internal Server Error',
      } as any);

      jest.spyOn(httpService, 'get').mockReturnValue(throwError(mockError));

      await expect(bookingService.getUserById(userId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getLockerStatus', () => {
    it('should return locker status if the locker exists', async () => {
      const lockerId = 'locker_123';
      const mockResponse = { data: LockerStatus.AVAILABLE };

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse) as any);

      const result = await bookingService.getLockerStatus(lockerId);

      expect(httpService.get).toHaveBeenCalledWith(
        `/v1/locker/${lockerId}/status`,
        expect.any(Object),
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw InternalServerErrorException on Axios error', async () => {
      const lockerId = 'locker_123';
      const mockError = new AxiosError('error', '500', null, null, {
        status: 500,
        data: 'Internal Server Error',
      } as any);

      jest.spyOn(httpService, 'get').mockReturnValue(throwError(mockError));

      await expect(bookingService.getLockerStatus(lockerId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('updateLockerStatus', () => {
    it('should update locker status successfully', async () => {
      const lockerId = 'locker_123';
      const status = LockerStatus.BOOKED;
      const mockResponse = { data: 'Locker status updated' };

      jest.spyOn(httpService, 'patch').mockReturnValue(of(mockResponse) as any);

      const result = await bookingService.updateLockerStatus(lockerId, status);

      expect(httpService.patch).toHaveBeenCalledWith(
        `/v1/locker/${lockerId}/status`,
        { status },
        expect.any(Object),
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw InternalServerErrorException on Axios error', async () => {
      const lockerId = 'locker_123';
      const status = LockerStatus.BOOKED;
      const mockError = new AxiosError('error', '500', null, null, {
        status: 500,
        data: 'Internal Server Error',
      } as any);

      jest.spyOn(httpService, 'patch').mockReturnValue(throwError(mockError));

      await expect(
        bookingService.updateLockerStatus(lockerId, status),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
