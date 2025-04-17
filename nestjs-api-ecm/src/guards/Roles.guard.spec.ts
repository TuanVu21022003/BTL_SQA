import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './Roles.guard'; // Điều chỉnh đường dẫn nếu cần
import { Reflector } from '@nestjs/core';
import { UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { responseHandler } from 'src/Until/responseUtil';
import { Request } from 'express';

// Mock responseHandler
jest.mock('src/Until/responseUtil', () => ({
  responseHandler: {
    unauthorized: jest.fn((message) => ({ success: false, message })),
  },
}));

describe('RolesGuard', () => {
  let rolesGuard: RolesGuard;
  let reflector: Reflector;

  // Mock Reflector
  const mockReflector = {
    get: jest.fn(),
  };

  // Hàm tạo mock ExecutionContext
  const createMockExecutionContext = (request: Partial<Request>): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => request as Request,
        getResponse: jest.fn(),
        getNext: jest.fn(),
      }),
      getClass: jest.fn(),
      getHandler: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      getType: jest.fn(),
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    rolesGuard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('nên trả về true nếu không có roles yêu cầu', () => {
      const mockRequest = {};
      const mockContext = createMockExecutionContext(mockRequest);
      mockReflector.get.mockReturnValue(undefined); // Không có roles được định nghĩa

      const result = rolesGuard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(reflector.get).toHaveBeenCalledWith('roles', expect.any(Function));
    });

    it('nên throw UnauthorizedException nếu không có user trong request', () => {
      const mockRequest = {};
      const mockContext = createMockExecutionContext(mockRequest);
      mockReflector.get.mockReturnValue(['admin']); // Yêu cầu role 'admin'

      expect(() => rolesGuard.canActivate(mockContext)).toThrow(UnauthorizedException);
      expect(responseHandler.unauthorized).toHaveBeenCalledWith('You cannot access!');
    });

    it('nên throw UnauthorizedException nếu role của user không khớp với roles yêu cầu', () => {
      const mockRequest = {
        user: { role: 'user' },
      };
      const mockContext = createMockExecutionContext(mockRequest);
      mockReflector.get.mockReturnValue(['admin']); // Yêu cầu role 'admin'

      expect(() => rolesGuard.canActivate(mockContext)).toThrow(UnauthorizedException);
      expect(responseHandler.unauthorized).toHaveBeenCalledWith('You cannot access!');
    });

    it('nên trả về true nếu role của user khớp với roles yêu cầu (role = user)', () => {
      const mockRequest = {
        user: { role: 'user' },
      };
      const mockContext = createMockExecutionContext(mockRequest);
      mockReflector.get.mockReturnValue(['user', 'admin']); // Yêu cầu role 'user' hoặc 'admin'

      const result = rolesGuard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(reflector.get).toHaveBeenCalledWith('roles', expect.any(Function));
    });

    it('nên trả về true nếu role của user khớp với roles yêu cầu (role = admin)', () => {
      const mockRequest = {
        user: { role: 'admin' },
      };
      const mockContext = createMockExecutionContext(mockRequest);
      mockReflector.get.mockReturnValue(['admin']); // Yêu cầu role 'admin'

      const result = rolesGuard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(reflector.get).toHaveBeenCalledWith('roles', expect.any(Function));
    });

    it('nên throw UnauthorizedException nếu user.role là undefined', () => {
      const mockRequest = {
        user: {}, // Không có role
      };
      const mockContext = createMockExecutionContext(mockRequest);
      mockReflector.get.mockReturnValue(['admin']); // Yêu cầu role 'admin'

      expect(() => rolesGuard.canActivate(mockContext)).toThrow(UnauthorizedException);
      expect(responseHandler.unauthorized).toHaveBeenCalledWith('You cannot access!');
    });
  });
});