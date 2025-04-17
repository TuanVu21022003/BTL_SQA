/**
 * File: getFinancialSummaryByTime.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho phương thức getFinancialSummaryByTime của DashboardService
 * Module: Dashboard
 * Chức năng: Kiểm tra chức năng lấy thống kê tài chính theo thời gian
 * Ngày tạo: 2023
 */

import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from '../dashboard.service';
import { TimeFilter } from 'src/share/Enum/Enum';

/**
 * Test Suite: DashboardService - getFinancialSummaryByTime
 * Mô tả: Bộ test cho phương thức getFinancialSummaryByTime của DashboardService
 */
describe('DashboardService.getFinancialSummaryByTime() method', () => {
  let dashboardService: DashboardService;
  
  /**
   * Mock cho các repository
   * Mô tả: Tạo mock cho các repository được sử dụng trong service
   */
  const mockOrderRepo = {
    getFinancialSummary: jest.fn(),
  };
  const mockOrderProductRepo = {};
  const mockImportRepo = {};
  const mockImportProRepo = {};
  const mockUserRepo = {};

  /**
   * Thiết lập môi trường test
   * Mô tả: Khởi tạo service với các repository đã được mock
   */
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: 'OrderRepositoryRepository', useValue: mockOrderRepo },
        { provide: 'OrderProductRepositoryRepository', useValue: mockOrderProductRepo },
        { provide: 'ImportRepositoryRepository', useValue: mockImportRepo },
        { provide: 'ImportProductRepositoryRepository', useValue: mockImportProRepo },
        { provide: 'UserRepositoryRepository', useValue: mockUserRepo },
      ],
    }).compile();

    dashboardService = module.get<DashboardService>(DashboardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Nhóm test case: Các trường hợp thành công
   * Mô tả: Kiểm tra các trường hợp phương thức hoạt động đúng
   */
  describe('Happy paths', () => {
    /**
     * Test case: TC_DASHBOARD_SERVICE_FINANCIAL_001
     * Mục tiêu: Kiểm tra phương thức getFinancialSummaryByTime trả về kết quả thống kê tài chính đúng
     * Input: timeFilter = TimeFilter.Week
     * Expected Output: Mảng các đối tượng thống kê tài chính đã được chuyển đổi
     * Ghi chú: Kiểm tra luồng thành công cơ bản
     */
    it('TC_DASHBOARD_SERVICE_FINANCIAL_001 - Nên trả về thống kê tài chính đúng', async () => {
      // Sắp xếp (Arrange)
      const timeFilter = TimeFilter.Week;
      
      // Mock getFinancialSummary
      const mockFinancialData = [
        { time_period: '2023-W15', total_revenue: '1000000', total_cost: '700000', profit: '300000' },
        { time_period: '2023-W16', total_revenue: '1200000', total_cost: '800000', profit: '400000' }
      ];
      
      mockOrderRepo.getFinancialSummary.mockResolvedValue(mockFinancialData);
      
      // Thực thi (Act)
      const result = await dashboardService.getFinancialSummaryByTime(timeFilter);

      // Kiểm tra (Assert)
      expect(mockOrderRepo.getFinancialSummary).toHaveBeenCalledWith(timeFilter);
      
      // Kiểm tra kết quả
      expect(result).toEqual([
        { time_period: '2023-W15', total_revenue: 1000000, total_cost: 700000, profit: 300000 },
        { time_period: '2023-W16', total_revenue: 1200000, total_cost: 800000, profit: 400000 }
      ]);
    });

    /**
     * Test case: TC_DASHBOARD_SERVICE_FINANCIAL_002
     * Mục tiêu: Kiểm tra phương thức getFinancialSummaryByTime xử lý đúng khi có giá trị null hoặc undefined
     * Input: timeFilter = TimeFilter.Month
     * Expected Output: Mảng các đối tượng thống kê tài chính với giá trị mặc định là 0 cho các trường null/undefined
     * Ghi chú: Kiểm tra xử lý giá trị null/undefined
     */
    it('TC_DASHBOARD_SERVICE_FINANCIAL_002 - Nên xử lý đúng khi có giá trị null hoặc undefined', async () => {
      // Sắp xếp (Arrange)
      const timeFilter = TimeFilter.Month;
      
      // Mock getFinancialSummary với dữ liệu có giá trị null/undefined
      const mockFinancialData = [
        { time_period: '2023-04', total_revenue: null, total_cost: '700000', profit: '300000' },
        { time_period: '2023-05', total_revenue: '1200000', total_cost: undefined, profit: null }
      ];
      
      mockOrderRepo.getFinancialSummary.mockResolvedValue(mockFinancialData);
      
      // Thực thi (Act)
      const result = await dashboardService.getFinancialSummaryByTime(timeFilter);

      // Kiểm tra (Assert)
      expect(mockOrderRepo.getFinancialSummary).toHaveBeenCalledWith(timeFilter);
      
      // Kiểm tra kết quả
      expect(result).toEqual([
        { time_period: '2023-04', total_revenue: 0, total_cost: 700000, profit: 300000 },
        { time_period: '2023-05', total_revenue: 1200000, total_cost: 0, profit: 0 }
      ]);
    });
  });

  /**
   * Nhóm test case: Các trường hợp ngoại lệ
   * Mô tả: Kiểm tra các trường hợp xử lý lỗi và ngoại lệ
   */
  describe('Edge cases', () => {
    /**
     * Test case: TC_DASHBOARD_SERVICE_FINANCIAL_003
     * Mục tiêu: Kiểm tra phương thức getFinancialSummaryByTime xử lý đúng khi repository trả về mảng rỗng
     * Input: timeFilter = TimeFilter.Quarter
     * Expected Output: Mảng rỗng
     * Ghi chú: Kiểm tra xử lý mảng rỗng
     */
    it('TC_DASHBOARD_SERVICE_FINANCIAL_003 - Nên trả về mảng rỗng khi repository trả về mảng rỗng', async () => {
      // Sắp xếp (Arrange)
      const timeFilter = TimeFilter.Quarter;
      
      // Mock getFinancialSummary trả về mảng rỗng
      mockOrderRepo.getFinancialSummary.mockResolvedValue([]);
      
      // Thực thi (Act)
      const result = await dashboardService.getFinancialSummaryByTime(timeFilter);

      // Kiểm tra (Assert)
      expect(mockOrderRepo.getFinancialSummary).toHaveBeenCalledWith(timeFilter);
      expect(result).toEqual([]);
    });

    /**
     * Test case: TC_DASHBOARD_SERVICE_FINANCIAL_004
     * Mục tiêu: Kiểm tra phương thức getFinancialSummaryByTime xử lý lỗi khi repository ném ra lỗi
     * Input: timeFilter = TimeFilter.Year
     * Expected Output: Ném ra lỗi từ repository
     * Ghi chú: Kiểm tra xử lý lỗi từ repository
     */
    it('TC_DASHBOARD_SERVICE_FINANCIAL_004 - Nên ném ra lỗi khi repository gặp lỗi', async () => {
      // Sắp xếp (Arrange)
      const timeFilter = TimeFilter.Year;
      
      // Mock getFinancialSummary để ném ra lỗi
      const errorMessage = 'Database connection error';
      mockOrderRepo.getFinancialSummary.mockRejectedValue(new Error(errorMessage));
      
      // Thực thi & Kiểm tra (Act & Assert)
      await expect(dashboardService.getFinancialSummaryByTime(timeFilter))
        .rejects.toThrow(errorMessage);
      
      expect(mockOrderRepo.getFinancialSummary).toHaveBeenCalledWith(timeFilter);
    });
  });
});
