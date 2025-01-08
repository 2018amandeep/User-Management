import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
require('dotenv').config()

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) { }

  async signup(dto: CreateUserDto): Promise<User> {
    const { name, mobile, password } = dto;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({ name, mobile, password: hashedPassword });
    return this.userRepository.save(user);
  }

  async login(mobile: string, password: string): Promise<{ token: string } | null> {
    const user = await this.userRepository.findOne({ where: { mobile } });
    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = { id: user.id, mobile: user.mobile, status: user.status };
      const token = this.jwtService.sign(payload);
      return { token };
    }
    return null;
  }

  async validateUser(payload: { id: number; mobile: string }): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: payload.id, mobile: payload.mobile } });
  }
}
