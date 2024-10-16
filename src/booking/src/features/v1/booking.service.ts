import {
  ConflictException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as https from 'https';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { FirebaseService } from 'shared/src/firebase';
import { HttpContext } from 'shared/src/middlewares/context';
import { BookingStatus, LockerStatus } from '../../enums/booking.enum';

@Injectable()
export class BookingService {
  private db = this.firebaseService.getFirestore();
  private baseURLs = {
    lockerBaseURL: 'http://localhost:3355',
    userBaseURL: 'http://localhost:3366',
  };
  private httpRequestConfig = {
    timeout: 60000,
    maxContentLength: 500 * 1000 * 1000,
    httpsAgent: new https.Agent({ keepAlive: true }),
  };

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly httpService: HttpService,
  ) {}

  // Start booking a locker
  async startBooking(lockerId: string, userId: string) {
    // check locker status
    const lockerStatus = await this.getLockerStatus(lockerId);
    if (lockerStatus !== LockerStatus.AVAILABLE) {
      throw new ConflictException('Locker is unable to be booked currently');
    }

    // check whether user exists
    const user = await this.getUserById(userId);
    if (!user.id) {
      throw new NotFoundException('User is not found');
    }

    // update locker status
    await this.updateLockerStatus(lockerId, LockerStatus.BOOKED);

    const result = await this.bookLocker(lockerId, userId);
    return result;
  }

  async bookLocker(lockerId: string, userId: string) {
    const startedAt = Date.now();
    const newBooking = {
      userId,
      lockerId,
      startedAt,
      endedAt: null,
      status: BookingStatus.ACTIVE,
    };

    const uuid = uuidv4();
    const docId = `booking_${uuid}`;
    const bookingRef = this.db.collection('booking').doc(docId);
    await bookingRef.set(newBooking);
    return { bookingId: docId, result: 'Booking started' };
  }

  // End booking
  async endBooking(bookingId: string) {
    const bookingRef = this.db.collection('booking').doc(bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      throw new NotFoundException(`Booking with ID ${bookingId} is not found`);
    }

    const { lockerId, status } = bookingDoc.data();
    // Check if the booking is already completed
    if (status === 'completed') {
      throw new BadRequestException(
        `Booking with ID ${bookingId} is already completed.`,
      );
    }

    // Update locker status to available
    await this.updateLockerStatus(lockerId, LockerStatus.AVAILABLE);

    const endedAt = Date.now();

    await bookingRef.update({
      endedAt,
      status: BookingStatus.COMPLETED,
    });

    return { bookingId, endedAt, lockerId, result: 'Booking ended' };
  }

  async getUserById(userId: string) {
    const { data } = await firstValueFrom(
      this.httpService
        .get(`/v1/user/${userId}`, {
          ...this.httpRequestConfig,
          baseURL: this.baseURLs.userBaseURL,
          headers: {
            Authorization:
              HttpContext?.headers?.authorization?.toString() ?? '',
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            throw new InternalServerErrorException(error.response.data);
          }),
        ),
    );
    return data;
  }

  async getLockerStatus(lockerId: string) {
    const { data } = await firstValueFrom(
      this.httpService
        .get(`/v1/locker/${lockerId}/status`, {
          ...this.httpRequestConfig,
          baseURL: this.baseURLs.lockerBaseURL,
          headers: {
            Authorization:
              HttpContext?.headers?.authorization?.toString() ?? '',
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            throw new InternalServerErrorException(error.response.data);
          }),
        ),
    );
    return data;
  }

  async updateLockerStatus(lockerId: string, status: LockerStatus) {
    const { data } = await firstValueFrom(
      this.httpService
        .patch(
          `/v1/locker/${lockerId}/status`,
          { status },
          {
            ...this.httpRequestConfig,
            baseURL: this.baseURLs.lockerBaseURL,
            headers: {
              Authorization:
                HttpContext?.headers?.authorization?.toString() ?? '',
            },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            throw new InternalServerErrorException(error.response.data);
          }),
        ),
    );
    return data;
  }
}
