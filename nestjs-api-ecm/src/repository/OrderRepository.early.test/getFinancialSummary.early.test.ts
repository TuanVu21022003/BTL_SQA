
import { TimeFilter } from "src/share/Enum/Enum";
import { OrderRepository } from '../OrderRepository';
import { DataSource } from 'typeorm';

describe('OrderRepository.getFinancialSummary() getFinancialSummary method', () => {
  let orderRepository: OrderRepository;
  let mockQueryBuilder: any;
  let realDate: DateConstructor;

  /**
   * Setup trước tất cả test case
   * Mock ngày hiện tại thành 01/01/2023 để đảm bảo tính nhất quán của test
   */
  beforeAll(() => {
    realDate = global.Date;
    const mockDate = new Date(2023, 0, 1);
    global.Date = class extends Date {
      constructor() {
        super();
        return mockDate;
      }
      static now() {
        return mockDate.getTime();
      }
    } as DateConstructor;
  });

  /**
   * Khôi phục lại Date constructor sau khi test xong
   */
  afterAll(() => {
    global.Date = realDate;
  });

  /**
   * Setup trước mỗi test case
   * Khởi tạo mock query builder và repository
   */
  beforeEach(() => {
    mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(),
    };

    const mockDataSource = {
      createQueryBuilder: jest.fn(),
      manager: {},
    } as unknown as DataSource;

    orderRepository = new OrderRepository(mockDataSource);
    jest.spyOn(orderRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder);
  });

  describe('Happy Paths', () => {
    /**
     * Test Case ID: TC001
     * Mục tiêu: Kiểm tra lấy báo cáo tài chính theo tuần thành công
     * Input: TimeFilter.Week
     * Expected Output: Mảng chứa báo cáo tài chính của tuần hiện tại với các thông tin:
     * - time_period: '2023-W1'
     * - total_revenue: 1000
     * - total_cost: 500
     * - profit: 500
     * Ghi chú: Happy path - Trường hợp thành công với dữ liệu theo tuần
     */
    it('should return financial summary for the current week', async () => {
      // Arrange: Chuẩn bị dữ liệu mẫu cho test case
      mockQueryBuilder.getRawMany.mockResolvedValue([
        { time_period: '2023-W1', total_revenue: 1000, total_cost: 500, profit: 500 },
      ]);

      // Act: Gọi phương thức cần test
      const result = await orderRepository.getFinancialSummary(TimeFilter.Week);

      // Assert: Kiểm tra kết quả
      expect(result).toEqual([
        { time_period: '2023-W1', total_revenue: 1000, total_cost: 500, profit: 500 },
      ]);
      expect(mockQueryBuilder.select).toHaveBeenCalled();
      expect(mockQueryBuilder.leftJoin).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(mockQueryBuilder.groupBy).toHaveBeenCalled();
      expect(mockQueryBuilder.orderBy).toHaveBeenCalled();
    });

    /**
     * Test Case ID: TC002
     * Mục tiêu: Kiểm tra lấy báo cáo tài chính theo tháng thành công
     * Input: TimeFilter.Month
     * Expected Output: Mảng chứa báo cáo tài chính của 12 tháng trong năm, với tháng 1 có dữ liệu:
     * - time_period: '2023-01'
     * - total_revenue: 2000
     * - total_cost: 1000
     * - profit: 1000
     * Các tháng còn lại có giá trị 0
     * Ghi chú: Happy path - Trường hợp thành công với dữ liệu theo tháng
     */
    it('should return financial summary for the current month', async () => {
      // Arrange: Chuẩn bị dữ liệu mẫu cho test case
      mockQueryBuilder.getRawMany.mockResolvedValue([
        { time_period: '2023-01', total_revenue: 2000, total_cost: 1000, profit: 1000 },
      ]);

      // Act: Gọi phương thức cần test
      const result = await orderRepository.getFinancialSummary(TimeFilter.Month);

      // Assert: Kiểm tra kết quả - bao gồm cả 12 tháng
      expect(result).toEqual([
        { time_period: '2023-01', total_revenue: 2000, total_cost: 1000, profit: 1000 },
        { time_period: '2023-02', total_revenue: 0, total_cost: 0, profit: 0 },
        { time_period: '2023-03', total_revenue: 0, total_cost: 0, profit: 0 },
        { time_period: '2023-04', total_revenue: 0, total_cost: 0, profit: 0 },
        { time_period: '2023-05', total_revenue: 0, total_cost: 0, profit: 0 },
        { time_period: '2023-06', total_revenue: 0, total_cost: 0, profit: 0 },
        { time_period: '2023-07', total_revenue: 0, total_cost: 0, profit: 0 },
        { time_period: '2023-08', total_revenue: 0, total_cost: 0, profit: 0 },
        { time_period: '2023-09', total_revenue: 0, total_cost: 0, profit: 0 },
        { time_period: '2023-10', total_revenue: 0, total_cost: 0, profit: 0 },
        { time_period: '2023-11', total_revenue: 0, total_cost: 0, profit: 0 },
        { time_period: '2023-12', total_revenue: 0, total_cost: 0, profit: 0 },
      ]);
    });

    /**
     * Test Case ID: TC003
     * Mục tiêu: Kiểm tra lấy báo cáo tài chính theo quý thành công
     * Input: TimeFilter.Quarter
     * Expected Output: Mảng chứa báo cáo tài chính của 4 quý, với quý 1 có dữ liệu:
     * - time_period: '2023-Q1'
     * - total_revenue: 3000
     * - total_cost: 1500
     * - profit: 1500
     * Các quý còn lại có giá trị 0
     * Ghi chú: Happy path - Trường hợp thành công với dữ liệu theo quý
     */
    it('should return financial summary for the current quarter', async () => {
      // Arrange: Chuẩn bị dữ liệu mẫu cho test case
      mockQueryBuilder.getRawMany.mockResolvedValue([
        { time_period: '2023-Q1', total_revenue: 3000, total_cost: 1500, profit: 1500 },
      ]);

      // Act: Gọi phương thức cần test
      const result = await orderRepository.getFinancialSummary(TimeFilter.Quarter);

      // Assert: Kiểm tra kết quả - bao gồm cả 4 quý
      expect(result).toEqual([
        { time_period: '2023-Q1', total_revenue: 3000, total_cost: 1500, profit: 1500 },
        { time_period: '2023-Q2', total_revenue: 0, total_cost: 0, profit: 0 },
        { time_period: '2023-Q3', total_revenue: 0, total_cost: 0, profit: 0 },
        { time_period: '2023-Q4', total_revenue: 0, total_cost: 0, profit: 0 },
      ]);
    });

    /**
     * Test Case ID: TC004
     * Mục tiêu: Kiểm tra lấy báo cáo tài chính theo năm thành công
     * Input: TimeFilter.Year
     * Expected Output: Mảng chứa báo cáo tài chính của 4 năm gần nhất, với năm hiện tại có dữ liệu:
     * - time_period: '2023'
     * - total_revenue: 4000
     * - total_cost: 2000
     * - profit: 2000
     * Các năm còn lại có giá trị 0
     * Ghi chú: Happy path - Trường hợp thành công với dữ liệu theo năm
     */
    it('should return financial summary for the current year', async () => {
      // Arrange: Chuẩn bị dữ liệu mẫu cho test case
      mockQueryBuilder.getRawMany.mockResolvedValue([
        { time_period: '2023', total_revenue: 4000, total_cost: 2000, profit: 2000 },
      ]);

      // Act: Gọi phương thức cần test
      const result = await orderRepository.getFinancialSummary(TimeFilter.Year);

      // Assert: Kiểm tra kết quả - bao gồm 4 năm gần nhất
      expect(result).toEqual([
        { time_period: '2023', total_revenue: 4000, total_cost: 2000, profit: 2000 },
        { time_period: '2022', total_revenue: 0, total_cost: 0, profit: 0 },
        { time_period: '2021', total_revenue: 0, total_cost: 0, profit: 0 },
        { time_period: '2020', total_revenue: 0, total_cost: 0, profit: 0 },
      ]);
    });
  });

  describe('Edge Cases', () => {
    /**
     * Test Case ID: TC005
     * Mục tiêu: Kiểm tra xử lý khi TimeFilter không hợp lệ
     * Input: TimeFilter không hợp lệ ('Invalid' as any)
     * Expected Output: Throw error với message 'Invalid TimeFilter'
     * Ghi chú: Edge case - Trường hợp TimeFilter không hợp lệ
     */
    it('should handle an invalid TimeFilter', async () => {
      // Act & Assert: Kiểm tra throw error
      await expect(orderRepository.getFinancialSummary('Invalid' as any))
        .rejects.toThrow('Invalid TimeFilter');
    });

    /**
     * Test Case ID: TC006
     * Mục tiêu: Kiểm tra xử lý khi không có dữ liệu từ database
     * Input: TimeFilter.Month và database trả về mảng rỗng
     * Expected Output: Mảng chứa 12 tháng với tất cả giá trị bằng 0
     * Ghi chú: Edge case - Trường hợp không có dữ liệu từ database
     */
    it('should handle empty data from the database', async () => {
      // Arrange: Mock database trả về mảng rỗng
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      // Act: Gọi phương thức với TimeFilter.Month
      const result = await orderRepository.getFinancialSummary(TimeFilter.Month);

      // Assert: Kiểm tra kết quả - tất cả các tháng đều có giá trị 0
      expect(result.length).toBe(12);
      result.forEach(item => {
        expect(item.total_revenue).toBe(0);
        expect(item.total_cost).toBe(0);
        expect(item.profit).toBe(0);
      });
    });
  });
});
