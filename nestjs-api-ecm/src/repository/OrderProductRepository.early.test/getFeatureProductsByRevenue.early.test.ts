
import { OrderProductRepository } from '../OrderProductRepository';
import { DataSource } from 'typeorm';
import { PaymentStatus, OrderStatus } from 'src/share/Enum/Enum';

describe('OrderProductRepository.getFeatureProductsByRevenue() getFeatureProductsByRevenue method', () => {
  let repository: OrderProductRepository;
  let mockQueryBuilder: any;

  beforeEach(() => {
    // Create mock query builder
    mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getRawMany: jest.fn()
    };

    // Create mock DataSource
    const mockDataSource = {
      createQueryBuilder: jest.fn(),
      manager: {},
    } as unknown as DataSource;

    // Create repository instance
    repository = new OrderProductRepository(mockDataSource);

    // Mock createQueryBuilder method on repository instance
    jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder);
  });

  describe('Happy paths', () => {
    it('should return the top 5 products by revenue', async () => {
      // Arrange
      const mockProducts = [
        {
          productId: 1,
          productName: 'Product A',
          productImage: 'imageA.jpg',
          priceout: 100,
          categoryName: 'Category A',
          totalRevenue: 1000,
        },
        {
          productId: 2,
          productName: 'Product B',
          productImage: 'imageB.jpg',
          priceout: 200,
          categoryName: 'Category B',
          totalRevenue: 800,
        },
      ];
      mockQueryBuilder.getRawMany.mockResolvedValue(mockProducts);

      // Act
      const result = await repository.getFeatureProductsByRevenue();

      // Assert
      expect(result).toEqual([
        {
          productId: 1,
          productName: 'Product A',
          productImage: 'imageA.jpg',
          priceout: 100,
          categoryName: 'Category A',
        },
        {
          productId: 2,
          productName: 'Product B',
          productImage: 'imageB.jpg',
          priceout: 200,
          categoryName: 'Category B',
        },
      ]);

      // Verify query builder calls
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('order_product.product_id', 'productId');
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith('product.name', 'productName');
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith('product.url_images', 'productImage');
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith('product.priceout', 'priceout');
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith('category.name', 'categoryName');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('order.paymentStatus = :status', { status: PaymentStatus.Paid });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('order.orderStatus = :orderStatus', { orderStatus: OrderStatus.Delivered });
    });
  });

  describe('Edge cases', () => {
    it('should return an empty array if no products meet the criteria', async () => {
      // Arrange
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      // Act
      const result = await repository.getFeatureProductsByRevenue();

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle errors gracefully', async () => {
      // Arrange
      mockQueryBuilder.getRawMany.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(repository.getFeatureProductsByRevenue()).rejects.toThrow('Database error');
    });
  });
});
