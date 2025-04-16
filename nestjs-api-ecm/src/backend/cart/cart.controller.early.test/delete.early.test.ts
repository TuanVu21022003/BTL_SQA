
import { responseHandler } from 'src/Until/responseUtil';
import { CartController } from '../cart.controller';


describe('CartController.delete() delete method', () => {
  let cartController: CartController;
  let mockCartService: MockCartService;

  beforeEach(() => {
    mockCartService = new MockCartService() as any;
    cartController = new CartController(mockCartService as any);
  });

  describe('Happy paths', () => {
    it('should successfully delete products from the cart', async () => {
      // Arrange
      const userId = '123';
      const mockDeleteCartDto = new MockDeleteCartDto() as any;
      mockDeleteCartDto.cart_ids = ['1', '2', '3'];
      jest.mocked(mockCartService.deleteProductsInCart).mockResolvedValue(true as any as never);

      // Act
      const result = await cartController.delete(userId, mockDeleteCartDto);

      // Assert
      expect(mockCartService.deleteProductsInCart).toHaveBeenCalledWith(userId, mockDeleteCartDto.cart_ids);
      expect(result).toEqual(responseHandler.ok(true));
    });
  });

  describe('Edge cases', () => {
    it('should handle empty cart_ids gracefully', async () => {
      // Arrange
      const userId = '123';
      const mockDeleteCartDto = new MockDeleteCartDto() as any;
      mockDeleteCartDto.cart_ids = [];
      jest.mocked(mockCartService.deleteProductsInCart).mockResolvedValue(false as any as never);

      // Act
      const result = await cartController.delete(userId, mockDeleteCartDto);

      // Assert
      expect(mockCartService.deleteProductsInCart).toHaveBeenCalledWith(userId, mockDeleteCartDto.cart_ids);
      expect(result).toEqual(responseHandler.ok(false));
    });

    it('should handle service errors gracefully', async () => {
      // Arrange
      const userId = '123';
      const mockDeleteCartDto = new MockDeleteCartDto() as any;
      mockDeleteCartDto.cart_ids = ['1', '2', '3'];
      const errorMessage = 'Service error';
      jest.mocked(mockCartService.deleteProductsInCart).mockRejectedValue(new Error(errorMessage) as never);

      // Act
      const result = await cartController.delete(userId, mockDeleteCartDto);

      // Assert
      expect(mockCartService.deleteProductsInCart).toHaveBeenCalledWith(userId, mockDeleteCartDto.cart_ids);
      expect(result).toEqual(responseHandler.error(errorMessage));
    });
  });
});

// Mock classes
class MockDeleteCartDto {
  public cart_ids: string[] = [];
}

class MockCartService {
  public deleteProductsInCart = jest.fn();
}