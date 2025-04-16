
import { OrderStatus, PaymentStatus } from "src/share/Enum/Enum";
import { OrderRepository } from '../OrderRepository';

// Mock classes
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

describe('OrderRepository.getTopCustomersByRevenue() getTopCustomersByRevenue method', () => {
  let orderRepository: OrderRepository;
  let mockDataSource: MockDataSource;

  beforeEach(() => {
    mockDataSource = new MockDataSource();
    orderRepository = new OrderRepository(mockDataSource as any);
    // Mock createQueryBuilder và các phương thức liên quan
    (orderRepository as any).createQueryBuilder = jest.fn().mockReturnThis();
    (orderRepository as any).select = jest.fn().mockReturnThis();
    (orderRepository as any).addSelect = jest.fn().mockReturnThis();
    (orderRepository as any).innerJoin = jest.fn().mockReturnThis();
    (orderRepository as any).where = jest.fn().mockReturnThis();
    (orderRepository as any).andWhere = jest.fn().mockReturnThis();
    (orderRepository as any).groupBy = jest.fn().mockReturnThis();
    (orderRepository as any).orderBy = jest.fn().mockReturnThis();
    (orderRepository as any).limit = jest.fn().mockReturnThis();
  });

  describe('Happy paths', () => {
    it('should return top customers by revenue within the given date range', async () => {
      // Arrange
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');
      
      (orderRepository as any).getRawMany = jest.fn().mockResolvedValue([
        { userId: 1, userName: 'John Doe', totalRevenue: '1000.00' },
        { userId: 2, userName: 'Jane Smith', totalRevenue: '800.00' },
      ]);

      // Act
      const result = await orderRepository.getTopCustomersByRevenue(startDate, endDate);

      // Assert
      expect(result).toEqual([
        { userId: 1, userName: 'John Doe', revenue: 1000.00 },
        { userId: 2, userName: 'Jane Smith', revenue: 800.00 },
      ]);
      expect((orderRepository as any).select).toHaveBeenCalledWith('orders.user_id', 'userId');
      expect((orderRepository as any).addSelect).toHaveBeenCalledWith('CONCAT(user.firstName, " ", user.lastName)', 'userName');
      expect((orderRepository as any).addSelect).toHaveBeenCalledWith('SUM(orders.total_price)', 'totalRevenue');
      expect((orderRepository as any).innerJoin).toHaveBeenCalledWith('orders.user', 'user');
      expect((orderRepository as any).where).toHaveBeenCalledWith('orders.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
      expect((orderRepository as any).andWhere).toHaveBeenCalledWith('orders.paymentStatus = :status', { status: PaymentStatus.Paid });
      expect((orderRepository as any).andWhere).toHaveBeenCalledWith('orders.orderStatus = :orderStatus', { orderStatus: OrderStatus.Delivered });
      expect((orderRepository as any).groupBy).toHaveBeenCalledWith('orders.user_id');
      expect((orderRepository as any).orderBy).toHaveBeenCalledWith('totalRevenue', 'DESC');
      expect((orderRepository as any).limit).toHaveBeenCalledWith(5);
    });
  });

  describe('Edge cases', () => {
    it('should return an empty array if no orders match the criteria', async () => {
      // Arrange
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');
      
      (orderRepository as any).getRawMany = jest.fn().mockResolvedValue([]);

      // Act
      const result = await orderRepository.getTopCustomersByRevenue(startDate, endDate);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle cases where totalRevenue is not a valid number', async () => {
      // Arrange
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');
      
      (orderRepository as any).getRawMany = jest.fn().mockResolvedValue([
        { userId: 1, userName: 'John Doe', totalRevenue: 'invalid' },
      ]);

      // Act
      const result = await orderRepository.getTopCustomersByRevenue(startDate, endDate);

      // Assert
      expect(result).toEqual([
        { userId: 1, userName: 'John Doe', revenue: NaN },
      ]);
    });
  });
});
