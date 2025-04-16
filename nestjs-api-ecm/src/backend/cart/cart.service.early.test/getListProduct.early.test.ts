
import { CartService } from '../cart.service';


// Mock class for CartRepository
class MockCartRepository {
  findAndCount = jest.fn();
}

describe('CartService.getListProduct() getListProduct method', () => {
  let cartService: CartService;
  let mockCartRepository: MockCartRepository;

  beforeEach(() => {
    mockCartRepository = new MockCartRepository();
    cartService = new CartService(mockCartRepository as any);
  });

  describe('Happy paths', () => {
    it('should return a list of products and total count when user_id is provided', async () => {
      // Arrange
      const filters = { user_id: '123' };
      const mockProducts = [{ id: 1, name: 'Product 1' }];
      const mockTotal = 1;
      jest.mocked(mockCartRepository.findAndCount).mockResolvedValue([mockProducts, mockTotal] as any as never);

      // Act
      const result = await cartService.getListProduct(filters);

      // Assert
      expect(result).toEqual({ cart: mockProducts, total: mockTotal });
      expect(mockCartRepository.findAndCount).toHaveBeenCalledWith({
        where: { user_id: '123' },
        relations: ['product'],
      });
    });
  });

  describe('Edge cases', () => {
    it('should throw an error if no products are found', async () => {
      // Arrange
      const filters = { user_id: '123' };
      jest.mocked(mockCartRepository.findAndCount).mockResolvedValue([null, 0] as any as never);

      // Act & Assert
      await expect(cartService.getListProduct(filters)).rejects.toThrow('No product!');
    });

    it('should handle empty filters gracefully', async () => {
      // Arrange
      const filters = {};
      const mockProducts = [{ id: 1, name: 'Product 1' }];
      const mockTotal = 1;
      jest.mocked(mockCartRepository.findAndCount).mockResolvedValue([mockProducts, mockTotal] as any as never);

      // Act
      const result = await cartService.getListProduct(filters);

      // Assert
      expect(result).toEqual({ cart: mockProducts, total: mockTotal });
      expect(mockCartRepository.findAndCount).toHaveBeenCalledWith({
        where: {},
        relations: ['product'],
      });
    });

    it('should handle unexpected errors from the repository', async () => {
      // Arrange
      const filters = { user_id: '123' };
      jest.mocked(mockCartRepository.findAndCount).mockRejectedValue(new Error('Unexpected error') as never);

      // Act & Assert
      await expect(cartService.getListProduct(filters)).rejects.toThrow('Unexpected error');
    });
  });
});