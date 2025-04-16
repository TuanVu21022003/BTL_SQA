
import { responseHandler } from 'src/Until/responseUtil';
import { CartController } from '../cart.controller';


// Mock class for CartService
class MockCartService {
  public getListProduct = jest.fn();
}

describe('CartController.getAllProductInCart() getAllProductInCart method', () => {
  let cartController: CartController;
  let mockCartService: MockCartService;

  beforeEach(() => {
    mockCartService = new MockCartService() as any;
    cartController = new CartController(mockCartService as any);
  });

  describe('Happy paths', () => {
    it('should return all products in the cart for a valid user', async () => {
      // Arrange
      const userId = '123';
      const mockProducts = [{ id: '1', name: 'Product 1' }, { id: '2', name: 'Product 2' }];
      jest.mocked(mockCartService.getListProduct).mockResolvedValue(mockProducts as any as never);

      // Act
      const result = await cartController.getAllProductInCart(userId);

      // Assert
      expect(mockCartService.getListProduct).toHaveBeenCalledWith({ user_id: userId });
      expect(result).toEqual(responseHandler.ok(mockProducts));
    });
  });

  describe('Edge cases', () => {
    it('should handle the case where no products are found for the user', async () => {
      // Arrange
      const userId = '123';
      jest.mocked(mockCartService.getListProduct).mockResolvedValue([] as any as never);

      // Act
      const result = await cartController.getAllProductInCart(userId);

      // Assert
      expect(mockCartService.getListProduct).toHaveBeenCalledWith({ user_id: userId });
      expect(result).toEqual(responseHandler.ok([]));
    });

    it('should handle errors thrown by the cart service', async () => {
      // Arrange
      const userId = '123';
      const errorMessage = 'Service error';
      jest.mocked(mockCartService.getListProduct).mockRejectedValue(new Error(errorMessage) as never);

      // Act
      const result = await cartController.getAllProductInCart(userId);

      // Assert
      expect(mockCartService.getListProduct).toHaveBeenCalledWith({ user_id: userId });
      expect(result).toEqual(responseHandler.error(errorMessage));
    });

    it('should handle non-error objects thrown by the cart service', async () => {
      // Arrange
      const userId = '123';
      const errorObject = { message: 'Non-error object' };
      jest.mocked(mockCartService.getListProduct).mockRejectedValue(errorObject as never);

      // Act
      const result = await cartController.getAllProductInCart(userId);

      // Assert
      expect(mockCartService.getListProduct).toHaveBeenCalledWith({ user_id: userId });
      expect(result).toEqual(responseHandler.error(JSON.stringify(errorObject)));
    });
  });
});