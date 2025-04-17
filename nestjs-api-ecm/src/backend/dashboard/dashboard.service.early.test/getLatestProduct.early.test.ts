/**
 * File: getLatestProduct.early.test.ts
 * Mô tả: File kiểm thử đơn vị cho phương thức getLatestProduct của DashboardService
 * Module: Dashboard
 * Chức năng: Kiểm tra chức năng lấy danh sách sản phẩm mới nhất
 * Ngày tạo: 2023
 */

import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from '../dashboard.service';

/**
 * Test Suite: DashboardService - getLatestProduct
 * Mô tả: Bộ test cho phương thức getLatestProduct của DashboardService
 */
describe('DashboardService.getLatestProduct() method', () => {
  let dashboardService: DashboardService;
  
  /**
   * Mock cho các repository
   * Mô tả: Tạo mock cho các repository được sử dụng trong service
   */
  const mockOrderRepo = {};
  const mockOrderProductRepo = {};
  const mockImportRepo = {};
  const mockImportProRepo = {
    findLatestProducts: jest.fn(),
  };
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
     * Test case: TC_DASHBOARD_SERVICE_LATEST_PRODUCT_001
     * Mục tiêu: Kiểm tra phương thức getLatestProduct trả về danh sách sản phẩm mới nhất đúng
     * Input: Không có tham số đầu vào
     * Expected Output: Mảng các đối tượng sản phẩm mới nhất
     * Ghi chú: Kiểm tra luồng thành công cơ bản
     */
    it('TC_DASHBOARD_SERVICE_LATEST_PRODUCT_001 - Nên trả về danh sách sản phẩm mới nhất đúng', async () => {
      // Sắp xếp (Arrange)
      const mockLatestProducts = [
        { product_id: 'P001', product_name: 'Sản phẩm mới 1', created_at: '2023-04-15T10:00:00Z', price: 1500000 },
        { product_id: 'P002', product_name: 'Sản phẩm mới 2', created_at: '2023-04-14T09:30:00Z', price: 2000000 }
      ];
      
      mockImportProRepo.findLatestProducts.mockResolvedValue(mockLatestProducts);
      
      // Thực thi (Act)
      const result = await dashboardService.getLatestProduct();

      // Kiểm tra (Assert)
      expect(mockImportProRepo.findLatestProducts).toHaveBeenCalled();
      expect(result).toEqual(mockLatestProducts);
    });

    /**
     * Test case: TC_DASHBOARD_SERVICE_LATEST_PRODUCT_002
     * Mục tiêu: Kiểm tra phương thức getLatestProduct xử lý đúng khi repository trả về mảng rỗng
     * Input: Không có tham số đầu vào
     * Expected Output: Mảng rỗng
     * Ghi chú: Kiểm tra xử lý mảng rỗng
     */
    it('TC_DASHBOARD_SERVICE_LATEST_PRODUCT_002 - Nên trả về mảng rỗng khi repository trả về mảng rỗng', async () => {
      // Sắp xếp (Arrange)
      mockImportProRepo.findLatestProducts.mockResolvedValue([]);
      
      // Thực thi (Act)
      const result = await dashboardService.getLatestProduct();

      // Kiểm tra (Assert)
      expect(mockImportProRepo.findLatestProducts).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  /**
   * Nhóm test case: Các trường hợp ngoại lệ
   * Mô tả: Kiểm tra các trường hợp xử lý lỗi và ngoại lệ
   */
  describe('Edge cases', () => {
    /**
     * Test case: TC_DASHBOARD_SERVICE_LATEST_PRODUCT_003
     * Mục tiêu: Kiểm tra phương thức getLatestProduct xử lý lỗi khi repository ném ra lỗi
     * Input: Không có tham số đầu vào
     * Expected Output: Ném ra lỗi từ repository
     * Ghi chú: Kiểm tra xử lý lỗi từ repository
     */
    it('TC_DASHBOARD_SERVICE_LATEST_PRODUCT_003 - Nên ném ra lỗi khi repository gặp lỗi', async () => {
      // Sắp xếp (Arrange)
      const errorMessage = 'Product repository error';
      mockImportProRepo.findLatestProducts.mockRejectedValue(new Error(errorMessage));
      
      // Thực thi & Kiểm tra (Act & Assert)
      await expect(dashboardService.getLatestProduct())
        .rejects.toThrow(errorMessage);
      
      expect(mockImportProRepo.findLatestProducts).toHaveBeenCalled();
    });

    /**
     * Test case: TC_DASHBOARD_SERVICE_LATEST_PRODUCT_004
     * Mục tiêu: Kiểm tra phương thức getLatestProduct xử lý đúng khi repository trả về null
     * Input: Không có tham số đầu vào
     * Expected Output: Ném ra lỗi
     * Ghi chú: Kiểm tra xử lý giá trị null
     */
    it('TC_DASHBOARD_SERVICE_LATEST_PRODUCT_004 - Nên xử lý đúng khi repository trả về null', async () => {
      // Sắp xếp (Arrange)
      mockImportProRepo.findLatestProducts.mockResolvedValue(null);
      
      // Thực thi (Act)
      const result = await dashboardService.getLatestProduct();

      // Kiểm tra (Assert)
      expect(mockImportProRepo.findLatestProducts).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
});
