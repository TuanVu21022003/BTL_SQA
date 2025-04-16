import { authenticator } from 'otplib';
import { Location_userEntity } from 'src/entities/user_entity/location_user.entity';
import { User } from 'src/entities/user_entity/user.entity';
import { RegisterModuleService } from '../register-module.service';
import { InternalServerErrorException } from '@nestjs/common';

// Mock external dependencies
jest.mock('nodemailer');
jest.mock('otplib');

// Mock classes
class MockVerifyDto {
  otp: string = '123456';
  email: string = 'test@example.com';
}

class MockRepository<T = any> {
  update = jest.fn();
}

class MockDataSource {}

describe('RegisterModuleService.update() update method', () => {
  let service: RegisterModuleService;
  let mockUserRepository: MockRepository<User>;
  let mockLocationRepository: MockRepository<Location_userEntity>;
  let mockDataSource: MockDataSource;

  beforeEach(() => {
    mockUserRepository = new MockRepository<User>();
    mockLocationRepository = new MockRepository<Location_userEntity>();
    mockDataSource = new MockDataSource();

    service = new RegisterModuleService(
      mockUserRepository as any,
      mockLocationRepository as any,
      mockDataSource as any,
    );
  });

  describe('Happy paths', () => {
    it('should update user as active when OTP is verified', async () => {
      // Arrange
      const mockVerifyDto = new MockVerifyDto();

      (authenticator.check as jest.Mock).mockReturnValue(true);
      mockUserRepository.update.mockResolvedValue({ affected: 1 });

      // Act
      const result = await service.update(mockVerifyDto);

      // Assert
      expect(result).toBe(true);
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        { email: mockVerifyDto.email },
        { isActive: true },
      );
    });
  });

  describe('Edge cases', () => {
    it('should throw an error if OTP is not verified', async () => {
      const mockVerifyDto = new MockVerifyDto();

      (authenticator.check as jest.Mock).mockReturnValue(false);

      await expect(service.update(mockVerifyDto)).rejects.toThrow(
        'REGISTER.OTP EXPIRED!',
      );
    });

    it('should throw an error if update fails', async () => {
      const mockVerifyDto = new MockVerifyDto();

      (authenticator.check as jest.Mock).mockReturnValue(true);
      mockUserRepository.update.mockResolvedValue({ affected: 0 });

      await expect(service.update(mockVerifyDto)).rejects.toThrow(
        'REGISTER.UPDATE ACTIVE FAILED!',
      );
    });
  });
});
