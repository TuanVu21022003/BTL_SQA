import {
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginModuleService } from '../login-module.service';

// 👉 Mock toàn bộ bcrypt module
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

// Mock classes
class MockLoginDTO {
  public email: string = 'test@example.com';
  public password: string = 'password123';
}

class MockUser {
  public id: number = 1;
  public email: string = 'test@example.com';
  public password: string = 'hashedPassword';
  public role: string = 'user';
  public token: string = '';
}

class MockRepository {
  public findOneBy = jest.fn();
  public save = jest.fn();
}

describe('LoginModuleService.login() login method', () => {
  let service: LoginModuleService;
  let mockRepository: MockRepository;
  let mockJwtService: JwtService;
  let mockConfigService: ConfigService;

  beforeEach(() => {
    mockRepository = new MockRepository() as any;
    mockJwtService = {
      signAsync: jest.fn(),
    } as any;
    mockConfigService = {} as any;

    service = new LoginModuleService(
      mockRepository as any,
      mockJwtService as any,
      mockConfigService as any,
    );

    jest.clearAllMocks(); // reset mocks trước mỗi test
  });

  describe('Happy paths', () => {
    it('should successfully login a user with valid credentials', async () => {
      const mockLoginDTO = new MockLoginDTO();
      const mockUser = new MockUser();

      mockRepository.findOneBy.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (mockJwtService.signAsync as jest.Mock).mockResolvedValue('accessToken');

      const result = await service.login(mockLoginDTO);

      expect(result).toEqual({
        user: mockUser,
        accessToken: 'accessToken',
      });
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        token: 'accessToken',
      });
    });
  });

  describe('Edge cases', () => {
    it('should throw NotFoundException if user is not found', async () => {
      const mockLoginDTO = new MockLoginDTO();

      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.login(mockLoginDTO)).rejects.toThrow(
        new NotFoundException('LOGIN.USER.EMAIL IS NOT VALID!'),
      );
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const mockLoginDTO = new MockLoginDTO();
      const mockUser = new MockUser();

      mockRepository.findOneBy.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(mockLoginDTO)).rejects.toThrow(
        new UnauthorizedException('LOGIN.USER.PASSWORD IS NOT VALID!'),
      );
    });
  });
});
