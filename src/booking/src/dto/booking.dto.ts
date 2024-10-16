import { ApiProperty } from '@nestjs/swagger';

export class StartBookingRequestDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  lockerId: string;

  constructor(request: Partial<StartBookingRequestDto> = {}) {
    Object.assign(this, request);
  }
}

export class EndBookingRequestDto {
  @ApiProperty()
  bookingId: string;
}
