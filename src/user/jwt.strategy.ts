import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from './user.service';
require('dotenv').config()

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly usersService: UsersService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || "abcdefghijklmnopqrstuvwxyz",
        });
    }

    async validate(payload: { id: number; mobile: string }) {
        const user = this.usersService.validateUser(payload);
        if (!user) {
            throw new UnauthorizedException();
        }
    }
}
