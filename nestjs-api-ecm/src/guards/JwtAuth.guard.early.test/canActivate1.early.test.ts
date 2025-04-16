
import {
    UnauthorizedException
} from '@nestjs/common';
import { RolesGuard } from '../Roles.guard';

/**
 * Mock class Reflector
 * Mục đích: Giả lập service Reflector để lấy metadata từ decorator
 * Cung cấp method get() để mock việc lấy roles
 */
class MockReflector {
  get = jest.fn();
}

/**
 * Mock class ExecutionContext
 * Mục đích: Giả lập context của request
 * Cung cấp các method cần thiết để truy cập thông tin request
 */
class MockExecutionContext {
  switchToHttp = jest.fn().mockReturnThis();
  getRequest = jest.fn();
  getHandler = jest.fn();
}

/**
 * Mock class Request
 * Mục đích: Giả lập đối tượng request
 * Chứa thông tin user, headers và params
 */
class MockRequest {
  user: any;
  headers: any;
  params: any;
}

describe('RolesGuard.canActivate() canActivate method', () => {
  // Khai báo các biến dùng chung cho test suite
  let rolesGuard: RolesGuard;
  let mockReflector: MockReflector;
  let mockExecutionContext: MockExecutionContext;
  let mockRequest: MockRequest;

  /**
   * Setup trước mỗi test case
   * Khởi tạo các mock object mới để đảm bảo tính độc lập giữa các test
   */
  beforeEach(() => {
    mockReflector = new MockReflector();
    mockExecutionContext = new MockExecutionContext();
    mockRequest = new MockRequest();
    rolesGuard = new RolesGuard(mockReflector as any);

    // Cấu hình mock mặc định
    mockExecutionContext.getHandler.mockReturnValue(() => {});
  });

  /**
   * Test Case ID: TC-ROLES-001
   * Tên test case: Kiểm tra quyền truy cập khi user có role phù hợp
   * Mục tiêu: Verify việc cho phép truy cập khi user có đúng role yêu cầu
   * Input: 
   * - User role: 'admin'
   * - Required roles: ['admin']
   * Expected Output: true (cho phép truy cập)
   * Ghi chú: Happy path - trường hợp cơ bản nhất
   */
  it('should return true if user has the required role', () => {
    // Arrange: Thiết lập mock data
    mockReflector.get.mockReturnValue(['admin']);
    mockRequest.user = { role: 'admin' };
    mockExecutionContext.getRequest.mockReturnValue(mockRequest);

    // Act: Thực thi phương thức cần test
    const result = rolesGuard.canActivate(mockExecutionContext as any);

    // Assert: Kiểm tra kết quả
    expect(result).toBe(true);
  });

  /**
   * Test Case ID: TC-ROLES-002
   * Tên test case: Kiểm tra quyền truy cập khi user không có role yêu cầu
   * Mục tiêu: Verify việc từ chối truy cập khi user không có đủ quyền
   * Input:
   * - User role: 'user'
   * - Required roles: ['admin']
   * Expected Output: UnauthorizedException
   * Ghi chú: Edge case - xử lý trường hợp không đủ quyền
   */
  it('should throw UnauthorizedException if user does not have the required role', () => {
    // Arrange: Thiết lập mock data với role không phù hợp
    mockReflector.get.mockReturnValue(['admin']);
    mockRequest.user = { role: 'user' };
    mockExecutionContext.getRequest.mockReturnValue(mockRequest);

    // Act & Assert: Verify việc throw exception
    expect(() => rolesGuard.canActivate(mockExecutionContext as any))
      .toThrow(UnauthorizedException);
  });

  /**
   * Test Case ID: TC-ROLES-003
   * Tên test case: Kiểm tra quyền truy cập khi không có role nào được yêu cầu
   * Mục tiêu: Verify việc cho phép truy cập khi không có yêu cầu về role
   * Input:
   * - Required roles: undefined
   * Expected Output: true
   * Ghi chú: Edge case - không có role requirement
   */
  it('should return true if no roles are required', () => {
    // Arrange: Thiết lập mock data không có role yêu cầu
    mockReflector.get.mockReturnValue(undefined);
    const result = rolesGuard.canActivate(mockExecutionContext as any);

    // Assert: Verify kết quả
    expect(result).toBe(true);
  });

  /**
   * Test Case ID: TC-ROLES-004
   * Tên test case: Kiểm tra quyền truy cập khi không có thông tin user
   * Mục tiêu: Verify việc xử lý khi không có user trong request
   * Input:
   * - User: undefined
   * - Required roles: ['admin']
   * Expected Output: UnauthorizedException
   * Ghi chú: Edge case - thiếu thông tin user
   */
  it('should throw UnauthorizedException if no user is present in the request', () => {
    // Arrange: Thiết lập mock data không có user
    mockReflector.get.mockReturnValue(['admin']);
    mockRequest.user = undefined;
    mockExecutionContext.getRequest.mockReturnValue(mockRequest);

    // Act & Assert: Verify việc throw exception
    expect(() => rolesGuard.canActivate(mockExecutionContext as any))
      .toThrow(UnauthorizedException);
  });

  /**
   * Test Case ID: TC-ROLES-005
   * Tên test case: Kiểm tra quyền truy cập với nhiều role yêu cầu
   * Mục tiêu: Verify việc xử lý khi có nhiều role được yêu cầu
   * Input:
   * - User role: 'guest'
   * - Required roles: ['admin', 'manager']
   * Expected Output: UnauthorizedException
   * Ghi chú: Edge case - multiple role requirements
   */
  it('should throw UnauthorizedException if user role is not included in the required roles', () => {
    // Arrange: Thiết lập mock data với nhiều role yêu cầu
    mockReflector.get.mockReturnValue(['admin', 'manager']);
    mockRequest.user = { role: 'guest' };
    mockExecutionContext.getRequest.mockReturnValue(mockRequest);

    // Act & Assert: Verify việc throw exception
    expect(() => rolesGuard.canActivate(mockExecutionContext as any))
      .toThrow(UnauthorizedException);
  });
});
