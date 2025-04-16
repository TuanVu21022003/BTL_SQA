
import { responseHandler } from 'src/Until/responseUtil';
import { LogoutController } from '../logout.controller';


// Mock classes
class MockLogoutService {
  public logout = jest.fn();
}

class MocklogoutDTO {
  public someProperty: string = 'someValue';
}

describe('LogoutController.logout() logout method', () => {
  let logoutController: LogoutController;
  let mockLogoutService: MockLogoutService;
  let mockLogoutDTO: MocklogoutDTO;

  beforeEach(() => {
    mockLogoutService = new MockLogoutService() as any;
    mockLogoutDTO = new MocklogoutDTO() as any;
    logoutController = new LogoutController(mockLogoutService as any);
  });

  describe('Happy paths', () => {
    it('should successfully logout a user', async () => {
      // Arrange
      const userId = '123';
      jest.mocked(mockLogoutService.logout).mockResolvedValue(true as any as never);

      // Act
      const result = await logoutController.logout(userId, mockLogoutDTO as any);

      // Assert
      expect(mockLogoutService.logout).toHaveBeenCalledWith(userId, mockLogoutDTO);
      expect(result).toEqual(responseHandler.ok(true));
    });
  });

  describe('Edge cases', () => {
    it('should handle service throwing an error', async () => {
      // Arrange
      const userId = '123';
      const errorMessage = 'Service error';
      jest.mocked(mockLogoutService.logout).mockRejectedValue(new Error(errorMessage) as never);

      // Act
      const result = await logoutController.logout(userId, mockLogoutDTO as any);

      // Assert
      expect(mockLogoutService.logout).toHaveBeenCalledWith(userId, mockLogoutDTO);
      expect(result).toEqual(responseHandler.error(errorMessage));
    });

    it('should handle non-error object thrown by service', async () => {
      // Arrange
      const userId = '123';
      const errorObject = { message: 'Non-error object' };
      jest.mocked(mockLogoutService.logout).mockRejectedValue(errorObject as never);

      // Act
      const result = await logoutController.logout(userId, mockLogoutDTO as any);

      // Assert
      expect(mockLogoutService.logout).toHaveBeenCalledWith(userId, mockLogoutDTO);
      expect(result).toEqual(responseHandler.error(JSON.stringify(errorObject)));
    });
  });
});