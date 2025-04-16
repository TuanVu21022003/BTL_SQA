
import { Cart_productEntity } from 'src/entities/cartproduct_entity/cart_product.entity';
import { CartService } from '../cart.service';


// Mock class for CartRepository
class MockCartRepository {
  public findOneBy = jest.fn();
}

describe('CartService.detail() detail method', () => {
  let service: CartService;
  let mockCartRepo: MockCartRepository;

  beforeEach(() => {
    mockCartRepo = new MockCartRepository();
    service = new CartService(mockCartRepo as any);
  });

  describe('Happy paths', () => {
  });

  describe('Edge cases', () => {
    it('should return null when no filters are provided', async () => {
      // Arrange
      jest.mocked(mockCartRepo.findOneBy).mockResolvedValue(null as any as never);

      // Act
      const result = await service.detail({});

      // Assert
      expect(mockCartRepo.findOneBy).toHaveBeenCalledWith({});
      expect(result).toBeNull();
    });

    it('should return null when no matching cart product is found', async () => {
      // Arrange
      jest.mocked(mockCartRepo.findOneBy).mockResolvedValue(null as any as never);

      // Act
      const result = await service.detail({ user_id: 999 });

      // Assert
      expect(mockCartRepo.findOneBy).toHaveBeenCalledWith({ user_id: 999 });
      expect(result).toBeNull();
    });

    it('should handle unexpected errors gracefully', async () => {
      // Arrange
      jest.mocked(mockCartRepo.findOneBy).mockRejectedValue(new Error('Unexpected error') as never);

      // Act & Assert
      await expect(service.detail({ user_id: 1 })).rejects.toThrow('Unexpected error');
    });
  });
});