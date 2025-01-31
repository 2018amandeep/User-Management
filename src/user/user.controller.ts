import { Controller, Post, Body, HttpException, HttpStatus, UseGuards, Get, Request } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './user.service';
import { Throttle } from '@nestjs/throttler';
@Throttle({ default: { limit: 3, ttl: 1000 } })
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }


  @Get()
  async call() {
    // return await this.usersService.advancedLoadTest({
    //   endpoints: [
    //     "https://telecubesapis.bngrenew.com/apn/config",
    //     "https://telecubesapis.bngrenew.com/user/info"
    //   ],
    //   duration: 60000, // 1-minute test
    //   concurrency: 100, // 100 concurrent requests
    //   intervalTime: 20, // Randomized interval between 5-20ms
    //   httpMethods: ["POST", "GET"],
    //   generatePayload: () => ({
    //     "mcc": "652",
    //     "mnc": "04",
    //     "uid": Math.random().toString(36).substring(7) // Unique user ID per request
    //   })
    // });

    return await this.usersService.advancedLoadTest1({
      baseURL: "https://sandbox.cubegames.live/?camp=C2Ctest&rcid={rcid}&flow=direct",
      duration: 60000, // Run for 1 minute
      concurrency: 100, // 100 concurrent requests
      intervalTime: 20, // Random interval (5-20ms)
    })
  }
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
