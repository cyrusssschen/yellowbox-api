import { Body, Controller, Patch, Param, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { LockerService } from './locker.service';
import { FirebaseAuthGuard } from '@yellowbox-api/shared';
import { LockerStatusUpdateDto } from '../../dto/locker.dto';

@ApiBearerAuth()
@ApiTags('Lockers')
@Controller({
  path: `/locker`,
  version: '1',
})
export class LockerController {
  constructor(private readonly lockerService: LockerService) {}

  @Patch('open/:lockerId')
  @UseGuards(FirebaseAuthGuard)
  async openLocker(@Param('lockerId') lockerId: string) {
    return await this.lockerService.openLocker(lockerId);
  }

  /**
   * GET /locker/:lockerId/status
   * Endpoint to get the status of a locker.
   * @param lockerId - The ID of the locker to retrieve.
   */
  // skip rate limiting for get status endpoint
  @SkipThrottle()
  @Get(':lockerId/status')
  @UseGuards(FirebaseAuthGuard)
  async getLockerStatus(@Param('lockerId') lockerId: string) {
    return await this.lockerService.getLockerStatus(lockerId);
  }

  /**
   * PATCH /locker/:lockerId/status
   * Endpoint to update the status of a locker.
   * @param lockerId - The ID of the locker to update.
   * @param body - The new status in the request body.
   */
  @Patch(':lockerId/status')
  @UseGuards(FirebaseAuthGuard)
  async updateLockerStatus(
    @Param('lockerId') lockerId: string,
    @Body() body: LockerStatusUpdateDto,
  ) {
    const { status } = body;
    return await this.lockerService.updateLockerStatus(lockerId, status);
  }
}
