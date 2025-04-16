
import { OrderStatus, PaymentStatus } from "src/share/Enum/Enum";
import { OrderProductRepository } from '../OrderProductRepository';
import { DataSource } from 'typeorm';

describe('OrderProductRepository.getTopProductsByRevenue() getTopProductsByRevenue method', () => {
  let repository: OrderProductRepository;
  let mockQueryBuilder: any;

  beforeEach(() => {
    // Create mock query builder
    mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
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
    it('should return top products by revenue within the given date range', async () => {
      // Arrange
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');
      mockQueryBuilder.getRawMany.mockResolvedValue([
        {
          productId: 1,
          productName: 'Product A',
          priceout: 100,
          totalRevenue: '1000',
        },
        {
          productId: 2,
          productName: 'Product B',
          priceout: 200,
          totalRevenue: '2000',
        },
      ]);

      // Act
      const result = await repository.getTopProductsByRevenue(startDate, endDate);

      // Assert
      expect(result).toEqual([
        {
          productId: 1,
          productName: 'Product A',
          priceout: 100,
          revenue: 1000,
        },
        {
          productId: 2,
          productName: 'Product B',
          priceout: 200,
          revenue: 2000,
        },
      ]);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('order.paymentStatus = :status', { status: PaymentStatus.Paid });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('order.orderStatus = :orderStatus', { orderStatus: OrderStatus.Delivered });
    });
  });

  describe('Edge cases', () => {
    it('should return an empty array if no products are found within the date range', async () => {
      // Arrange
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      // Act
      const result = await repository.getTopProductsByRevenue(startDate, endDate);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle cases where totalRevenue is not a number', async () => {
      // Arrange
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');
      mockQueryBuilder.getRawMany.mockResolvedValue([
        {
          productId: 1,
          productName: 'Product A',
          priceout: 100,
          totalRevenue: 'not-a-number',
        },
      ]);

      // Act
      const result = await repository.getTopProductsByRevenue(startDate, endDate);

      // Assert
      expect(result).toEqual([
        {
          productId: 1,
          productName: 'Product A',
          priceout: 100,
          revenue: NaN,
        },
      ]);
    });
  });
});
