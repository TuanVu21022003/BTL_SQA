import { responseHandler } from 'src/Until/responseUtil';
import { RegisterModuleController } from '../register-module.controller';

// Mock service
class MockRegisterModuleService {
  update = jest.fn();
}

// Đúng theo DTO thực tế: VerifyDto thường gồm email và otp
class MockVerifyDto {
  public email: string = 'test@example.com';
  public otp: string = '123456';
}

describe('RegisterModuleController.update() update method', () => {
  let controller: RegisterModuleController;
  let mockRegisterModuleService: MockRegisterModuleService;

  beforeEach(() => {
    mockRegisterModuleService = new MockRegisterModuleService();
    controller = new RegisterModuleController(mockRegisterModuleService as any);
  });

  describe('Happy paths', () => {
    it('should successfully update with valid data', async () => {
      // Arrange
      const mockVerifyDto = new MockVerifyDto();
      const expectedResponse = { success: true };
      mockRegisterModuleService.update.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.update(mockVerifyDto);

      // Assert
      expect(mockRegisterModuleService.update).toHaveBeenCalledWith(mockVerifyDto);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('Edge cases', () => {
    it('should handle service throwing an error gracefully', async () => {
      // Arrange
      const mockVerifyDto = new MockVerifyDto();
      const errorMessage = 'Service error';
      mockRegisterModuleService.update.mockRejectedValue(new Error(errorMessage));

      // Act
      const result = await controller.update(mockVerifyDto);

      // Assert
      expect(mockRegisterModuleService.update).toHaveBeenCalledWith(mockVerifyDto);
      expect(result).toEqual(responseHandler.error(errorMessage));
    });

    it('should handle empty input gracefully', async () => {
      // Arrange
      const mockVerifyDto = {} as any;
      const expectedResponse = { success: false, message: 'Invalid input' };
      mockRegisterModuleService.update.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.update(mockVerifyDto);

      // Assert
      expect(mockRegisterModuleService.update).toHaveBeenCalledWith(mockVerifyDto);
      expect(result).toEqual(expectedResponse);
    });
  });
});
