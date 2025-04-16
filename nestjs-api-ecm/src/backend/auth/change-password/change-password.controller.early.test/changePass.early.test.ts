
import { responseHandler } from 'src/Until/responseUtil';
import { ChangePasswordController } from '../change-password.controller';


// Mock classes
class MockchangePassDTO {
  public oldPassword: string = 'oldPassword123';
  public newPassword: string = 'newPassword123';
}

class MockChangePasswordService {
  changePassword = jest.fn();
}

describe('ChangePasswordController.changePass() changePass method', () => {
  let controller: ChangePasswordController;
  let mockChangePasswordService: MockChangePasswordService;

  beforeEach(() => {
    mockChangePasswordService = new MockChangePasswordService();
    controller = new ChangePasswordController(mockChangePasswordService as any);
  });

  describe('Happy paths', () => {
    it('should successfully change the password', async () => {
      // Arrange
      const userId = 'user123';
      const mockDTO = new MockchangePassDTO();
      jest.mocked(mockChangePasswordService.changePassword).mockResolvedValue(true as any as never);

      // Act
      const result = await controller.changePass(userId, mockDTO as any);

      // Assert
      expect(mockChangePasswordService.changePassword).toHaveBeenCalledWith(userId, mockDTO);
      expect(result).toEqual(responseHandler.ok(true));
    });
  });

  describe('Edge cases', () => {
    it('should handle service throwing an error', async () => {
      // Arrange
      const userId = 'user123';
      const mockDTO = new MockchangePassDTO();
      const errorMessage = 'Service error';
      jest.mocked(mockChangePasswordService.changePassword).mockRejectedValue(new Error(errorMessage) as never);

      // Act
      const result = await controller.changePass(userId, mockDTO as any);

      // Assert
      expect(mockChangePasswordService.changePassword).toHaveBeenCalledWith(userId, mockDTO);
      expect(result).toEqual(responseHandler.error(errorMessage));
    });

    it('should handle invalid user_id', async () => {
      // Arrange
      const userId = '';
      const mockDTO = new MockchangePassDTO();
      jest.mocked(mockChangePasswordService.changePassword).mockResolvedValue(false as any as never);

      // Act
      const result = await controller.changePass(userId, mockDTO as any);

      // Assert
      expect(mockChangePasswordService.changePassword).toHaveBeenCalledWith(userId, mockDTO);
      expect(result).toEqual(responseHandler.ok(false));
    });

    it('should handle invalid DTO', async () => {
      // Arrange
      const userId = 'user123';
      const mockDTO = {} as MockchangePassDTO; // Invalid DTO
      jest.mocked(mockChangePasswordService.changePassword).mockResolvedValue(false as any as never);

      // Act
      const result = await controller.changePass(userId, mockDTO as any);

      // Assert
      expect(mockChangePasswordService.changePassword).toHaveBeenCalledWith(userId, mockDTO);
      expect(result).toEqual(responseHandler.ok(false));
    });
  });
});