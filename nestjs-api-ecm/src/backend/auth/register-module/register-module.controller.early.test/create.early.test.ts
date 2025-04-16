
import { responseHandler } from 'src/Until/responseUtil';
import { RegisterModuleController } from '../register-module.controller';


// Mock classes
class MockCreateUserDto {
  public email: string = 'test@example.com';
  public password: string = 'password123';
}

class MockRegisterModuleService {
  create = jest.fn();
}

describe('RegisterModuleController.create() create method', () => {
  let controller: RegisterModuleController;
  let mockRegisterModuleService: MockRegisterModuleService;

  beforeEach(() => {
    mockRegisterModuleService = new MockRegisterModuleService() as any;
    controller = new RegisterModuleController(mockRegisterModuleService as any);
  });

  describe('Happy paths', () => {
    it('should return a successful response when user is created', async () => {
      // Arrange
      const mockCreateUserDto = new MockCreateUserDto() as any;
      const expectedEmail = 'test@example.com';
      jest.mocked(mockRegisterModuleService.create).mockResolvedValue(expectedEmail as any as never);

      // Act
      const result = await controller.create(mockCreateUserDto);

      // Assert
      expect(mockRegisterModuleService.create).toHaveBeenCalledWith(mockCreateUserDto);
      expect(result).toEqual(responseHandler.ok(expectedEmail));
    });
  });

  describe('Edge cases', () => {
    it('should return an error response when service throws an error', async () => {
      // Arrange
      const mockCreateUserDto = new MockCreateUserDto() as any;
      const errorMessage = 'Service error';
      jest.mocked(mockRegisterModuleService.create).mockRejectedValue(new Error(errorMessage) as never);

      // Act
      const result = await controller.create(mockCreateUserDto);

      // Assert
      expect(mockRegisterModuleService.create).toHaveBeenCalledWith(mockCreateUserDto);
      expect(result).toEqual(responseHandler.error(errorMessage));
    });

    it('should handle non-error objects thrown by the service', async () => {
      // Arrange
      const mockCreateUserDto = new MockCreateUserDto() as any;
      const errorObject = { message: 'Non-error object' };
      jest.mocked(mockRegisterModuleService.create).mockRejectedValue(errorObject as never);

      // Act
      const result = await controller.create(mockCreateUserDto);

      // Assert
      expect(mockRegisterModuleService.create).toHaveBeenCalledWith(mockCreateUserDto);
      expect(result).toEqual(responseHandler.error(JSON.stringify(errorObject)));
    });
  });
});