
import { In } from "typeorm";
import { CartService } from '../cart.service';




class MockCartRepository {
  public delete = jest.fn();
}

describe('CartService.deleteProductsInCart() deleteProductsInCart method', () => {
  let cartService: CartService;
  let mockCartRepository: MockCartRepository;

  beforeEach(() => {
    mockCartRepository = new MockCartRepository();
    cartService = new CartService(mockCartRepository as any);
  });

  describe('Happy paths', () => {
    it('should delete products in cart successfully', async () => {
      // Arrange
      const userId = 'user123';
      const cartIds = ['cart1', 'cart2'];
      const mockDeleteResult = { affected: 2 };
      jest.mocked(mockCartRepository.delete).mockResolvedValue(mockDeleteResult as any as never);

      // Act
      const result = await cartService.deleteProductsInCart(userId, cartIds);

      // Assert
      expect(mockCartRepository.delete).toHaveBeenCalledWith({
        id: In(cartIds),
        user_id: userId,
      });
      expect(result).toEqual(mockDeleteResult);
    });
  });

  describe('Edge cases', () => {
    it('should throw an error if cart_ids is empty', async () => {
      // Arrange
      const userId = 'user123';
      const cartIds: string[] = [];

      // Act & Assert
      await expect(cartService.deleteProductsInCart(userId, cartIds)).rejects.toThrow('cart_ids cannot be empty');
    });

    it('should throw an error if no records were deleted', async () => {
      // Arrange
      const userId = 'user123';
      const cartIds = ['cart1', 'cart2'];
      const mockDeleteResult = { affected: 0 };
      jest.mocked(mockCartRepository.delete).mockResolvedValue(mockDeleteResult as any as never);

      // Act & Assert
      await expect(cartService.deleteProductsInCart(userId, cartIds)).rejects.toThrow('No records were deleted. Check cart_ids.');
    });

    it('should throw a generic error if delete operation fails', async () => {
      // Arrange
      const userId = 'user123';
      const cartIds = ['cart1', 'cart2'];
      jest.mocked(mockCartRepository.delete).mockRejectedValue(new Error('Database error') as never);

      // Act & Assert
      await expect(cartService.deleteProductsInCart(userId, cartIds)).rejects.toThrow('Failed to delete products in cart');
    });
  });
});