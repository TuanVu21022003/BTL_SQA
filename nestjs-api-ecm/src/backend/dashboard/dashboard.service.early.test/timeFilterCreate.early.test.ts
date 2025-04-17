/**
 * File: timeFilterCreate.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho phương thức timeFilterCreate của DashboardService
 * Module: Dashboard
 * Chức năng: Kiểm tra chức năng tạo khoảng thời gian dựa trên bộ lọc thời gian
 * Ngày tạo: 2023
 */

import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from '../dashboard.service';
import { TimeFilter } from 'src/share/Enum/Enum';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

/**
 * Test Suite: DashboardService - timeFilterCreate
 * Mô tả: Bộ test cho phương thức timeFilterCreate của DashboardService
 */
describe('DashboardService.timeFilterCreate() method', () => {
  let dashboardService: DashboardService;
  
  /**
   * Mock cho các repository
   * Mô tả: Tạo mock cho các repository được sử dụng trong service
   */
  const mockOrderRepo = { calculateStatsForTwoPeriods: jest.fn() };
  const mockOrderProductRepo = { getTopProductsByRevenue: jest.fn() };
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
    
    // Mock Date.now để có kết quả kiểm thử nhất quán
    jest.spyOn(global, 'Date').mockImplementation(() => new Date('2023-04-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * Nhóm test case: Các trường hợp thành công
   * Mô tả: Kiểm tra các trường hợp phương thức hoạt động đúng với các bộ lọc thời gian khác nhau
   */
  describe('Happy paths', () => {
    /**
     * Test case: TC_DASHBOARD_SERVICE_TIME_FILTER_001
     * Mục tiêu: Kiểm tra phương thức timeFilterCreate trả về khoảng thời gian đúng với TimeFilter.Week
     * Input: timeFilter = TimeFilter.Week
     * Expected Output: Đối tượng chứa startDate và endDate tương ứng với tuần hiện tại
     * Ghi chú: Kiểm tra bộ lọc theo tuần
     */
    it('TC_DASHBOARD_SERVICE_TIME_FILTER_001 - Nên trả về khoảng thời gian đúng với bộ lọc "Tuần"', () => {
      // Sắp xếp (Arrange)
      const timeFilter = TimeFilter.Week;
      const mockDate = new Date('2023-04-15T12:00:00Z');
      const expectedStartDate = startOfWeek(mockDate, { weekStartsOn: 1 });
      const expectedEndDate = endOfWeek(mockDate, { weekStartsOn: 1 });

      // Thực thi (Act)
      const result = dashboardService.timeFilterCreate(timeFilter);

      // Kiểm tra (Assert)
      expect(result.startDate).toEqual(expectedStartDate);
      expect(result.endDate).toEqual(expectedEndDate);
    });

    /**
     * Test case: TC_DASHBOARD_SERVICE_TIME_FILTER_002
     * Mục tiêu: Kiểm tra phương thức timeFilterCreate trả về khoảng thời gian đúng với TimeFilter.Month
     * Input: timeFilter = TimeFilter.Month
     * Expected Output: Đối tượng chứa startDate và endDate tương ứng với tháng hiện tại
     * Ghi chú: Kiểm tra bộ lọc theo tháng
     */
    it('TC_DASHBOARD_SERVICE_TIME_FILTER_002 - Nên trả về khoảng thời gian đúng với bộ lọc "Tháng"', () => {
      // Sắp xếp (Arrange)
      const timeFilter = TimeFilter.Month;
      const mockDate = new Date('2023-04-15T12:00:00Z');
      const expectedStartDate = startOfMonth(mockDate);
      const expectedEndDate = endOfMonth(mockDate);

      // Thực thi (Act)
      const result = dashboardService.timeFilterCreate(timeFilter);

      // Kiểm tra (Assert)
      expect(result.startDate).toEqual(expectedStartDate);
      expect(result.endDate).toEqual(expectedEndDate);
    });

    /**
     * Test case: TC_DASHBOARD_SERVICE_TIME_FILTER_003
     * Mục tiêu: Kiểm tra phương thức timeFilterCreate trả về khoảng thời gian đúng với TimeFilter.Year
     * Input: timeFilter = TimeFilter.Year
     * Expected Output: Đối tượng chứa startDate và endDate tương ứng với năm hiện tại
     * Ghi chú: Kiểm tra bộ lọc theo năm
     */
    it('TC_DASHBOARD_SERVICE_TIME_FILTER_003 - Nên trả về khoảng thời gian đúng với bộ lọc "Năm"', () => {
      // Sắp xếp (Arrange)
      const timeFilter = TimeFilter.Year;
      const mockDate = new Date('2023-04-15T12:00:00Z');
      const expectedStartDate = startOfYear(mockDate);
      const expectedEndDate = endOfYear(mockDate);

      // Thực thi (Act)
      const result = dashboardService.timeFilterCreate(timeFilter);

      // Kiểm tra (Assert)
      expect(result.startDate).toEqual(expectedStartDate);
      expect(result.endDate).toEqual(expectedEndDate);
    });

    /**
     * Test case: TC_DASHBOARD_SERVICE_TIME_FILTER_004
     * Mục tiêu: Kiểm tra phương thức timeFilterCreate trả về khoảng thời gian đúng với TimeFilter.Quarter
     * Input: timeFilter = TimeFilter.Quarter
     * Expected Output: Đối tượng chứa startDate và endDate tương ứng với quý hiện tại
     * Ghi chú: Kiểm tra bộ lọc theo quý
     */
    it('TC_DASHBOARD_SERVICE_TIME_FILTER_004 - Nên trả về khoảng thời gian đúng với bộ lọc "Quý"', () => {
      // Sắp xếp (Arrange)
      const timeFilter = TimeFilter.Quarter;
      const mockDate = new Date('2023-04-15T12:00:00Z'); // Q2 (Apr-Jun)
      const expectedStartDate = new Date(2023, 3, 1); // Apr 1, 2023
      const expectedEndDate = new Date(2023, 6, 0); // Jun 30, 2023

      // Thực thi (Act)
      const result = dashboardService.timeFilterCreate(timeFilter);

      // Kiểm tra (Assert)
      expect(result.startDate).toEqual(expectedStartDate);
      expect(result.endDate).toEqual(expectedEndDate);
    });
  });

  /**
   * Nhóm test case: Các trường hợp ngoại lệ
   * Mô tả: Kiểm tra các trường hợp xử lý lỗi và ngoại lệ
   */
  describe('Edge cases', () => {
    /**
     * Test case: TC_DASHBOARD_SERVICE_TIME_FILTER_005
     * Mục tiêu: Kiểm tra phương thức timeFilterCreate ném ra lỗi khi bộ lọc không hợp lệ
     * Input: timeFilter = 'InvalidFilter' (không hợp lệ)
     * Expected Output: Ném ra lỗi với thông báo 'Invalid time filter'
     * Ghi chú: Kiểm tra xử lý lỗi với bộ lọc không hợp lệ
     */
    it('TC_DASHBOARD_SERVICE_TIME_FILTER_005 - Nên ném ra lỗi khi bộ lọc không hợp lệ', () => {
      // Sắp xếp (Arrange)
      const invalidTimeFilter = 'InvalidFilter' as TimeFilter;

      // Thực thi & Kiểm tra (Act & Assert)
      expect(() => dashboardService.timeFilterCreate(invalidTimeFilter)).toThrow('Invalid time filter');
    });
  });
});
