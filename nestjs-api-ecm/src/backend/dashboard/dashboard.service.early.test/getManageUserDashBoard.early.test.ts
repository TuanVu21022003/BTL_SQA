/**
 * File: getManageUserDashBoard.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho phương thức getManageUserDashBoard của DashboardService
 * Module: Dashboard
 * Chức năng: Kiểm tra chức năng lấy thống kê quản lý người dùng cho dashboard
 * Ngày tạo: 2023
 */

import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from '../dashboard.service';
import { OrderStatus } from 'src/share/Enum/Enum';

/**
 * Test Suite: DashboardService - getManageUserDashBoard
 * Mô tả: Bộ test cho phương thức getManageUserDashBoard của DashboardService
 */
describe('DashboardService.getManageUserDashBoard() method', () => {
  let dashboardService: DashboardService;
  
  /**
   * Mock cho các repository
   * Mô tả: Tạo mock cho các repository được sử dụng trong service
   */
  const mockOrderRepo = {
    createQueryBuilder: jest.fn(),
  };
  const mockOrderProductRepo = {};
  const mockImportRepo = {};
  const mockImportProRepo = {};
  const mockUserRepo = {
    createQueryBuilder: jest.fn(),
  };

  // Mock cho QueryBuilder
  const mockUserQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getCount: jest.fn(),
  };

  const mockOrderQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
  };

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
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mocks
    mockUserRepo.createQueryBuilder.mockReturnValue(mockUserQueryBuilder);
    mockOrderRepo.createQueryBuilder.mockReturnValue(mockOrderQueryBuilder);
    
    // Mock Date để có kết quả kiểm thử nhất quán
    jest.spyOn(global, 'Date').mockImplementation(() => new Date('2023-04-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * Nhóm test case: Các trường hợp thành công
   * Mô tả: Kiểm tra các trường hợp phương thức hoạt động đúng
   */
  describe('Happy paths', () => {
    /**
     * Test case: TC_DASHBOARD_SERVICE_MANAGE_USER_001
     * Mục tiêu: Kiểm tra phương thức getManageUserDashBoard trả về thống kê người dùng đúng
     * Input: Không có tham số đầu vào
     * Expected Output: Đối tượng chứa thống kê người dùng
     * Ghi chú: Kiểm tra luồng thành công cơ bản
     */
    it('TC_DASHBOARD_SERVICE_MANAGE_USER_001 - Nên trả về thống kê người dùng đúng', async () => {
      // Sắp xếp (Arrange)
      // Mock kết quả cho các truy vấn
      mockUserQueryBuilder.getCount
        .mockResolvedValueOnce(100) // totalUsers
        .mockResolvedValueOnce(15)  // usersThisWeek
        .mockResolvedValueOnce(10); // usersLastWeek
      
      mockOrderQueryBuilder.getRawOne
        .mockResolvedValueOnce({ userCount: 50 })  // userBoughtCount
        .mockResolvedValueOnce({ userCount: 8 })   // usersBoughtThisWeek
        .mockResolvedValueOnce({ userCount: 5 });  // usersBoughtLastWeek
      
      // Thực thi (Act)
      const result = await dashboardService.getManageUserDashBoard();

      // Kiểm tra (Assert)
      // Kiểm tra các truy vấn được gọi đúng cách
      expect(mockUserRepo.createQueryBuilder).toHaveBeenCalledTimes(3);
      expect(mockOrderRepo.createQueryBuilder).toHaveBeenCalledTimes(3);
      
      // Kiểm tra kết quả
      expect(result).toEqual({
        totalUsers: 100,
        usersThisWeek: 15,
        usersLastWeek: 10,
        usersBoughtThisWeek: { userCount: 8 },
        usersBoughtLastWeek: { userCount: 5 }
      });
    });
  });

  /**
   * Nhóm test case: Các trường hợp ngoại lệ
   * Mô tả: Kiểm tra các trường hợp xử lý lỗi và ngoại lệ
   */
  describe('Edge cases', () => {
    /**
     * Test case: TC_DASHBOARD_SERVICE_MANAGE_USER_002
     * Mục tiêu: Kiểm tra phương thức getManageUserDashBoard xử lý lỗi khi repository ném ra lỗi
     * Input: Không có tham số đầu vào
     * Expected Output: Đối tượng chứa thông báo lỗi
     * Ghi chú: Kiểm tra xử lý lỗi từ repository
     */
    it('TC_DASHBOARD_SERVICE_MANAGE_USER_002 - Nên xử lý lỗi khi repository gặp lỗi', async () => {
      // Sắp xếp (Arrange)
      const errorMessage = 'Database connection error';
      mockUserQueryBuilder.getCount.mockRejectedValue(new Error(errorMessage));
      
      // Spy console.error để kiểm tra log lỗi
      jest.spyOn(console, 'error').mockImplementation();
      
      // Thực thi (Act)
      const result = await dashboardService.getManageUserDashBoard();

      // Kiểm tra (Assert)
      expect(console.error).toHaveBeenCalled();
      expect(result).toHaveProperty('error');
      expect(result.error).toContain(errorMessage);
    });

    /**
     * Test case: TC_DASHBOARD_SERVICE_MANAGE_USER_003
     * Mục tiêu: Kiểm tra phương thức getManageUserDashBoard xử lý đúng khi repository trả về null
     * Input: Không có tham số đầu vào
     * Expected Output: Đối tượng với giá trị mặc định
     * Ghi chú: Kiểm tra xử lý giá trị null
     */
    it('TC_DASHBOARD_SERVICE_MANAGE_USER_003 - Nên xử lý đúng khi repository trả về null', async () => {
      // Sắp xếp (Arrange)
      mockUserQueryBuilder.getCount
        .mockResolvedValueOnce(null) // totalUsers
        .mockResolvedValueOnce(null) // usersThisWeek
        .mockResolvedValueOnce(null); // usersLastWeek
      
      mockOrderQueryBuilder.getRawOne
        .mockResolvedValueOnce(null) // userBoughtCount
        .mockResolvedValueOnce(null) // usersBoughtThisWeek
        .mockResolvedValueOnce(null); // usersBoughtLastWeek
      
      // Thực thi (Act)
      const result = await dashboardService.getManageUserDashBoard();

      // Kiểm tra (Assert)
      expect(result).toEqual({
        totalUsers: null,
        usersThisWeek: null,
        usersLastWeek: null,
        usersBoughtThisWeek: null,
        usersBoughtLastWeek: null
      });
    });

    /**
     * Test case: TC_DASHBOARD_SERVICE_MANAGE_USER_004
     * Mục tiêu: Kiểm tra phương thức getManageUserDashBoard xử lý đúng khi có lỗi không phải Error
     * Input: Không có tham số đầu vào
     * Expected Output: Đối tượng chứa thông báo lỗi
     * Ghi chú: Kiểm tra xử lý lỗi không phải kiểu Error
     */
    it('TC_DASHBOARD_SERVICE_MANAGE_USER_004 - Nên xử lý đúng khi có lỗi không phải Error', async () => {
      // Sắp xếp (Arrange)
      const errorObject = { code: 500, message: 'Database error' };
      mockUserQueryBuilder.getCount.mockRejectedValue(errorObject);
      
      // Spy console.error để kiểm tra log lỗi
      jest.spyOn(console, 'error').mockImplementation();
      
      // Thực thi (Act)
      const result = await dashboardService.getManageUserDashBoard();

      // Kiểm tra (Assert)
      expect(console.error).toHaveBeenCalled();
      expect(result).toHaveProperty('error');
      expect(result.error).toContain(JSON.stringify(errorObject));
    });
  });
});
