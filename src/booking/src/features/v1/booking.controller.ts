import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { FirebaseAuthGuard } from 'shared/src/firebase/auth';
import { BookingService } from './booking.service';
import {
  EndBookingRequestDto,
  StartBookingRequestDto,
} from '../../dto/booking.dto';

@ApiBearerAuth()
@ApiTags('Bookings')
@Controller({
  path: `/booking`,
  version: '1',
})
export class BookingsController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('start')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({ status: 401, description: 'UNAUTHORIZED' })
  @ApiResponse({ status: 400, description: 'BAD_REQUEST' })
  @ApiResponse({ status: 403, description: 'FORBIDDEN' })
  @ApiResponse({ status: 201, description: 'LOCKER BOOKED' })
  async startBooking(
    @Body() body: StartBookingRequestDto,
    @Res() res: Response,
  ) {
    const { lockerId, userId } = body;
    const result = await this.bookingService.startBooking(lockerId, userId);

    res.status(HttpStatus.CREATED).send(result);
    return result;
  }

  @Put('end')
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({ status: 401, description: 'UNAUTHORIZED' })
  @ApiResponse({ status: 400, description: 'BAD_REQUEST' })
  @ApiResponse({ status: 403, description: 'FORBIDDEN' })
  @ApiResponse({ status: 201, description: 'LOCKER ENDED' })
  async endBooking(
    @Body() request: EndBookingRequestDto,
    @Res() res: Response,
  ) {
    const { bookingId } = request;
    const result = await this.bookingService.endBooking(bookingId);

    res.status(HttpStatus.OK).send(result);
    return result;
  }
}
