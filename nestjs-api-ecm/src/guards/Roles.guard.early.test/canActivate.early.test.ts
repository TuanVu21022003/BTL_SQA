
import {
    UnauthorizedException
} from '@nestjs/common';
import { RolesGuard } from '../Roles.guard';

// Mock classes to simulate dependencies
class MockReflector {
  get = jest.fn();
}

class MockExecutionContext {
  switchToHttp = jest.fn().mockReturnThis();
  getRequest = jest.fn();
  getHandler = jest.fn(); // Thêm mock cho getHandler
}

class MockRequest {
  user: any;
  headers: any;
  params: any;
}

// Test suite for canActivate method
describe('RolesGuard.canActivate() canActivate method', () => {
  let rolesGuard: RolesGuard;
  let mockReflector: MockReflector;
  let mockExecutionContext: MockExecutionContext;
  let mockRequest: MockRequest;

  beforeEach(() => {
    mockReflector = new MockReflector();
    mockExecutionContext = new MockExecutionContext();
    mockRequest = new MockRequest();
    rolesGuard = new RolesGuard(mockReflector as any);

    // Setup default mock behavior
    mockExecutionContext.getHandler.mockReturnValue(() => {}); // Mock getHandler để trả về một function
  });

  // Happy path: User has the required role
  it('should return true if user has the required role', () => {
    mockReflector.get.mockReturnValue(['admin']);
    mockRequest.user = { role: 'admin' };
    mockExecutionContext.getRequest.mockReturnValue(mockRequest);

    const result = rolesGuard.canActivate(mockExecutionContext as any);

    expect(result).toBe(true);
  });

  // Happy path: No roles required
  it('should return true if no roles are required', () => {
    mockReflector.get.mockReturnValue(undefined);
    const result = rolesGuard.canActivate(mockExecutionContext as any);

    expect(result).toBe(true);
  });

  // Edge case: User does not have the required role
  it('should throw UnauthorizedException if user does not have the required role', () => {
    mockReflector.get.mockReturnValue(['admin']);
    mockRequest.user = { role: 'user' };
    mockExecutionContext.getRequest.mockReturnValue(mockRequest);

    expect(() => rolesGuard.canActivate(mockExecutionContext as any)).toThrow(
      UnauthorizedException
    );
  });

  // Edge case: No user in request
  it('should throw UnauthorizedException if no user is present in the request', () => {
    mockReflector.get.mockReturnValue(['admin']);
    mockRequest.user = undefined;
    mockExecutionContext.getRequest.mockReturnValue(mockRequest);

    expect(() => rolesGuard.canActivate(mockExecutionContext as any)).toThrow(
      UnauthorizedException
    );
  });

  // Edge case: User role is not included in the required roles
  it('should throw UnauthorizedException if user role is not included in the required roles', () => {
    mockReflector.get.mockReturnValue(['admin', 'manager']);
    mockRequest.user = { role: 'guest' };
    mockExecutionContext.getRequest.mockReturnValue(mockRequest);

    expect(() => rolesGuard.canActivate(mockExecutionContext as any)).toThrow(
      UnauthorizedException
    );
  });
});
