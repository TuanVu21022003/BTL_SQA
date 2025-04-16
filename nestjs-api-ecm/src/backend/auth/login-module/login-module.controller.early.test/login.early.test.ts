
import { responseHandler } from 'src/Until/responseUtil';
import { LoginModuleController } from '../login-module.controller';


describe('LoginModuleController.login() login method', () => {
  let controller: LoginModuleController;
  let mockLoginModuleService: MockLoginModuleService;

  beforeEach(() => {
    mockLoginModuleService = new MockLoginModuleService() as any;
    controller = new LoginModuleController(mockLoginModuleService as any);
  });

  describe('Happy paths', () => {
    it('should return a successful response when login is successful', async () => {
      // Arrange
      const mockLoginDTO = new MockLoginDTO() as any;
      const mockResponseData = { token: 'some-token' };
      jest.mocked(mockLoginModuleService.login).mockResolvedValue(mockResponseData as any);

      // Act
      const result = await controller.login(mockLoginDTO);

      // Assert
      expect(result).toEqual(responseHandler.ok(mockResponseData));
    });
  });

  describe('Edge cases', () => {
    it('should return an error response when login service throws an error', async () => {
      // Arrange
      const mockLoginDTO = new MockLoginDTO() as any;
      const mockError = new Error('Login failed');
      jest.mocked(mockLoginModuleService.login).mockRejectedValue(mockError as never);

      // Act
      const result = await controller.login(mockLoginDTO);

      // Assert
      expect(result).toEqual(responseHandler.error(mockError.message));
    });

    it('should handle non-error objects thrown by the login service', async () => {
      // Arrange
      const mockLoginDTO = new MockLoginDTO() as any;
      const mockError = { message: 'Unexpected error' };
      jest.mocked(mockLoginModuleService.login).mockRejectedValue(mockError as never);

      // Act
      const result = await controller.login(mockLoginDTO);

      // Assert
      expect(result).toEqual(responseHandler.error(JSON.stringify(mockError)));
    });
  });
});

// Mock classes
class MockLoginDTO {
  public username: string = 'testuser';
  public password: string = 'testpassword';
}

class MockLoginModuleService {
  public login = jest.fn();
}