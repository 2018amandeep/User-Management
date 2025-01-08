import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from './dto/create-user.dto'; // Assuming you have a DTO
import { UsersController } from './user.controller';
import { UsersService } from './user.service';
import { JwtService } from '@nestjs/jwt'; // Import JwtService

// Mock the UsersService with proper types for the methods
const user = {
    id: 1,
    name: 'John Doe',
    mobile: '9876543210',
    status: false,
    password: 'hashed_password', // This might be omitted in the final return object
    last_login: new Date(),
    ip_address: '127.0.0.1',
    created_at: new Date(),
};

const mockUsersService = () => ({
    signup: jest.fn().mockResolvedValue(user),
    login: jest.fn().mockResolvedValue({ token: 'jwt_token' }),
    validateUser: jest.fn().mockResolvedValue(true), // assuming you have validateUser in the service
});

const mockJwtService = () => ({
    sign: jest.fn().mockReturnValue('jwt_token'),
});

describe('UsersController', () => {
    let controller: UsersController;
    let service: jest.Mocked<UsersService>;  // Correct type for UsersService mock
    let jwtService: jest.Mocked<JwtService>; // Correct type for JwtService mock

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                { provide: UsersService, useValue: mockUsersService() },
                { provide: JwtService, useValue: mockJwtService() }, // Provide the mocked JwtService
            ],
        }).compile();

        controller = module.get<UsersController>(UsersController);

        // Explicitly cast the mock to the expected type
        service = module.get<UsersService>(UsersService) as jest.Mocked<UsersService>;
        jwtService = module.get<JwtService>(JwtService) as jest.Mocked<JwtService>; // Cast the mock to JwtService
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('signup', () => {
        it('should call service.signup and return user data', async () => {
            const userDto: CreateUserDto = { name: 'John Doe', mobile: '9876543210', password: 'Password@123' };

            // Mock service.signup to resolve with the user object
            service.signup.mockResolvedValue(user);

            // Call the controller's signup method
            const result = await controller.signup(userDto);

            // Check that service.signup was called with the correct DTO
            expect(service.signup).toHaveBeenCalledWith(userDto);

            // Check that the returned result matches the user object
            expect(result).toEqual({ id: 1, name: 'John Doe', mobile: '9876543210', status: false });
        });
    });

    describe('login', () => {
        it('should call service.login and return token', async () => {
            const credentials = { mobile: '9876543210', password: 'Password@123' };
            const token = { token: 'jwt_token' };

            // Mock the login method in UsersService
            service.login.mockResolvedValue(token);
            // Mock the JwtService to return a token
            jwtService.sign.mockReturnValue('jwt_token');

            const result = await controller.login(credentials.mobile, credentials.password);

            expect(service.login).toHaveBeenCalledWith(credentials.mobile, credentials.password);
            expect(result).toEqual(token);
        });

        it('should throw an error if login fails', async () => {
            // Mock the login method to return null (failure case)
            service.login.mockResolvedValue(null);

            // Expect an error to be thrown when login fails
            await expect(controller.login('9876543210', 'wrong_password')).rejects.toThrowError();
        });
    });
});
