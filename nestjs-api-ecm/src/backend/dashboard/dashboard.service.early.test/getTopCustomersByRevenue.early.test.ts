/**
 * File: getTopCustomersByRevenue.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho phương thức getTopCustomersByRevenue của DashboardService
 * Module: Dashboard
 * Chức năng: Kiểm tra chức năng lấy danh sách khách hàng có doanh thu cao nhất
 * Ngày tạo: 2023
 */

import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from '../dashboard.service';
import { TimeFilter } from 'src/share/Enum/Enum';

/**
 * Test Suite: DashboardService - getTopCustomersByRevenue
 * Mô tả: Bộ test cho phương thức getTopCustomersByRevenue của DashboardService
 */
describe('DashboardService.getTopCustomersByRevenue() method', () => {
  let dashboardService: DashboardService;
  
  /**
   * Mock cho các repository
   * Mô tả: Tạo mock cho các repository được sử dụng trong service
   */
  const mockOrderRepo = {
    getTopCustomersByRevenue: jest.fn(),
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
     * Test case: TC_DASHBOARD_SERVICE_TOP_CUSTOMERS_001
     * Mục tiêu: Kiểm tra phương thức getTopCustomersByRevenue trả về danh sách khách hàng có doanh thu cao đúng
     * Input: timeFilter = TimeFilter.Week
     * Expected Output: Mảng các đối tượng khách hàng có doanh thu cao
     * Ghi chú: Kiểm tra luồng thành công cơ bản
     */
    it('TC_DASHBOARD_SERVICE_TOP_CUSTOMERS_001 - Nên trả về danh sách khách hàng có doanh thu cao đúng', async () => {
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
      
      // Mock getTopCustomersByRevenue
      const mockTopCustomers = [
        { user_id: 'U001', user_name: 'Nguyễn Văn A', total_revenue: 8000000, order_count: 5 },
        { user_id: 'U002', user_name: 'Trần Thị B', total_revenue: 6000000, order_count: 4 }
      ];
      
      mockOrderRepo.getTopCustomersByRevenue.mockResolvedValue(mockTopCustomers);
      
      // Thực thi (Act)
      const result = await dashboardService.getTopCustomersByRevenue(timeFilter);

      // Kiểm tra (Assert)
      expect(dashboardService.timeFilterCreate).toHaveBeenCalledWith(timeFilter);
      expect(dashboardService.lastTimeFilterCreate).toHaveBeenCalledWith(mockStartDate, mockEndDate, timeFilter);
      expect(mockOrderRepo.getTopCustomersByRevenue).toHaveBeenCalledWith(mockStartDate, mockEndDate);
      
      // Kiểm tra kết quả
      expect(result).toEqual(mockTopCustomers);
    });

    /**
     * Test case: TC_DASHBOARD_SERVICE_TOP_CUSTOMERS_002
     * Mục tiêu: Kiểm tra phương thức getTopCustomersByRevenue hoạt động đúng với các bộ lọc thời gian khác nhau
     * Input: timeFilter = TimeFilter.Month
     * Expected Output: Mảng các đối tượng khách hàng có doanh thu cao
     * Ghi chú: Kiểm tra với bộ lọc theo tháng
     */
    it('TC_DASHBOARD_SERVICE_TOP_CUSTOMERS_002 - Nên hoạt động đúng với bộ lọc "Tháng"', async () => {
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
      
      // Mock getTopCustomersByRevenue
      const mockTopCustomers = [
        { user_id: 'U003', user_name: 'Lê Văn C', total_revenue: 25000000, order_count: 15 },
        { user_id: 'U001', user_name: 'Nguyễn Văn A', total_revenue: 20000000, order_count: 12 }
      ];
      
      mockOrderRepo.getTopCustomersByRevenue.mockResolvedValue(mockTopCustomers);
      
      // Thực thi (Act)
      const result = await dashboardService.getTopCustomersByRevenue(timeFilter);

      // Kiểm tra (Assert)
      expect(dashboardService.timeFilterCreate).toHaveBeenCalledWith(timeFilter);
      expect(dashboardService.lastTimeFilterCreate).toHaveBeenCalledWith(mockStartDate, mockEndDate, timeFilter);
      expect(mockOrderRepo.getTopCustomersByRevenue).toHaveBeenCalledWith(mockStartDate, mockEndDate);
      
      // Kiểm tra kết quả
      expect(result).toEqual(mockTopCustomers);
    });
  });

  /**
   * Nhóm test case: Các trường hợp ngoại lệ
   * Mô tả: Kiểm tra các trường hợp xử lý lỗi và ngoại lệ
   */
  describe('Edge cases', () => {
    /**
     * Test case: TC_DASHBOARD_SERVICE_TOP_CUSTOMERS_003
     * Mục tiêu: Kiểm tra phương thức getTopCustomersByRevenue xử lý đúng khi repository trả về mảng rỗng
     * Input: timeFilter = TimeFilter.Quarter
     * Expected Output: Mảng rỗng
     * Ghi chú: Kiểm tra xử lý mảng rỗng
     */
    it('TC_DASHBOARD_SERVICE_TOP_CUSTOMERS_003 - Nên trả về mảng rỗng khi repository trả về mảng rỗng', async () => {
      // Sắp xếp (Arrange)
      const timeFilter = TimeFilter.Quarter;
      const mockStartDate = new Date('2023-04-01');
      const mockEndDate = new Date('2023-06-30');
      const mockLastStartDate = new Date('2023-01-01');
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
      
      // Mock getTopCustomersByRevenue trả về mảng rỗng
      mockOrderRepo.getTopCustomersByRevenue.mockResolvedValue([]);
      
      // Thực thi (Act)
      const result = await dashboardService.getTopCustomersByRevenue(timeFilter);

      // Kiểm tra (Assert)
      expect(dashboardService.timeFilterCreate).toHaveBeenCalledWith(timeFilter);
      expect(dashboardService.lastTimeFilterCreate).toHaveBeenCalledWith(mockStartDate, mockEndDate, timeFilter);
      expect(mockOrderRepo.getTopCustomersByRevenue).toHaveBeenCalledWith(mockStartDate, mockEndDate);
      expect(result).toEqual([]);
    });

    /**
     * Test case: TC_DASHBOARD_SERVICE_TOP_CUSTOMERS_004
     * Mục tiêu: Kiểm tra phương thức getTopCustomersByRevenue xử lý lỗi khi repository ném ra lỗi
     * Input: timeFilter = TimeFilter.Year
     * Expected Output: Ném ra lỗi từ repository
     * Ghi chú: Kiểm tra xử lý lỗi từ repository
     */
    it('TC_DASHBOARD_SERVICE_TOP_CUSTOMERS_004 - Nên ném ra lỗi khi repository gặp lỗi', async () => {
      // Sắp xếp (Arrange)
      const timeFilter = TimeFilter.Year;
      const mockStartDate = new Date('2023-01-01');
      const mockEndDate = new Date('2023-12-31');
      const mockLastStartDate = new Date('2022-01-01');
      const mockLastEndDate = new Date('2022-12-31');
      
      // Mock timeFilterCreate và lastTimeFilterCreate
      dashboardService.timeFilterCreate = jest.fn().mockReturnValue({
        startDate: mockStartDate,
        endDate: mockEndDate
      });
      
      dashboardService.lastTimeFilterCreate = jest.fn().mockReturnValue({
        lastStartDate: mockLastStartDate,
        lastEndDate: mockLastEndDate
      });
      
      // Mock getTopCustomersByRevenue để ném ra lỗi
      const errorMessage = 'User repository error';
      mockOrderRepo.getTopCustomersByRevenue.mockRejectedValue(new Error(errorMessage));
      
      // Thực thi & Kiểm tra (Act & Assert)
      await expect(dashboardService.getTopCustomersByRevenue(timeFilter))
        .rejects.toThrow(errorMessage);
      
      expect(dashboardService.timeFilterCreate).toHaveBeenCalledWith(timeFilter);
      expect(dashboardService.lastTimeFilterCreate).toHaveBeenCalledWith(mockStartDate, mockEndDate, timeFilter);
      expect(mockOrderRepo.getTopCustomersByRevenue).toHaveBeenCalledWith(mockStartDate, mockEndDate);
    });
  });
});
