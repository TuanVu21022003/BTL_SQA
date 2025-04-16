
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

describe('OrderRepository.getRevenueBySupplier() getRevenueBySupplier method', () => {
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
  });

  describe('Happy paths', () => {
    it('should return revenue data for suppliers within the given date range', async () => {
      // Arrange
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');
      
      (orderRepository as any).getRawMany = jest.fn().mockResolvedValue([
        { supplierId: 1, supplierName: 'Supplier A', totalRevenue: '1000.00' },
        { supplierId: 2, supplierName: 'Supplier B', totalRevenue: '2000.00' },
      ]);

      // Act
      const result = await orderRepository.getRevenueBySupplier(startDate, endDate);

      // Assert
      expect(result).toEqual([
        { supplierId: 1, supplierName: 'Supplier A', revenue: 1000.00 },
        { supplierId: 2, supplierName: 'Supplier B', revenue: 2000.00 },
      ]);
      expect((orderRepository as any).select).toHaveBeenCalledWith('supplier.id', 'supplierId');
      expect((orderRepository as any).addSelect).toHaveBeenCalledWith('supplier.name', 'supplierName');
      expect((orderRepository as any).addSelect).toHaveBeenCalledWith('SUM(order.total_price)', 'totalRevenue');
      expect((orderRepository as any).innerJoin).toHaveBeenCalledWith('order.orderProducts', 'order_product');
      expect((orderRepository as any).innerJoin).toHaveBeenCalledWith('order_product.product', 'product');
      expect((orderRepository as any).innerJoin).toHaveBeenCalledWith('product.supplier', 'supplier');
      expect((orderRepository as any).where).toHaveBeenCalledWith('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
      expect((orderRepository as any).andWhere).toHaveBeenCalledWith('order.paymentStatus = :paymentStatus', { paymentStatus: PaymentStatus.Paid });
      expect((orderRepository as any).andWhere).toHaveBeenCalledWith('order.orderStatus = :orderStatus', { orderStatus: OrderStatus.Delivered });
      expect((orderRepository as any).groupBy).toHaveBeenCalledWith('supplier.id');
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
      const result = await orderRepository.getRevenueBySupplier(startDate, endDate);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle cases where totalRevenue is null or undefined', async () => {
      // Arrange
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');
      
      (orderRepository as any).getRawMany = jest.fn().mockResolvedValue([
        { supplierId: 1, supplierName: 'Supplier A', totalRevenue: null },
        { supplierId: 2, supplierName: 'Supplier B', totalRevenue: undefined },
      ]);

      // Act
      const result = await orderRepository.getRevenueBySupplier(startDate, endDate);

      // Assert
      expect(result).toEqual([
        { supplierId: 1, supplierName: 'Supplier A', revenue: 0 },
        { supplierId: 2, supplierName: 'Supplier B', revenue: 0 },
      ]);
    });
  });
});
