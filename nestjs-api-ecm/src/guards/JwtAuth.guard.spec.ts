import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './JwtAuth.guard'; // Điều chỉnh đường dẫn nếu cần
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/backend/user/user.service';
import { UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { responseHandler } from 'src/Until/responseUtil';

// Mock responseHandler
jest.mock('src/Until/responseUtil', () => ({
  responseHandler: {
    error: jest.fn((message) => ({ success: false, message })),
  },
}));

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let jwtService: JwtService;
  let userService: UserService;
  let configService: ConfigService;

  // Mock dependencies
  const mockJwtService = {
    verifyAsync: jest.fn(),
  };
  const mockUserService = {
    findOne: jest.fn(),
  };
  const mockConfigService = {
    get: jest.fn(),
  };

  // Hàm tạo mock ExecutionContext
  const createMockExecutionContext = (request: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: jest.fn(),
        getNext: jest.fn(),
      }),
      getClass: jest.fn(),
      getHandler: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      getType: jest.fn(),
    } as unknown as ExecutionContext; // Ép kiểu để TypeScript chấp nhận
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: JwtService, useValue: mockJwtService },
        { provide: UserService, useValue: mockUserService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    authGuard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get<JwtService>(JwtService);
    userService = module.get<UserService>(UserService);
    configService = module.get<ConfigService>(ConfigService);

    mockConfigService.get.mockReturnValue('secret-key');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('nên trả về lỗi nếu không có authorization header', async () => {
      const mockRequest = { headers: {} };
      const mockContext = createMockExecutionContext(mockRequest);

      const result = await authGuard.canActivate(mockContext);

      expect(result).toEqual({
        success: false,
        message: 'GUARD.PLEASE PROVIDE AUTHORIZATIONHEADER!',
      });
      expect(responseHandler.error).toHaveBeenCalledWith(
        'GUARD.PLEASE PROVIDE AUTHORIZATIONHEADER!',
      );
    });

    it('nên trả về lỗi nếu token không tồn tại', async () => {
      const mockRequest = { headers: { authorization: 'Bearer ' } };
      const mockContext = createMockExecutionContext(mockRequest);

      const result = await authGuard.canActivate(mockContext);

      expect(result).toEqual({
        success: false,
        message: 'GUARD.PLEASE PROVIDE TOKEN!',
      });
      expect(responseHandler.error).toHaveBeenCalledWith(
        'GUARD.PLEASE PROVIDE TOKEN!',
      );
    });

    it('nên throw UnauthorizedException nếu token không hợp lệ', async () => {
      const mockRequest = { headers: { authorization: 'Bearer invalid-token' } };
      const mockContext = createMockExecutionContext(mockRequest);
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(authGuard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('invalid-token', {
        secret: 'secret-key',
      });
    });

    it('nên trả về false nếu user không active', async () => {
      const mockRequest = { headers: { authorization: 'Bearer valid-token' } };
      const mockContext = createMockExecutionContext(mockRequest);
      mockJwtService.verifyAsync.mockResolvedValue({ id: '1' });
      mockUserService.findOne.mockResolvedValue({
        id: '1',
        isActive: false,
        token: 'valid-token',
        role: 'user',
      });

      const result = await authGuard.canActivate(mockContext);

      expect(result).toBe(false);
      expect(userService.findOne).toHaveBeenCalledWith('1');
    });

    it('nên trả về false nếu user không có token', async () => {
      const mockRequest = { headers: { authorization: 'Bearer valid-token' } };
      const mockContext = createMockExecutionContext(mockRequest);
      mockJwtService.verifyAsync.mockResolvedValue({ id: '1' });
      mockUserService.findOne.mockResolvedValue({
        id: '1',
        isActive: true,
        token: null,
        role: 'user',
      });

      const result = await authGuard.canActivate(mockContext);

      expect(result).toBe(false);
    });

    it('nên trả về lỗi nếu user_id trong params không khớp với token (role != admin)', async () => {
      const mockRequest = {
        headers: { authorization: 'Bearer valid-token' },
        params: { user_id: '2' },
      };
      const mockContext = createMockExecutionContext(mockRequest);
      mockJwtService.verifyAsync.mockResolvedValue({ id: '1' });
      mockUserService.findOne.mockResolvedValue({
        id: '1',
        isActive: true,
        token: 'valid-token',
        role: 'user',
      });

      const result = await authGuard.canActivate(mockContext);

      expect(result).toEqual({
        success: false,
        message: 'GUARD.USER ID IN PARAM DOES NOT MATCH WITH TOKEN!',
      });
      expect(responseHandler.error).toHaveBeenCalledWith(
        'GUARD.USER ID IN PARAM DOES NOT MATCH WITH TOKEN!',
      );
    });

    it('nên trả về true và gán user vào request nếu hợp lệ (role = user)', async () => {
      const mockRequest = {
        headers: { authorization: 'Bearer valid-token' },
        params: { user_id: '1' },
        user: {
            firstName: 'John',
            lastName: 'Doe',
            phone: '0987654321', // Số điện thoại hợp lệ ở Việt Nam (bắt đầu bằng 09, 10 số)
            email: 'john.doe@example.com', // Email hợp lệ
            password: 'password123', // Mật khẩu từ 8-24 ký tự
            address: '123 Main Street',
            url_image: 'https://example.com/image.jpg', // Tùy chọn, có thể bỏ qua
            active: true, // Tùy chọn, mặc định true cho ví dụ
            role: 'user', // Tùy chọn, mặc định 'user'
        }
      };
      const mockContext = createMockExecutionContext(mockRequest);
      mockJwtService.verifyAsync.mockResolvedValue({ id: '1' });
      mockUserService.findOne.mockResolvedValue({
        id: '1',
        isActive: true,
        token: 'valid-token',
        role: 'user',
      });

      const result = await authGuard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(mockRequest.user).toEqual({
        id: '1',
        isActive: true,
        token: 'valid-token',
        role: 'user',
      });
    });

    it('nên trả về true nếu role là admin dù user_id không khớp', async () => {
      const mockRequest = {
        headers: { authorization: 'Bearer valid-token' },
        params: { user_id: '2' },
        user: {
            firstName: 'John',
            lastName: 'Doe',
            phone: '0987654321', // Số điện thoại hợp lệ ở Việt Nam (bắt đầu bằng 09, 10 số)
            email: 'john.doe@example.com', // Email hợp lệ
            password: 'password123', // Mật khẩu từ 8-24 ký tự
            address: '123 Main Street',
            url_image: 'https://example.com/image.jpg', // Tùy chọn, có thể bỏ qua
            active: true, // Tùy chọn, mặc định true cho ví dụ
            role: 'user', // Tùy chọn, mặc định 'user'
        }
      };
      const mockContext = createMockExecutionContext(mockRequest);
      mockJwtService.verifyAsync.mockResolvedValue({ id: '1' });
      mockUserService.findOne.mockResolvedValue({
        id: '1',
        isActive: true,
        token: 'valid-token',
        role: 'admin',
      });

      const result = await authGuard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(mockRequest.user).toEqual({
        id: '1',
        isActive: true,
        token: 'valid-token',
        role: 'admin',
      });
    });
  });
});