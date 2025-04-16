
import { ApplyStatus, OrderStatus, PaymentStatus } from "src/share/Enum/Enum";
import { OrderRepository } from '../OrderRepository';

// Mock DataSource class
class MockDataSource {
  manager = {
    createQueryBuilder: jest.fn(),
  };
  getMetadata: jest.Mock;
  constructor() {
    this.getMetadata = jest.fn().mockReturnValue({
      name: 'Order',
      tableName: 'orders',
      columns: [],
      relations: []
    });
  }
}

describe('OrderRepository.getRevenueByCategory() getRevenueByCategory method', () => {
  let orderRepository: OrderRepository;
  let mockDataSource: MockDataSource;

  beforeEach(() => {
    mockDataSource = new MockDataSource();
    orderRepository = new OrderRepository(mockDataSource as any);
    // Mock createQueryBuilder directly on repository
    (orderRepository as any).createQueryBuilder = jest.fn().mockReturnThis();
    (orderRepository as any).select = jest.fn().mockReturnThis();
    (orderRepository as any).addSelect = jest.fn().mockReturnThis();
    (orderRepository as any).innerJoin = jest.fn().mockReturnThis();
    (orderRepository as any).where = jest.fn().mockReturnThis();
    (orderRepository as any).andWhere = jest.fn().mockReturnThis();
    (orderRepository as any).groupBy = jest.fn().mockReturnThis();
    (orderRepository as any).orderBy = jest.fn().mockReturnThis();
  });

  describe('Happy paths', () => {
    it('should return revenue by category for valid date range and statuses', async () => {
      // Arrange
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');
      
      (orderRepository as any).getRawMany = jest.fn().mockResolvedValue([
        { categoryId: 1, categoryName: 'Electronics', totalRevenue: '1000.00' },
        { categoryId: 2, categoryName: 'Books', totalRevenue: '500.00' },
      ]);

      // Act
      const result = await orderRepository.getRevenueByCategory(startDate, endDate);

      // Assert
      expect(result).toEqual([
        { categoryId: 1, categoryName: 'Electronics', revenue: 1000.00 },
        { categoryId: 2, categoryName: 'Books', revenue: 500.00 },
      ]);
      expect((orderRepository as any).select).toHaveBeenCalledWith('category.id', 'categoryId');
      expect((orderRepository as any).addSelect).toHaveBeenCalledWith('category.name', 'categoryName');
      expect((orderRepository as any).addSelect).toHaveBeenCalledWith('SUM(order.total_price)', 'totalRevenue');
      expect((orderRepository as any).innerJoin).toHaveBeenCalledWith('order.orderProducts', 'order_product');
      expect((orderRepository as any).innerJoin).toHaveBeenCalledWith('order_product.product', 'product');
      expect((orderRepository as any).innerJoin).toHaveBeenCalledWith('product.category', 'category');
      expect((orderRepository as any).where).toHaveBeenCalledWith('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
      expect((orderRepository as any).andWhere).toHaveBeenCalledWith('order.paymentStatus = :paymentStatus', { paymentStatus: PaymentStatus.Paid });
      expect((orderRepository as any).andWhere).toHaveBeenCalledWith('order.orderStatus = :orderStatus', { orderStatus: OrderStatus.Delivered });
      expect((orderRepository as any).andWhere).toHaveBeenCalledWith('category.status = :status', { status: ApplyStatus.True });
      expect((orderRepository as any).groupBy).toHaveBeenCalledWith('category.id');
      expect((orderRepository as any).orderBy).toHaveBeenCalledWith('totalRevenue', 'DESC');
    });
  });

  describe('Edge cases', () => {
    it('should return an empty array if no orders match the criteria', async () => {
      // Arrange
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');
      
      (orderRepository as any).getRawMany = jest.fn().mockResolvedValue([]);

      // Act
      const result = await orderRepository.getRevenueByCategory(startDate, endDate);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle invalid date range gracefully', async () => {
      // Arrange
      const startDate = new Date('2023-12-31');
      const endDate = new Date('2023-01-01');
      
      (orderRepository as any).getRawMany = jest.fn().mockResolvedValue([]);

      // Act
      const result = await orderRepository.getRevenueByCategory(startDate, endDate);

      // Assert
      expect(result).toEqual([]);
    });
  });
});
