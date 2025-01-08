import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './user.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

const mockUserRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
});

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const mockJwtService = () => ({
    sign: jest.fn(),
  });

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<Repository<User>>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository() },
        { provide: JwtService, useValue: mockJwtService() },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    it('should hash the password and save the user', async () => {
      const userDto = { name: 'John Doe', mobile: '9876543210', password: 'Password@123' };
      const hashedPassword = 'hashed_password';

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword); // Type casting to Mock
      userRepository.create.mockReturnValue(userDto as User);
      userRepository.save.mockResolvedValue({ id: 1, ...userDto } as User);

      const result = await service.signup(userDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(userDto.password, 10);
      expect(userRepository.create).toHaveBeenCalledWith({
        name: userDto.name,
        mobile: userDto.mobile,
        password: hashedPassword,
      });
      expect(userRepository.save).toHaveBeenCalled();
      expect(result).toEqual({ id: 1, ...userDto });
    });
  });

  describe('login', () => {
    it('should validate user and return token', async () => {
      const user = { id: 1, name: 'John Doe', mobile: '9876543210', password: 'hashed_password' };
      (bcrypt.compare as jest.Mock).mockResolvedValue(true); // Type casting to Mock
      userRepository.findOne.mockResolvedValue(user as User);

      const result = await service.login(user.mobile, 'Password@123');
      expect(bcrypt.compare).toHaveBeenCalledWith('Password@123', user.password);
      expect(result).toBeDefined();
    });

    it('should return null if user validation fails', async () => {
      userRepository.findOne.mockResolvedValue(null);
      const result = await service.login('9876543210', 'Password@123');
      expect(result).toBeNull();
    });
  });
});
