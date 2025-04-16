
import { CartService } from '../cart.service';


class MockCartRepository {
  public findAndCount = jest.fn().mockResolvedValue([[], 0] as any as never);
}

describe('CartService.getList() getList method', () => {
  let cartService: CartService;
  let mockCartRepository: MockCartRepository;

  beforeEach(() => {
    mockCartRepository = new MockCartRepository();
    cartService = new CartService(mockCartRepository as any);
  });

  describe('Happy Paths', () => {
    it('should return a list of cart products with pagination', async () => {
      // Arrange
      const mockData = [{ id: 1 }, { id: 2 }];
      const total = 2;
      jest.mocked(mockCartRepository.findAndCount).mockResolvedValue([mockData, total] as any as never);

      // Act
      const result = await cartService.getList(1, 2);

      // Assert
      expect(result).toEqual({
        data: mockData,
        total,
        page: 1,
        limit: 2,
      });
      expect(mockCartRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 2,
      });
    });
  });

  describe('Edge Cases', () => {
    it('should throw an error if page number is less than 1', async () => {
      // Arrange
      const invalidPage = 0;

      // Act & Assert
      await expect(cartService.getList(invalidPage, 10)).rejects.toThrow('PAGE NUMBER MUST BE GREATER THAN 0!');
    });

    it('should throw an error if limit is less than 1', async () => {
      // Arrange
      const invalidLimit = 0;

      // Act & Assert
      await expect(cartService.getList(1, invalidLimit)).rejects.toThrow('LIMIT MUST BE GREATER THAN 0!');
    });

    it('should throw an error if no cart products are found', async () => {
      // Arrange
      jest.mocked(mockCartRepository.findAndCount).mockResolvedValue([null, 0] as any as never);

      // Act & Assert
      await expect(cartService.getList(1, 10)).rejects.toThrow('NO cart!');
    });
  });
});