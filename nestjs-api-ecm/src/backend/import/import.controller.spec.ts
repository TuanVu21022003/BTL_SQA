// Import các module cần thiết để tạo và test controller
import { Test, TestingModule } from '@nestjs/testing';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';
import { CreateImportDTO } from 'src/dto/importDTO/import.create.dto';
import { UpdateImpotyDTO } from 'src/dto/importDTO/import.update.dto';
import { AuthGuard } from 'src/guards/JwtAuth.guard';
import { RolesGuard } from 'src/guards/Roles.guard';

/**
 * Mock các Guard xác thực và phân quyền
 */
const mockAuthGuard = { canActivate: jest.fn(() => true) };
const mockRolesGuard = { canActivate: jest.fn(() => true) };

describe('ImportController', () => {
  let controller: ImportController;
  let service: ImportService;

  /**
   * Mock service với các phương thức cần thiết cho testing
   */
  const mockImportService = {
    create: jest.fn(),
    getImportCodeMax: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  /**
   * Cấu hình và khởi tạo testing module trước mỗi test case
   */
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImportController],
      providers: [
        {
          provide: ImportService,
          useValue: mockImportService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<ImportController>(ImportController);
    service = module.get<ImportService>(ImportService);
  });

  /**
   * Xóa tất cả mock data sau mỗi test case
   */
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Kiểm tra controller đã được khởi tạo thành công
   */
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  /**
   * Test các chức năng của phương thức create
   */
  describe('create', () => {
    /**
     * Test case: Tạo mới đơn nhập hàng thành công
     * Mục đích: Kiểm tra việc tạo mới đơn nhập hàng với dữ liệu hợp lệ
     * Input : một đối tượng CreateImportDTO với các thông tin hợp lệ
     * Kết quả mong đợi: Trả về thông tin đơn nhập hàng mới với status 200, message SUCCESS!
     */
    it('should create a new import record', async () => {
      // Chuẩn bị dữ liệu test
      const createDto: CreateImportDTO = {
        totalAmount: 1000,
        import_code: 'IMP001',
        user_id: '1',
        products: [
          {
            product_id: '1',
            quantity: 10,
            price_in: 100,
          },
        ],
      };
      const expectedResult = { id: '1', ...createDto };
      mockImportService.create.mockResolvedValue(expectedResult);

      // Thực thi
      const result = await controller.create(createDto);

      // Kiểm tra kết quả
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: expectedResult,
      });
    });

    /**
     * Test case: Xử lý lỗi khi tạo đơn nhập hàng thất bại
     * Mục đích: Kiểm tra xử lý lỗi khi có vấn đề trong quá trình tạo đơn
     * Input : 
     * - một CreateImportDTO với các thông tin không hợp lệ
     * - Giá trị mock từ service : Error với message 'Creation failed'
     * Kết quả mong đợi: Trả về thông báo lỗi với status 500, message Creation failed
     */
    it('should handle errors when create fails', async () => {
      const createDto: CreateImportDTO = {
        totalAmount: 1000,
        import_code: 'IMP001',
        user_id: '1',
        products: [
          {
            product_id: '1',
            quantity: 10,
            price_in: 100,
          },
        ],
      };
      const error = new Error('Creation failed');
      mockImportService.create.mockRejectedValue(error);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual({
        status: 500,
        message: 'Creation failed',
        success: false,
      });
    });
  });

  /**
   * Test các chức năng của phương thức getImportCodeMax
   */
  describe('getImportCodeMax', () => {
    /**
     * Test case: Lấy mã nhập hàng lớn nhất thành công
     * Mục đích: Kiểm tra việc lấy mã nhập hàng tự động tăng
     * Input: Giá trị mock từ service: mã nhập hàng lớn nhất hiện tại ('IMP999')
     * Kết quả mong đợi: Trả về mã nhập hàng mới với status 200, message SUCCESS!
     */
    it('should return the max import code', async () => {
      const maxCode = 'IMP999';
      mockImportService.getImportCodeMax.mockResolvedValue(maxCode);

      const result = await controller.getImportCodeMax();

      expect(service.getImportCodeMax).toHaveBeenCalled();
      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: maxCode,
      });
    });

    /**
     * Test case: Xử lý lỗi khi không lấy được mã nhập hàng
     * Mục đích: Kiểm tra xử lý lỗi khi có vấn đề với database
     * Input : Giá trị mock từ service: Error với message 'Database error'
     * Kết quả mong đợi: Trả về thông báo lỗi với status 500, message Database error
     */
    it('should handle errors when getting max code fails', async () => {
      const error = new Error('Database error');
      mockImportService.getImportCodeMax.mockRejectedValue(error);

      const result = await controller.getImportCodeMax();

      expect(service.getImportCodeMax).toHaveBeenCalled();
      expect(result).toEqual({
        status: 500,
        message: 'Database error',
        success: false,
      });
    });
  });

  /**
   * Test các chức năng của phương thức findAll
   */
  describe('findAll', () => {
    /**
     * Test case: Lấy danh sách đơn nhập hàng theo phân trang
     * Mục đích: Kiểm tra việc lấy danh sách có phân trang
     * Input : 
     * - số trang hiện tại, số lượng bản ghi trên mỗi trang, 
     * - Giá trị mock từ service : Danh sách gồm 2 đơn nhập hàng
     * Kết quả mong đợi: Trả về danh sách đơn nhập hàng với status 200, message SUCCESS!
     */
    it('should return all import records with pagination', async () => {
      const page = 1;
      const limit = 10;
      const mockImports = [
        { id: '1', import_code: 'IMP001' },
        { id: '2', import_code: 'IMP002' },
      ];
      mockImportService.findAll.mockResolvedValue(mockImports);

      const result = await controller.findAll(page, limit);

      expect(service.findAll).toHaveBeenCalledWith(page, limit);
      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: mockImports,
      });
    });

    /**
     * Test case: Xử lý lỗi khi không lấy được danh sách
     * Mục đích: Kiểm tra xử lý lỗi khi có vấn đề với database
     * Input : 
     * - số trang hiện tại, số lượng bản ghi trên 1 trang
     * - Giá trị mock từ service : Error với message 'Find all failed'
     * Kết quả mong đợi: Trả về thông báo lỗi với status 500, message Find all failed
     */
    it('should handle errors when finding all records fails', async () => {
      const page = 1;
      const limit = 10;
      const error = new Error('Find all failed');
      mockImportService.findAll.mockRejectedValue(error);

      const result = await controller.findAll(page, limit);

      expect(service.findAll).toHaveBeenCalledWith(page, limit);
      expect(result).toEqual({
        status: 500,
        message: 'Find all failed',
        success: false,
      });
    });
  });

  /**
   * Test các chức năng của phương thức findOne
   */
  describe('findOne', () => {
    /**
     * Test case: Lấy thông tin một đơn nhập hàng theo ID
     * Mục đích: Kiểm tra việc lấy chi tiết đơn nhập hàng
     * Input :
     * -ID của đơn nhập hàng  cần tìm
     * -Giá trị mock từ service : Thông tin đơn nhập hàng
     * Kết quả mong đợi: Trả về thông tin đơn nhập hàng với status 200, message SUCCESS!
     */
    it('should return one import record by id', async () => {
      const importId = '1';
      const mockImport = { id: importId, import_code: 'IMP001' };
      mockImportService.findOne.mockResolvedValue(mockImport);

      const result = await controller.findOne(importId);

      expect(service.findOne).toHaveBeenCalledWith(importId);
      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: mockImport,
      });
    });

    /**
     * Test case: Xử lý lỗi khi không tìm thấy đơn nhập hàng
     * Mục đích: Kiểm tra xử lý lỗi khi ID không tồn tại
     * Input :
     * - ID của đơn nhập hàng không tồn tại
     * - Giá trị mock từ service : Error với message 'Record not found'
     * Kết quả mong đợi: Trả về thông báo lỗi với status 500, message Record not found
     */
    it('should handle errors when finding one record fails', async () => {
      const importId = '1';
      const error = new Error('Record not found');
      mockImportService.findOne.mockRejectedValue(error);

      const result = await controller.findOne(importId);

      expect(service.findOne).toHaveBeenCalledWith(importId);
      expect(result).toEqual({
        status: 500,
        message: 'Record not found',
        success: false,
      });
    });
  });

  /**
   * Test các chức năng của phương thức update
   */
  describe('update', () => {
    /**
     * Test case: Cập nhật thông tin đơn nhập hàng
     * Mục đích: Kiểm tra việc cập nhật thông tin đơn nhập hàng
     * Input : 
     * - Đối Tượng UpdateImpotyDTO chứa thông tin cập nhật
     * - Giá trị mock từ service : Thông tin đơn nhập hàng sau khi cập nhật
     * Kết quả mong đợi: Trả về thông tin đơn hàng đã cập nhật với status 200, message SUCCESS!
     */
    it('should update an import record', async () => {
      const updateDto: UpdateImpotyDTO = {
        import_id: '1',
        import_code: 'IMP001',
        user_id: '1',
        totalAmount: 1500,
        products: [
          {
            product_id: '1',
            quantity: 15,
            price_in: 100,
          },
        ],
      };
      const updatedImport = {
        id: '1',
        import_code: 'IMP001',
        user_id: '1',
        totalAmount: 1500,
        products: [
          {
            product_id: '1',
            quantity: 15,
            price_in: 100,
          },
        ],
      };
      mockImportService.update.mockResolvedValue(updatedImport);

      const result = await controller.update(updateDto);

      expect(service.update).toHaveBeenCalledWith(updateDto);
      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: updatedImport,
      });
    });

    /**
     * Test case: Xử lý lỗi khi cập nhật đơn nhập hàng thất bại
     * Mục đích: Kiểm tra xử lý lỗi khi có vấn đề trong quá trình cập nhật
     * Input: 
     * - đối tượng UpdateImpotyDTO chứa thông tin cập nhật đơn nhập hàng
     * - Giá trị mock từ service : Error với message 'Update failed'
     * Kết quả mong đợi:
     * - Trả về thông báo lỗi với status 500, message Update failed
     */
    it('should handle errors when update fails', async () => {
      // Arrange: Chuẩn bị dữ liệu test
      const updateDto: UpdateImpotyDTO = {
        import_id: '1',
        import_code: 'IMP001',
        user_id: '1',
        totalAmount: 1500,
        products: [
          {
            product_id: '1',
            quantity: 15,
            price_in: 100,
          },
        ],
      };
      const error = new Error('Update failed');
      mockImportService.update.mockRejectedValue(error);

      // Act: Thực thi hành động cập nhật
      const result = await controller.update(updateDto);

      // Assert: Kiểm tra kết quả
      expect(service.update).toHaveBeenCalledWith(updateDto);
      expect(result).toEqual({
        status: 500,
        message: 'Update failed',
        success: false,
      });
    });
  });

  describe('delete', () => {
    /**
     * Test case: Xóa đơn nhập hàng thành công
     * Mục đích: Kiểm tra việc xóa đơn nhập hàng hoạt động bình thường
     * Input: ID của đơn nhập hàng cần xóa
     * Kết quả mong đợi:
     * - Trả về kết quả thành công với status 200
     * - Service delete được gọi với đúng ID
     * - Response chứa thông tin xác nhận xóa thành công
     */
    it('should delete an import record', async () => {
      // Arrange: Chuẩn bị dữ liệu test
      const importId = '1';
      const deleteResult = { deleted: true };
      mockImportService.delete.mockResolvedValue(deleteResult);

      // Act: Thực thi hành động xóa
      const result = await controller.delete(importId);

      // Assert: Kiểm tra kết quả
      expect(service.delete).toHaveBeenCalledWith(importId);
      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: deleteResult,
      });
    });

    /**
     * Test case: Xử lý lỗi khi xóa đơn nhập hàng thất bại
     * Mục đích: Kiểm tra xử lý lỗi khi có vấn đề trong quá trình xóa
     * Input: ID của đơn nhập hàng cần xóa
     * Kết quả mong đợi:
     * - Trả về thông báo lỗi với status 500
     * - Service delete được gọi với đúng ID
     * - Response chứa thông tin lỗi phù hợp
     */
    it('should handle errors when delete fails', async () => {
      // Arrange: Chuẩn bị dữ liệu test
      const importId = '1';
      const error = new Error('Delete failed');
      mockImportService.delete.mockRejectedValue(error);

      // Act: Thực thi hành động xóa
      const result = await controller.delete(importId);

      // Assert: Kiểm tra kết quả
      expect(service.delete).toHaveBeenCalledWith(importId);
      expect(result).toEqual({
        status: 500,
        message: 'Delete failed',
        success: false,
      });
    });
  });
});
