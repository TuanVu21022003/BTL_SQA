
import { responseHandler } from 'src/Until/responseUtil';
import { CartController } from '../cart.controller';


class MockCartService {
  public getList = jest.fn();
}

describe('CartController.getListCart() getListCart method', () => {
  let cartController: CartController;
  let mockCartService: MockCartService;

  beforeEach(() => {
    mockCartService = new MockCartService() as any;
    cartController = new CartController(mockCartService as any);
  });

  describe('Happy paths', () => {
    it('should return a list of carts successfully', async () => {
      // Arrange
      const mockCarts = [{ id: 1, name: 'Cart 1' }, { id: 2, name: 'Cart 2' }];
      jest.mocked(mockCartService.getList).mockResolvedValue(mockCarts as any as never);

      // Act
      const result = await cartController.getListCart(1, 10);

      // Assert
      expect(result).toEqual(responseHandler.ok(mockCarts));
      expect(mockCartService.getList).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('Edge cases', () => {
    it('should handle service errors gracefully', async () => {
      // Arrange
      const errorMessage = 'Service error';
      jest.mocked(mockCartService.getList).mockRejectedValue(new Error(errorMessage) as never);

      // Act
      const result = await cartController.getListCart(1, 10);

      // Assert
      expect(result).toEqual(responseHandler.error(errorMessage));
      expect(mockCartService.getList).toHaveBeenCalledWith(1, 10);
    });

    it('should handle non-error exceptions gracefully', async () => {
      // Arrange
      const errorObject = { message: 'Unexpected error' };
      jest.mocked(mockCartService.getList).mockRejectedValue(errorObject as never);

      // Act
      const result = await cartController.getListCart(1, 10);

      // Assert
      expect(result).toEqual(responseHandler.error(JSON.stringify(errorObject)));
      expect(mockCartService.getList).toHaveBeenCalledWith(1, 10);
    });
  });
});