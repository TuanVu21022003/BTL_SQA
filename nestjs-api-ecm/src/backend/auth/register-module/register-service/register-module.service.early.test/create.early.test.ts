import { InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { RegisterModuleService } from '../register-module.service';

jest.mock('bcrypt');
jest.mock('nodemailer');
jest.mock('otplib');

// Mock DTO
class MockCreateUserDto {
  public firstName = 'John';
  public lastName = 'Doe';
  public email = 'john.doe@example.com';
  public password = 'password123';
  public address = '123 Main St';
  public phone = '1234567890';
}

// Mock entities & repository
class MockUser {
  public id = 1;
  public email = 'john.doe@example.com';
  public isActive = false;
}

class MockLocation_userEntity {
  public id = 1;
  public name = 'John Doe';
  public address = '123 Main St';
  public phone = '1234567890';
  public default_location = true;
  public user_id = 1;
}

class MockRepository<T = any> {
  findOneBy = jest.fn();
  create = jest.fn();
  save = jest.fn();
}

// Mock QueryRunner & DataSource
const createMockQueryRunner = () => ({
  connect: jest.fn(),
  startTransaction: jest.fn(),
  manager: {
    save: jest.fn(),
  },
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest.fn(),
});

describe('RegisterModuleService.create() create method', () => {
  let service: RegisterModuleService;
  let mockUserRepository: MockRepository;
  let mockLocationRepository: MockRepository;
  let mockDataSource: any;
  let mockQueryRunner: ReturnType<typeof createMockQueryRunner>;
  let mockCreateUserDto: MockCreateUserDto;

  beforeEach(() => {
    mockUserRepository = new MockRepository();
    mockLocationRepository = new MockRepository();
    mockQueryRunner = createMockQueryRunner();
    mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    };
    mockCreateUserDto = new MockCreateUserDto();

    service = new RegisterModuleService(
      mockUserRepository as any,
      mockLocationRepository as any,
      mockDataSource as any,
    );
  });

  describe('Happy paths', () => {
    it('should create a new user and send an OTP email', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockUserRepository.create.mockReturnValue(new MockUser());
      mockQueryRunner.manager.save.mockResolvedValue(new MockUser());
      mockLocationRepository.create.mockReturnValue(new MockLocation_userEntity());

      (nodemailer.createTransport as jest.Mock).mockReturnValue({
        sendMail: jest.fn().mockResolvedValue({ response: 'Email sent' }),
      });

      const result = await service.create(mockCreateUserDto as any);

      expect(result).toEqual({ email: 'john.doe@example.com' });
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ email: 'john.doe@example.com' });
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should throw an error if the user already exists and is active', async () => {
      mockUserRepository.findOneBy.mockResolvedValue({ isActive: true });

      await expect(service.create(mockCreateUserDto as any)).rejects.toThrow('REGISTER.ACCOUNT EXISTS!');
    });

    it('should send OTP email if user exists but not active', async () => {
      mockUserRepository.findOneBy.mockResolvedValue({ isActive: false, email: 'john.doe@example.com' });

      (nodemailer.createTransport as jest.Mock).mockReturnValue({
        sendMail: jest.fn().mockResolvedValue({ response: 'Email sent' }),
      });

      await expect(service.create(mockCreateUserDto as any)).rejects.toThrow(
        'REGISTER.ACCOUNT NOT VERIFY! PLEASE ENTER OTP VERIFY!',
      );

      expect(nodemailer.createTransport).toHaveBeenCalled();
    });

    it('should rollback transaction and throw error if saving user fails', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockUserRepository.create.mockReturnValue(new MockUser());
      mockQueryRunner.manager.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create(mockCreateUserDto as any)).rejects.toThrow(InternalServerErrorException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });
});
