import { Test, TestingModule } from '@nestjs/testing';
import { LockerController } from './locker.controller';
import { LockerService } from './locker.service';
import { LockerStatusUpdateDto } from '../../dto/locker.dto';
import { FirebaseAuthGuard } from 'shared/src/firebase/auth';
import { LockerStatus } from '../../enums/locker.enum';

describe('LockerController', () => {
  let controller: LockerController;
  let lockerService: LockerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LockerController],
      providers: [
        {
          provide: LockerService,
          useValue: {
            openLocker: jest
              .fn()
              .mockResolvedValue('Locker opened successfully'),
            getLockerStatus: jest.fn().mockResolvedValue('Locker is open'),
            updateLockerStatus: jest
              .fn()
              .mockResolvedValue('Locker status updated'),
          },
        },
        {
          provide: FirebaseAuthGuard,
          useValue: {
            canActivate: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    controller = module.get<LockerController>(LockerController);
    lockerService = module.get<LockerService>(LockerService);
  });

  it('should open a locker', async () => {
    const lockerId = '123';
    const result = await controller.openLocker(lockerId);
    expect(result).toBe('Locker opened successfully');
    expect(lockerService.openLocker).toHaveBeenCalledWith(lockerId);
  });

  it('should get the locker status', async () => {
    const lockerId = '123';
    const result = await controller.getLockerStatus(lockerId);
    expect(result).toBe('Locker is open');
    expect(lockerService.getLockerStatus).toHaveBeenCalledWith(lockerId);
  });

  it('should update the locker status', async () => {
    const lockerId = '123';
    const body: LockerStatusUpdateDto = { status: LockerStatus.BOOKED };
    const result = await controller.updateLockerStatus(lockerId, body);
    expect(result).toBe('Locker status updated');
    expect(lockerService.updateLockerStatus).toHaveBeenCalledWith(
      lockerId,
      body.status,
    );
  });
});
