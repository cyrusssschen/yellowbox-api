import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { FirebaseService } from '@yellowbox-api/shared';
import { LockerStatus } from '../../enums/locker.enum';

@Injectable()
export class LockerService {
  private db = this.firebaseService.getFirestore();

  constructor(private readonly firebaseService: FirebaseService) {}

  // Open a specific locker
  async openLocker(lockerId: string) {
    const { status: currentStatus } = await this.getLockerStatus(lockerId);
    if (currentStatus !== LockerStatus.LOCKED) {
      throw new ConflictException('Locker is unable to be opened');
    }

    const status = LockerStatus.AVAILABLE;

    try {
      const lockerRef = this.db.collection('locker').doc(lockerId);
      await lockerRef.update({ status });
    } catch (error) {
      throw new InternalServerErrorException('Open locker error');
    }

    return { lockerId, status };
  }

  // Retrieve locker status
  async getLockerStatus(lockerId: string) {
    const lockerDoc = await this.db.collection('locker').doc(lockerId).get();
    // Check if the locker exists
    if (!lockerDoc.exists) {
      throw new NotFoundException(`Locker with ID ${lockerId} not found.`);
    }

    return { lockerId, status: lockerDoc.data()?.status };
  }

  // Update locker status
  async updateLockerStatus(lockerId: string, status: LockerStatus) {
    const lockerRef = this.db.collection('locker').doc(lockerId);
    const lockerDoc = await lockerRef.get();
    // Check if the locker exists
    if (!lockerDoc.exists) {
      throw new NotFoundException(`Locker with ID ${lockerId} not found.`);
    }
    // Update locker status
    await lockerRef.update({ status });

    return { lockerId, status };
  }
}
