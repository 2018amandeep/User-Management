import { Controller, Post, Body, HttpException, HttpStatus, UseGuards, Get, Request } from '@nestjs/common';
import { UsersService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post('signup')
  async signup(
    @Body() dto: CreateUserDto,
  ) {
    try {
      const user = await this.usersService.signup(dto);
      return {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        status: user.status,
      };
    } catch (err) {
      throw new HttpException('Mobile number already exists', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('login')
  async login(
    @Body('mobile') mobile: string,
    @Body('password') password: string,
  ) {
    const user = await this.usersService.login(mobile, password);
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }
}
