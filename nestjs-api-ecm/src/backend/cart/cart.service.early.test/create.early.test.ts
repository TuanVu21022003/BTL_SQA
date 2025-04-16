
import { BaseService } from 'src/base/baseService/base.service';
import { Cart_productEntity } from 'src/entities/cartproduct_entity/cart_product.entity';
import { CartService } from '../cart.service';


class MockCreateCartDto {
  public product_id: string = 'mock-product-id';
  public user_id: string = 'mock-user-id';
  public quantity: number = 1;
}

class MockCartRepository {
  public findOneBy = jest.fn();
  public save = jest.fn();
}

describe('CartService.create() create method', () => {
  let cartService: CartService;
  let mockCartRepo: MockCartRepository;
  let mockCreateCartDto: MockCreateCartDto;

  beforeEach(() => {
    mockCartRepo = new MockCartRepository() as any;
    cartService = new CartService(mockCartRepo as any);
    mockCreateCartDto = new MockCreateCartDto() as any;
  });

  describe('Happy paths', () => {
    it('should update the quantity if the product already exists in the cart', async () => {
      // Arrange
      const existingProduct = { id: 'existing-id', quantity: 2 } as Cart_productEntity;
      jest.mocked(mockCartRepo.findOneBy).mockResolvedValue(existingProduct as any as never);
      jest.spyOn(BaseService.prototype, 'update').mockResolvedValue(existingProduct as any as never);

      // Act
      const result = await cartService.create(mockCreateCartDto as any);

      // Assert
      expect(mockCartRepo.findOneBy).toHaveBeenCalledWith({
        product_id: mockCreateCartDto.product_id,
        user_id: mockCreateCartDto.user_id,
      });
      expect(BaseService.prototype.update).toHaveBeenCalledWith(existingProduct, existingProduct.id);
      expect(result).toEqual(existingProduct);
    });

    it('should create a new cart product if it does not exist', async () => {
      // Arrange
      jest.mocked(mockCartRepo.findOneBy).mockResolvedValue(null as any as never);
      const newCartProduct = { id: 'new-id', ...mockCreateCartDto } as Cart_productEntity;
      jest.spyOn(BaseService.prototype, 'create').mockResolvedValue(newCartProduct as any as never);

      // Act
      const result = await cartService.create(mockCreateCartDto as any);

      // Assert
      expect(mockCartRepo.findOneBy).toHaveBeenCalledWith({
        product_id: mockCreateCartDto.product_id,
        user_id: mockCreateCartDto.user_id,
      });
      expect(BaseService.prototype.create).toHaveBeenCalledWith(mockCreateCartDto, {
        product_id: mockCreateCartDto.product_id,
        user_id: mockCreateCartDto.user_id,
      });
      expect(result).toEqual(newCartProduct);
    });
  });

  describe('Edge cases', () => {
    it('should handle errors when updating an existing product', async () => {
      // Arrange
      const existingProduct = { id: 'existing-id', quantity: 2 } as Cart_productEntity;
      jest.mocked(mockCartRepo.findOneBy).mockResolvedValue(existingProduct as any as never);
      jest.spyOn(BaseService.prototype, 'update').mockRejectedValue(new Error('Update failed') as never);

      // Act & Assert
      await expect(cartService.create(mockCreateCartDto as any)).rejects.toThrow('Update failed');
    });

    it('should handle errors when creating a new product', async () => {
      // Arrange
      jest.mocked(mockCartRepo.findOneBy).mockResolvedValue(null as any as never);
      jest.spyOn(BaseService.prototype, 'create').mockRejectedValue(new Error('Create failed') as never);

      // Act & Assert
      await expect(cartService.create(mockCreateCartDto as any)).rejects.toThrow('Create failed');
    });
  });
});