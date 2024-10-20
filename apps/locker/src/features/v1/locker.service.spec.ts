import { Test, TestingModule } from '@nestjs/testing';
import { LockerService } from './locker.service';
import { FirebaseService } from '@yellowbox-api/shared';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { LockerStatus } from '../../enums/locker.enum';
import { of } from 'rxjs';

describe('LockerService', () => {
  let lockerService: LockerService;
  let firebaseService: FirebaseService;

  const mockFirebaseService = {
    getFirestore: jest.fn().mockReturnValue({
      collection: jest.fn().mockReturnThis(),
      doc: jest.fn().mockReturnThis(),
      get: jest.fn(),
      update: jest.fn(),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LockerService,
        { provide: FirebaseService, useValue: mockFirebaseService },
      ],
    }).compile();

    lockerService = module.get<LockerService>(LockerService);
    firebaseService = module.get<FirebaseService>(FirebaseService);
  });

  describe('openLocker', () => {
    it('should open the locker if it is locked', async () => {
      const lockerId = 'locker1';
      const lockerStatus = { status: LockerStatus.LOCKED };

      // Mock getLockerStatus to return LOCKED status
      jest
        .spyOn(lockerService, 'getLockerStatus')
        .mockResolvedValue(lockerStatus as any);

      const result = await lockerService.openLocker(lockerId);

      expect(lockerService.getLockerStatus).toHaveBeenCalledWith(lockerId);
      expect(
        mockFirebaseService.getFirestore().collection('locker').doc(lockerId)
          .update,
      ).toHaveBeenCalledWith({
        status: LockerStatus.AVAILABLE,
      });
      expect(result).toEqual({ lockerId, status: LockerStatus.AVAILABLE });
    });

    it('should throw ConflictException if the locker is not locked', async () => {
      const lockerId = 'locker1';
      const lockerStatus = { status: LockerStatus.AVAILABLE };

      // Mock getLockerStatus to return UNLOCKED status
      jest
        .spyOn(lockerService, 'getLockerStatus')
        .mockResolvedValue(lockerStatus as any);

      await expect(lockerService.openLocker(lockerId)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('getLockerStatus', () => {
    it('should return the locker status', async () => {
      const lockerId = 'locker1';
      jest
        .spyOn(
          mockFirebaseService.getFirestore().collection('locker').doc(lockerId),
          'get',
        )
        .mockResolvedValue({
          exists: true,
          data: jest.fn().mockReturnValue({ status: LockerStatus.LOCKED }),
        });

      const result = await lockerService.getLockerStatus(lockerId);

      expect(
        mockFirebaseService.getFirestore().collection('locker').doc(lockerId)
          .get,
      ).toHaveBeenCalled();
      expect(result).toEqual({ lockerId, status: LockerStatus.LOCKED });
    });

    it('should throw NotFoundException if the specific locker does not exist', async () => {
      const lockerId = 'locker1';
      jest
        .spyOn(
          mockFirebaseService.getFirestore().collection('locker').doc(lockerId),
          'get',
        )
        .mockResolvedValue({
          exists: false,
        });

      await expect(lockerService.getLockerStatus(lockerId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateLockerStatus', () => {
    it('should update the status of an existing locker', async () => {
      const lockerId = '123';
      const existingLocker = { id: lockerId, status: LockerStatus.LOCKED };
      const updatedStatus = LockerStatus.AVAILABLE;

      jest
        .spyOn(
          mockFirebaseService.getFirestore().collection('locker').doc(lockerId),
          'get',
        )
        .mockResolvedValue({
          exists: true,
          data: () => existingLocker,
        });

      const result = await lockerService.updateLockerStatus(
        lockerId,
        updatedStatus,
      );
      expect(result).toEqual({ lockerId, status: updatedStatus });

      expect(
        mockFirebaseService.getFirestore().collection('locker').doc(lockerId)
          .get,
      ).toHaveBeenCalledWith();
      expect(
        mockFirebaseService.getFirestore().collection('locker').doc(lockerId)
          .update,
      ).toHaveBeenCalledWith({ status: updatedStatus });
    });

    it('should throw NotFoundException if the specific locker does not exist', async () => {
      const lockerId = 'locker1';
      const updatedStatus = LockerStatus.AVAILABLE;

      jest
        .spyOn(
          mockFirebaseService.getFirestore().collection('locker').doc(lockerId),
          'get',
        )
        .mockResolvedValue({
          exists: false,
        });

      await expect(
        lockerService.updateLockerStatus(lockerId, updatedStatus),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
