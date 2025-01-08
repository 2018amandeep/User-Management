import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { UsersController } from './user.controller';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './user.service';
import { User } from './entities/user.entity';
import { APP_GUARD } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION },
    }),
    ThrottlerModule.forRoot(
      //   {
      //   ttl: 60, 
      //   limit: 10
      // }
    )

  ],
  exports: [UsersService],
  controllers: [UsersController],
  providers: [UsersService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ],
})
export class UserModule { }
