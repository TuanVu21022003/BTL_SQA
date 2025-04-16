
import { responseHandler } from 'src/Until/responseUtil';
import { CartController } from '../cart.controller';


// Mock classes
class MockUpdateCartDto {
  public id: string = 'mock-id';
  // Add other properties as needed
}

class MockCartService {
  update = jest.fn();
}

describe('CartController.update() update method', () => {
  let cartController: CartController;
  let mockCartService: MockCartService;
  let mockUpdateCartDto: MockUpdateCartDto;

  beforeEach(() => {
    mockCartService = new MockCartService() as any;
    cartController = new CartController(mockCartService as any);
    mockUpdateCartDto = new MockUpdateCartDto() as any;
  });

  describe('Happy paths', () => {
    it('should update the cart successfully', async () => {
      // Arrange
      const expectedResponse = { success: true };
      jest.mocked(mockCartService.update).mockResolvedValue(expectedResponse as any as never);

      // Act
      const result = await cartController.update(mockUpdateCartDto as any);

      // Assert
      expect(mockCartService.update).toHaveBeenCalledWith(mockUpdateCartDto as any, mockUpdateCartDto.id);
      expect(result).toEqual(responseHandler.ok(expectedResponse));
    });
  });

  describe('Edge cases', () => {
    it('should handle service update failure gracefully', async () => {
      // Arrange
      const errorMessage = 'Update failed';
      jest.mocked(mockCartService.update).mockRejectedValue(new Error(errorMessage) as never);

      // Act
      const result = await cartController.update(mockUpdateCartDto as any);

      // Assert
      expect(mockCartService.update).toHaveBeenCalledWith(mockUpdateCartDto as any, mockUpdateCartDto.id);
      expect(result).toEqual(responseHandler.error(errorMessage));
    });

    it('should handle non-error exceptions gracefully', async () => {
      // Arrange
      const errorObject = { message: 'Unexpected error' };
      jest.mocked(mockCartService.update).mockRejectedValue(errorObject as never);

      // Act
      const result = await cartController.update(mockUpdateCartDto as any);

      // Assert
      expect(mockCartService.update).toHaveBeenCalledWith(mockUpdateCartDto as any, mockUpdateCartDto.id);
      expect(result).toEqual(responseHandler.error(JSON.stringify(errorObject)));
    });
  });
});