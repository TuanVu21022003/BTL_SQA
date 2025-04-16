
import {
    ExecutionContext,
    UnauthorizedException
} from '@nestjs/common';
import { RolesGuard } from '../Roles.guard';

// Mock classes
class MockReflector {
  get = jest.fn();
}

describe('RolesGuard.canActivate() canActivate method', () => {
  let rolesGuard: RolesGuard;
  let mockReflector: MockReflector;
  let mockExecutionContext: ExecutionContext;

  beforeEach(() => {
    mockReflector = new MockReflector();
    mockExecutionContext = {
      getHandler: jest.fn(), // Thêm mock cho getHandler
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { role: 'admin' }
        }),
      }),
    } as any;

    rolesGuard = new RolesGuard(mockReflector as any);
  });

  // Happy path test
  it('should return true if user has the required role', () => {
    // Arrange
    mockReflector.get.mockReturnValue(['admin']);
    
    // Act
    const result = rolesGuard.canActivate(mockExecutionContext as any);

    // Assert
    expect(result).toBe(true);
    expect(mockReflector.get).toHaveBeenCalledWith('roles', mockExecutionContext.getHandler());
  });

  // Thêm các test case khác nếu cần...
});
