import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from '../../dto/user.dto';
import { LoginRequestDto } from '../../dto/login.dto';

@ApiBearerAuth()
@ApiTags('Users')
@Controller({
  path: `/user`,
  version: '1',
})
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * POST /user/create
   * Endpoint to create new user
   * @body body - new user information
   */
  @Post('create')
  async createUser(@Body() body: CreateUserDto) {
    const { email, password } = body;
    return await this.userService.createUser(email.toLowerCase(), password);
  }

  /**
   * GET /user/:userId
   * Endpoint to get user info by id
   * @param userId - user ID
   */
  @Get(':userId')
  async getUserById(@Param('userId') userId: string) {
    const user = await this.userService.findUserById(userId);
    return user;
  }

  /**
   * POST /user/login
   * Endpoint to generate JWT token
   * @body body - login information
   */
  @Post('login')
  async login(@Body() body: LoginRequestDto) {
    const { email, password } = body;
    return this.userService.login(email, password);
  }
}
