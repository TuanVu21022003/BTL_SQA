/**
 * File: lastTimeFilterCreate.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho phương thức lastTimeFilterCreate của DashboardService
 * Module: Dashboard
 * Chức năng: Kiểm tra chức năng tạo khoảng thời gian trước đó dựa trên khoảng thời gian hiện tại
 * Ngày tạo: 2023
 */

import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from '../dashboard.service';
import { TimeFilter } from 'src/share/Enum/Enum';

/**
 * Test Suite: DashboardService - lastTimeFilterCreate
 * Mô tả: Bộ test cho phương thức lastTimeFilterCreate của DashboardService
 */
describe('DashboardService.lastTimeFilterCreate() method', () => {
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
    
    // Spy các phương thức helper để kiểm tra chúng được gọi đúng cách
    jest.spyOn(dashboardService, 'addDays');
    jest.spyOn(dashboardService, 'addMonths');
    jest.spyOn(dashboardService, 'addYears');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Nhóm test case: Các trường hợp thành công
   * Mô tả: Kiểm tra các trường hợp phương thức hoạt động đúng với các bộ lọc thời gian khác nhau
   */
  describe('Happy paths', () => {
    /**
     * Test case: TC_DASHBOARD_SERVICE_LAST_TIME_FILTER_001
     * Mục tiêu: Kiểm tra phương thức lastTimeFilterCreate trả về khoảng thời gian trước đó đúng với TimeFilter.Week
     * Input: startDate, endDate, timeFilter = TimeFilter.Week
     * Expected Output: Đối tượng chứa lastStartDate và lastEndDate tương ứng với tuần trước
     * Ghi chú: Kiểm tra bộ lọc theo tuần
     */
    it('TC_DASHBOARD_SERVICE_LAST_TIME_FILTER_001 - Nên trả về khoảng thời gian tuần trước với bộ lọc "Tuần"', () => {
      // Sắp xếp (Arrange)
      const startDate = new Date('2023-04-10'); // Thứ Hai
      const endDate = new Date('2023-04-16'); // Chủ Nhật
      const timeFilter = TimeFilter.Week;
      
      // Thực thi (Act)
      const result = dashboardService.lastTimeFilterCreate(startDate, endDate, timeFilter);

      // Kiểm tra (Assert)
      expect(dashboardService.addDays).toHaveBeenCalledWith(startDate, -7);
      expect(dashboardService.addDays).toHaveBeenCalledWith(endDate, -7);
      
      // Kiểm tra kết quả
      const expectedLastStartDate = new Date('2023-04-03'); // Thứ Hai tuần trước
      const expectedLastEndDate = new Date('2023-04-09'); // Chủ Nhật tuần trước
      
      expect(result.lastStartDate.getFullYear()).toBe(expectedLastStartDate.getFullYear());
      expect(result.lastStartDate.getMonth()).toBe(expectedLastStartDate.getMonth());
      expect(result.lastStartDate.getDate()).toBe(expectedLastStartDate.getDate());
      
      expect(result.lastEndDate.getFullYear()).toBe(expectedLastEndDate.getFullYear());
      expect(result.lastEndDate.getMonth()).toBe(expectedLastEndDate.getMonth());
      expect(result.lastEndDate.getDate()).toBe(expectedLastEndDate.getDate());
    });

    /**
     * Test case: TC_DASHBOARD_SERVICE_LAST_TIME_FILTER_002
     * Mục tiêu: Kiểm tra phương thức lastTimeFilterCreate trả về khoảng thời gian trước đó đúng với TimeFilter.Month
     * Input: startDate, endDate, timeFilter = TimeFilter.Month
     * Expected Output: Đối tượng chứa lastStartDate và lastEndDate tương ứng với tháng trước
     * Ghi chú: Kiểm tra bộ lọc theo tháng
     */
    it('TC_DASHBOARD_SERVICE_LAST_TIME_FILTER_002 - Nên trả về khoảng thời gian tháng trước với bộ lọc "Tháng"', () => {
      // Sắp xếp (Arrange)
      const startDate = new Date('2023-04-01'); // Ngày đầu tháng 4
      const endDate = new Date('2023-04-30'); // Ngày cuối tháng 4
      const timeFilter = TimeFilter.Month;
      
      // Thực thi (Act)
      const result = dashboardService.lastTimeFilterCreate(startDate, endDate, timeFilter);

      // Kiểm tra (Assert)
      expect(dashboardService.addMonths).toHaveBeenCalledWith(startDate, -1);
      expect(dashboardService.addMonths).toHaveBeenCalledWith(endDate, -1);
      
      // Kiểm tra kết quả
      const expectedLastStartDate = new Date('2023-03-01'); // Ngày đầu tháng 3
      const expectedLastEndDate = new Date('2023-03-31'); // Ngày cuối tháng 3
      
      expect(result.lastStartDate.getFullYear()).toBe(expectedLastStartDate.getFullYear());
      expect(result.lastStartDate.getMonth()).toBe(expectedLastStartDate.getMonth());
      expect(result.lastStartDate.getDate()).toBe(expectedLastStartDate.getDate());
      
      expect(result.lastEndDate.getFullYear()).toBe(expectedLastEndDate.getFullYear());
      expect(result.lastEndDate.getMonth()).toBe(expectedLastEndDate.getMonth());
      expect(result.lastEndDate.getDate()).toBe(expectedLastEndDate.getDate());
    });

    /**
     * Test case: TC_DASHBOARD_SERVICE_LAST_TIME_FILTER_003
     * Mục tiêu: Kiểm tra phương thức lastTimeFilterCreate trả về khoảng thời gian trước đó đúng với TimeFilter.Quarter
     * Input: startDate, endDate, timeFilter = TimeFilter.Quarter
     * Expected Output: Đối tượng chứa lastStartDate và lastEndDate tương ứng với quý trước
     * Ghi chú: Kiểm tra bộ lọc theo quý
     */
    it('TC_DASHBOARD_SERVICE_LAST_TIME_FILTER_003 - Nên trả về khoảng thời gian quý trước với bộ lọc "Quý"', () => {
      // Sắp xếp (Arrange)
      const startDate = new Date('2023-04-01'); // Ngày đầu Q2
      const endDate = new Date('2023-06-30'); // Ngày cuối Q2
      const timeFilter = TimeFilter.Quarter;
      
      // Thực thi (Act)
      const result = dashboardService.lastTimeFilterCreate(startDate, endDate, timeFilter);

      // Kiểm tra (Assert)
      expect(dashboardService.addMonths).toHaveBeenCalledWith(startDate, -3);
      expect(dashboardService.addMonths).toHaveBeenCalledWith(endDate, -3);
      
      // Kiểm tra kết quả
      const expectedLastStartDate = new Date('2023-01-01'); // Ngày đầu Q1
      const expectedLastEndDate = new Date('2023-03-31'); // Ngày cuối Q1
      
      expect(result.lastStartDate.getFullYear()).toBe(expectedLastStartDate.getFullYear());
      expect(result.lastStartDate.getMonth()).toBe(expectedLastStartDate.getMonth());
      expect(result.lastStartDate.getDate()).toBe(expectedLastStartDate.getDate());
      
      expect(result.lastEndDate.getFullYear()).toBe(expectedLastEndDate.getFullYear());
      expect(result.lastEndDate.getMonth()).toBe(expectedLastEndDate.getMonth());
      expect(result.lastEndDate.getDate()).toBe(expectedLastEndDate.getDate());
    });

    /**
     * Test case: TC_DASHBOARD_SERVICE_LAST_TIME_FILTER_004
     * Mục tiêu: Kiểm tra phương thức lastTimeFilterCreate trả về khoảng thời gian trước đó đúng với TimeFilter.Year
     * Input: startDate, endDate, timeFilter = TimeFilter.Year
     * Expected Output: Đối tượng chứa lastStartDate và lastEndDate tương ứng với năm trước
     * Ghi chú: Kiểm tra bộ lọc theo năm
     */
    it('TC_DASHBOARD_SERVICE_LAST_TIME_FILTER_004 - Nên trả về khoảng thời gian năm trước với bộ lọc "Năm"', () => {
      // Sắp xếp (Arrange)
      const startDate = new Date('2023-01-01'); // Ngày đầu năm 2023
      const endDate = new Date('2023-12-31'); // Ngày cuối năm 2023
      const timeFilter = TimeFilter.Year;
      
      // Thực thi (Act)
      const result = dashboardService.lastTimeFilterCreate(startDate, endDate, timeFilter);

      // Kiểm tra (Assert)
      expect(dashboardService.addYears).toHaveBeenCalledWith(startDate, -1);
      expect(dashboardService.addYears).toHaveBeenCalledWith(endDate, -1);
      
      // Kiểm tra kết quả
      const expectedLastStartDate = new Date('2022-01-01'); // Ngày đầu năm 2022
      const expectedLastEndDate = new Date('2022-12-31'); // Ngày cuối năm 2022
      
      expect(result.lastStartDate.getFullYear()).toBe(expectedLastStartDate.getFullYear());
      expect(result.lastStartDate.getMonth()).toBe(expectedLastStartDate.getMonth());
      expect(result.lastStartDate.getDate()).toBe(expectedLastStartDate.getDate());
      
      expect(result.lastEndDate.getFullYear()).toBe(expectedLastEndDate.getFullYear());
      expect(result.lastEndDate.getMonth()).toBe(expectedLastEndDate.getMonth());
      expect(result.lastEndDate.getDate()).toBe(expectedLastEndDate.getDate());
    });
  });

  /**
   * Nhóm test case: Các trường hợp ngoại lệ
   * Mô tả: Kiểm tra các trường hợp xử lý lỗi và ngoại lệ
   */
  describe('Edge cases', () => {
    /**
     * Test case: TC_DASHBOARD_SERVICE_LAST_TIME_FILTER_005
     * Mục tiêu: Kiểm tra phương thức lastTimeFilterCreate ném ra lỗi khi bộ lọc không hợp lệ
     * Input: startDate, endDate, timeFilter = 'InvalidFilter' (không hợp lệ)
     * Expected Output: Ném ra lỗi với thông báo 'Unsupported time period for lastTimeFilterCreate.'
     * Ghi chú: Kiểm tra xử lý lỗi với bộ lọc không hợp lệ
     */
    it('TC_DASHBOARD_SERVICE_LAST_TIME_FILTER_005 - Nên ném ra lỗi khi bộ lọc không hợp lệ', () => {
      // Sắp xếp (Arrange)
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');
      const invalidTimeFilter = 'InvalidFilter' as TimeFilter;

      // Thực thi & Kiểm tra (Act & Assert)
      expect(() => dashboardService.lastTimeFilterCreate(startDate, endDate, invalidTimeFilter))
        .toThrow('Unsupported time period for lastTimeFilterCreate.');
    });
  });
});
