import { Test, TestingModule } from '@nestjs/testing';
import { BookingsController } from './booking.controller';
import { BookingService } from './booking.service';
import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import {
  EndBookingRequestDto,
  StartBookingRequestDto,
} from '../../dto/booking.dto';

describe('BookingsController', () => {
  let bookingsController: BookingsController;
  let bookingService: BookingService;

  const mockBookingService = {
    startBooking: jest.fn(),
    endBooking: jest.fn(),
  };

  const mockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnThis();
    res.send = jest.fn();
    return res as Response;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [{ provide: BookingService, useValue: mockBookingService }],
    }).compile();

    bookingsController = module.get<BookingsController>(BookingsController);
    bookingService = module.get<BookingService>(BookingService);
  });

  describe('startBooking', () => {
    it('should start a booking and return a created status', async () => {
      const reqDto: StartBookingRequestDto = {
        userId: 'user1',
        lockerId: 'locker1',
      };
      const result = {
        bookingId: 'booking1',
        userId: 'user1',
        lockerId: 'locker1',
      };
      mockBookingService.startBooking.mockResolvedValue(result);

      const res = mockResponse();
      await bookingsController.startBooking(reqDto, res);

      expect(bookingService.startBooking).toHaveBeenCalledWith(
        'locker1',
        'user1',
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.send).toHaveBeenCalledWith(result);
    });

    it('should handle error when starting booking', async () => {
      const reqDto: StartBookingRequestDto = {
        userId: 'user1',
        lockerId: 'locker1',
      };
      mockBookingService.startBooking.mockRejectedValue(
        new Error('Bad Request'),
      );

      const res = mockResponse();
      await expect(
        bookingsController.startBooking(reqDto, res),
      ).rejects.toThrow(Error);
    });
  });

  describe('endBooking', () => {
    it('should end a booking and return an OK status', async () => {
      const reqDto: EndBookingRequestDto = {
        bookingId: 'booking1',
      };
      const result = {
        bookingId: 'booking1',
        lockerId: 'locker1',
        ended: true,
      };
      mockBookingService.endBooking.mockResolvedValue(result);

      const res = mockResponse();
      await bookingsController.endBooking(reqDto, res);

      expect(bookingService.endBooking).toHaveBeenCalledWith('booking1');
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.send).toHaveBeenCalledWith(result);
    });

    it('should handle error when ending booking', async () => {
      const reqDto: EndBookingRequestDto = {
        bookingId: 'booking1',
      };
      mockBookingService.endBooking.mockRejectedValue(new Error('Bad Request'));

      const res = mockResponse();
      await expect(bookingsController.endBooking(reqDto, res)).rejects.toThrow(
        Error,
      );
    });
  });
});
