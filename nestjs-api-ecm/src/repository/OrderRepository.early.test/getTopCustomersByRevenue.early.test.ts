
/**
 * File: nestjs-api-ecm\src\repository\OrderRepository.early.test\getTopCustomersByRevenue.early.test.ts
 * Class: OrderRepository
 * Method: getTopCustomersByRevenue
 * 
 * Mô tả: Test suite cho phương thức getTopCustomersByRevenue của OrderRepository
 * Chức năng: Lấy danh sách top khách hàng có doanh thu cao nhất trong khoảng thời gian
 */

import { OrderStatus, PaymentStatus } from "src/share/Enum/Enum";
import { OrderRepository } from '../OrderRepository';

// Mock class DataSource để giả lập kết nối database
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

  // Khởi tạo các mock object trước mỗi test case
  beforeEach(() => {
    mockDataSource = new MockDataSource();
    orderRepository = new OrderRepository(mockDataSource as any);
    // Mock các phương thức của queryBuilder
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
    /**
     * Test Case ID: TC001
     * Mục tiêu: Kiểm tra lấy top 5 khách hàng có doanh thu cao nhất trong khoảng thời gian
     * Input: 
     * - startDate: 2023-01-01
     * - endDate: 2023-12-31
     * Expected Output: Mảng chứa thông tin của 2 khách hàng với các trường:
     * - userId: 1, userName: 'John Doe', revenue: 1000.00
     * - userId: 2, userName: 'Jane Smith', revenue: 800.00
     * Ghi chú: Happy path - Trường hợp thành công với dữ liệu đầy đủ và hợp lệ
     */
    it('should return top customers by revenue within the given date range', async () => {
      // Arrange: Chuẩn bị dữ liệu mẫu cho test case
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');
      
      (orderRepository as any).getRawMany = jest.fn().mockResolvedValue([
        { userId: 1, userName: 'John Doe', totalRevenue: '1000.00' },
        { userId: 2, userName: 'Jane Smith', totalRevenue: '800.00' },
      ]);

      // Act: Gọi phương thức cần test
      const result = await orderRepository.getTopCustomersByRevenue(startDate, endDate);

      // Assert: Kiểm tra kết quả và các phương thức được gọi
      expect(result).toEqual([
        { userId: 1, userName: 'John Doe', revenue: 1000.00 },
        { userId: 2, userName: 'Jane Smith', revenue: 800.00 },
      ]);

      // Kiểm tra các phương thức được gọi với đúng tham số
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
    /**
     * Test Case ID: TC002
     * Mục tiêu: Kiểm tra xử lý khi không có đơn hàng nào trong khoảng thời gian
     * Input:
     * - startDate: 2023-01-01
     * - endDate: 2023-12-31
     * Expected Output: Mảng rỗng []
     * Ghi chú: Edge case - Trường hợp không có dữ liệu thỏa mãn điều kiện
     */
    it('should return an empty array if no orders match the criteria', async () => {
      // Arrange: Chuẩn bị dữ liệu - trả về mảng rỗng
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');
      
      (orderRepository as any).getRawMany = jest.fn().mockResolvedValue([]);

      // Act: Gọi phương thức cần test
      const result = await orderRepository.getTopCustomersByRevenue(startDate, endDate);

      // Assert: Kiểm tra kết quả là mảng rỗng
      expect(result).toEqual([]);
    });

    /**
     * Test Case ID: TC003
     * Mục tiêu: Kiểm tra xử lý khi doanh thu không phải là số hợp lệ
     * Input:
     * - startDate: 2023-01-01
     * - endDate: 2023-12-31
     * Expected Output: Mảng chứa khách hàng với revenue là NaN
     * - userId: 1, userName: 'John Doe', revenue: NaN
     * Ghi chú: Edge case - Trường hợp dữ liệu doanh thu không hợp lệ
     */
    it('should handle cases where totalRevenue is not a valid number', async () => {
      // Arrange: Chuẩn bị dữ liệu với totalRevenue không hợp lệ
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');
      
      (orderRepository as any).getRawMany = jest.fn().mockResolvedValue([
        { userId: 1, userName: 'John Doe', totalRevenue: 'invalid' },
      ]);

      // Act: Gọi phương thức cần test
      const result = await orderRepository.getTopCustomersByRevenue(startDate, endDate);

      // Assert: Kiểm tra kết quả với revenue là NaN
      expect(result).toEqual([
        { userId: 1, userName: 'John Doe', revenue: NaN },
      ]);
    });
  });
});
