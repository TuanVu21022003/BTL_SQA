
import { responseHandler } from 'src/Until/responseUtil';
import { CartController } from '../cart.controller';


describe('CartController.addToCart() addToCart method', () => {
  let cartController: CartController;
  let mockCartService: MockCartService;

  beforeEach(() => {
    mockCartService = new MockCartService() as any;
    cartController = new CartController(mockCartService as any);
  });

  describe('Happy Paths', () => {
    it('should successfully add an item to the cart', async () => {
      // Arrange
      const userId = '123';
      const mockCreateCartDto = new MockCreateCartDto() as any;
      const mockResponse = { success: true, data: 'Item added' };
      jest.mocked(mockCartService.create).mockResolvedValue(mockResponse as any);

      // Act
      const result = await cartController.addToCart(userId, mockCreateCartDto);

      // Assert
      expect(mockCartService.create).toHaveBeenCalledWith(mockCreateCartDto);
      expect(result).toEqual(responseHandler.ok(mockResponse));
    });
  });

  describe('Edge Cases', () => {
    it('should handle service errors gracefully', async () => {
      // Arrange
      const userId = '123';
      const mockCreateCartDto = new MockCreateCartDto() as any;
      const errorMessage = 'Service error';
      jest.mocked(mockCartService.create).mockRejectedValue(new Error(errorMessage) as never);

      // Act
      const result = await cartController.addToCart(userId, mockCreateCartDto);

      // Assert
      expect(mockCartService.create).toHaveBeenCalledWith(mockCreateCartDto);
      expect(result).toEqual(responseHandler.error(errorMessage));
    });

    it('should handle non-error exceptions gracefully', async () => {
      // Arrange
      const userId = '123';
      const mockCreateCartDto = new MockCreateCartDto() as any;
      const errorObject = { message: 'Unexpected error' };
      jest.mocked(mockCartService.create).mockRejectedValue(errorObject as never);

      // Act
      const result = await cartController.addToCart(userId, mockCreateCartDto);

      // Assert
      expect(mockCartService.create).toHaveBeenCalledWith(mockCreateCartDto);
      expect(result).toEqual(responseHandler.error(JSON.stringify(errorObject)));
    });
  });
});

// mocks/MockCreateCartDto.ts
export class MockCreateCartDto {
  public productId: string = 'product-123';
  public quantity: number = 1;
}

// mocks/MockCartService.ts
export class MockCartService {
  public create = jest.fn();
}