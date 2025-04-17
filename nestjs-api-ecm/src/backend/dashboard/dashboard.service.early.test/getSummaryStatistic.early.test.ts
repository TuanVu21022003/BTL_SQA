/**
 * File: getSummaryStatistic.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho phương thức getSummaryStatistic của DashboardService
 * Module: Dashboard
 * Chức năng: Kiểm tra chức năng lấy thống kê tổng quan
 * Ngày tạo: 2023
 */

import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from '../dashboard.service';
import { TimeFilter } from 'src/share/Enum/Enum';

/**
 * Test Suite: DashboardService - getSummaryStatistic
 * Mô tả: Bộ test cho phương thức getSummaryStatistic của DashboardService
 */
describe('DashboardService.getSummaryStatistic() method', () => {
  let dashboardService: DashboardService;

  /**
   * Mock cho các repository
   * Mô tả: Tạo mock cho các repository được sử dụng trong service
   */
  const mockOrderRepo = {
    calculateStatsForTwoPeriods: jest.fn(),
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
        { provide: 'OrderRepository', useValue: mockOrderRepo },
        { provide: 'OrderProductRepository', useValue: mockOrderProductRepo },
        { provide: 'ImportRepository', useValue: mockImportRepo },
        { provide: 'ImportProductRepository', useValue: mockImportProRepo },
        { provide: 'UserRepository', useValue: mockUserRepo },
      ],
    }).compile();

    dashboardService = module.get<DashboardService>(DashboardService);

    // Spy các phương thức helper để kiểm tra chúng được gọi đúng cách
    jest.spyOn(dashboardService, 'timeFilterCreate');
    jest.spyOn(dashboardService, 'lastTimeFilterCreate');
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
     * Test case: TC_DASHBOARD_SERVICE_SUMMARY_001
     * Mục tiêu: Kiểm tra phương thức getSummaryStatistic trả về kết quả thống kê đúng
     * Input: timeFilter = TimeFilter.Week
     * Expected Output: Đối tượng chứa thống kê cho khoảng thời gian hiện tại và trước đó
     * Ghi chú: Kiểm tra luồng thành công cơ bản
     */
    it('TC_DASHBOARD_SERVICE_SUMMARY_001 - Nên trả về thống kê tổng quan đúng', async () => {
      // Sắp xếp (Arrange)
      const timeFilter = TimeFilter.Week;
      const mockStartDate = new Date('2023-04-10');
      const mockEndDate = new Date('2023-04-16');
      const mockLastStartDate = new Date('2023-04-03');
      const mockLastEndDate = new Date('2023-04-09');

      // Mock timeFilterCreate và lastTimeFilterCreate
      dashboardService.timeFilterCreate = jest.fn().mockReturnValue({
        startDate: mockStartDate,
        endDate: mockEndDate
      });

      dashboardService.lastTimeFilterCreate = jest.fn().mockReturnValue({
        lastStartDate: mockLastStartDate,
        lastEndDate: mockLastEndDate
      });

      // Mock calculateStatsForTwoPeriods
      const mockStats = {
        currentRevenue: 1000000,
        lastRevenue: 800000,
        currentQuantity: 50,
        lastQuantity: 40,
        currentTotalOrders: 30,
        lastTotalOrders: 25,
        currentTotalCustomers: 20,
        lastTotalCustomers: 15
      };

      mockOrderRepo.calculateStatsForTwoPeriods.mockResolvedValue(mockStats);

      // Thực thi (Act)
      const result = await dashboardService.getSummaryStatistic(timeFilter);

      // Kiểm tra (Assert)
      expect(dashboardService.timeFilterCreate).toHaveBeenCalledWith(timeFilter);
      expect(dashboardService.lastTimeFilterCreate).toHaveBeenCalledWith(mockStartDate, mockEndDate, timeFilter);
      expect(mockOrderRepo.calculateStatsForTwoPeriods).toHaveBeenCalledWith(
        mockStartDate, mockEndDate, mockLastStartDate, mockLastEndDate
      );

      // Kiểm tra kết quả
      expect(result).toEqual({
        thisTime: {
          revenue: mockStats.currentRevenue,
          product: mockStats.currentQuantity,
          customer: mockStats.currentTotalCustomers,
          order: mockStats.currentTotalOrders
        },
        lastTime: {
          revenue: mockStats.lastRevenue,
          product: mockStats.lastQuantity,
          customer: mockStats.lastTotalCustomers,
          order: mockStats.lastTotalOrders
        }
      });
    });

    /**
     * Test case: TC_DASHBOARD_SERVICE_SUMMARY_002
     * Mục tiêu: Kiểm tra phương thức getSummaryStatistic hoạt động đúng với các bộ lọc thời gian khác nhau
     * Input: timeFilter = TimeFilter.Month
     * Expected Output: Đối tượng chứa thống kê cho khoảng thời gian hiện tại và trước đó
     * Ghi chú: Kiểm tra với bộ lọc theo tháng
     */
    it('TC_DASHBOARD_SERVICE_SUMMARY_002 - Nên hoạt động đúng với bộ lọc "Tháng"', async () => {
      // Sắp xếp (Arrange)
      const timeFilter = TimeFilter.Month;
      const mockStartDate = new Date('2023-04-01');
      const mockEndDate = new Date('2023-04-30');
      const mockLastStartDate = new Date('2023-03-01');
      const mockLastEndDate = new Date('2023-03-31');

      // Mock timeFilterCreate và lastTimeFilterCreate
      dashboardService.timeFilterCreate = jest.fn().mockReturnValue({
        startDate: mockStartDate,
        endDate: mockEndDate
      });

      dashboardService.lastTimeFilterCreate = jest.fn().mockReturnValue({
        lastStartDate: mockLastStartDate,
        lastEndDate: mockLastEndDate
      });

      // Mock calculateStatsForTwoPeriods
      const mockStats = {
        currentRevenue: 5000000,
        lastRevenue: 4500000,
        currentQuantity: 200,
        lastQuantity: 180,
        currentTotalOrders: 120,
        lastTotalOrders: 100,
        currentTotalCustomers: 80,
        lastTotalCustomers: 70
      };

      mockOrderRepo.calculateStatsForTwoPeriods.mockResolvedValue(mockStats);

      // Thực thi (Act)
      const result = await dashboardService.getSummaryStatistic(timeFilter);

      // Kiểm tra (Assert)
      expect(dashboardService.timeFilterCreate).toHaveBeenCalledWith(timeFilter);
      expect(dashboardService.lastTimeFilterCreate).toHaveBeenCalledWith(mockStartDate, mockEndDate, timeFilter);
      expect(mockOrderRepo.calculateStatsForTwoPeriods).toHaveBeenCalledWith(
        mockStartDate, mockEndDate, mockLastStartDate, mockLastEndDate
      );

      // Kiểm tra kết quả
      expect(result).toEqual({
        thisTime: {
          revenue: mockStats.currentRevenue,
          product: mockStats.currentQuantity,
          customer: mockStats.currentTotalCustomers,
          order: mockStats.currentTotalOrders
        },
        lastTime: {
          revenue: mockStats.lastRevenue,
          product: mockStats.lastQuantity,
          customer: mockStats.lastTotalCustomers,
          order: mockStats.lastTotalOrders
        }
      });
    });
  });

  /**
   * Nhóm test case: Các trường hợp ngoại lệ
   * Mô tả: Kiểm tra các trường hợp xử lý lỗi và ngoại lệ
   */
  describe('Edge cases', () => {
    /**
     * Test case: TC_DASHBOARD_SERVICE_SUMMARY_003
     * Mục tiêu: Kiểm tra phương thức getSummaryStatistic xử lý lỗi khi timeFilterCreate ném ra lỗi
     * Input: timeFilter = 'InvalidFilter' (không hợp lệ)
     * Expected Output: Ném ra lỗi từ timeFilterCreate
     * Ghi chú: Kiểm tra xử lý lỗi với bộ lọc không hợp lệ
     */
    it('TC_DASHBOARD_SERVICE_SUMMARY_003 - Nên ném ra lỗi khi timeFilterCreate gặp lỗi', async () => {
      // Sắp xếp (Arrange)
      const invalidTimeFilter = 'InvalidFilter' as TimeFilter;

      // Mock timeFilterCreate để ném ra lỗi
      dashboardService.timeFilterCreate = jest.fn().mockImplementation(() => {
        throw new Error('Invalid time filter');
      });

      // Thực thi & Kiểm tra (Act & Assert)
      await expect(dashboardService.getSummaryStatistic(invalidTimeFilter))
        .rejects.toThrow('Invalid time filter');

      expect(dashboardService.timeFilterCreate).toHaveBeenCalledWith(invalidTimeFilter);
      expect(dashboardService.lastTimeFilterCreate).not.toHaveBeenCalled();
      expect(mockOrderRepo.calculateStatsForTwoPeriods).not.toHaveBeenCalled();
    });

    /**
     * Test case: TC_DASHBOARD_SERVICE_SUMMARY_004
     * Mục tiêu: Kiểm tra phương thức getSummaryStatistic xử lý lỗi khi calculateStatsForTwoPeriods ném ra lỗi
     * Input: timeFilter = TimeFilter.Week
     * Expected Output: Ném ra lỗi từ calculateStatsForTwoPeriods
     * Ghi chú: Kiểm tra xử lý lỗi từ repository
     */
    it('TC_DASHBOARD_SERVICE_SUMMARY_004 - Nên ném ra lỗi khi repository gặp lỗi', async () => {
      // Sắp xếp (Arrange)
      const timeFilter = TimeFilter.Week;
      const mockStartDate = new Date('2023-04-10');
      const mockEndDate = new Date('2023-04-16');
      const mockLastStartDate = new Date('2023-04-03');
      const mockLastEndDate = new Date('2023-04-09');

      // Mock timeFilterCreate và lastTimeFilterCreate
      dashboardService.timeFilterCreate = jest.fn().mockReturnValue({
        startDate: mockStartDate,
        endDate: mockEndDate
      });

      dashboardService.lastTimeFilterCreate = jest.fn().mockReturnValue({
        lastStartDate: mockLastStartDate,
        lastEndDate: mockLastEndDate
      });

      // Mock calculateStatsForTwoPeriods để ném ra lỗi
      const errorMessage = 'Database connection error';
      mockOrderRepo.calculateStatsForTwoPeriods.mockRejectedValue(new Error(errorMessage));

      // Thực thi & Kiểm tra (Act & Assert)
      await expect(dashboardService.getSummaryStatistic(timeFilter))
        .rejects.toThrow(errorMessage);

      expect(dashboardService.timeFilterCreate).toHaveBeenCalledWith(timeFilter);
      expect(dashboardService.lastTimeFilterCreate).toHaveBeenCalledWith(mockStartDate, mockEndDate, timeFilter);
      expect(mockOrderRepo.calculateStatsForTwoPeriods).toHaveBeenCalledWith(
        mockStartDate, mockEndDate, mockLastStartDate, mockLastEndDate
      );
    });
  });
});
