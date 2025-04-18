// Import các module cần thiết từ NestJS và các file liên quan
import { Test, TestingModule } from '@nestjs/testing';
import { LocationUserController } from './location_user.controller';
import { LocationUserService } from './location_user.service';
import { CreateLocationUserDto } from 'src/dto/locationUserDTO/create-location_user.dto';
import { UpdateLocationUserDto } from 'src/dto/locationUserDTO/update-location_user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { AuthGuard } from 'src/guards/JwtAuth.guard';
import { RolesGuard } from 'src/guards/Roles.guard';

/**
 * Mock các Guard xác thực và phân quyền
 * Bỏ qua việc xác thực để tập trung vào test logic
 */
jest.mock('src/guards/JwtAuth.guard', () => ({
  AuthGuard: jest.fn().mockImplementation(() => ({
    canActivate: () => true,
  })),
}));

// Bỏ qua kiểm tra quyền bằng cách mock RolesGuard
jest.mock('src/guards/Roles.guard', () => ({
  RolesGuard: jest.fn().mockImplementation(() => ({
    canActivate: () => true,
  })),
}));


describe('LocationUserController', () => {
  // Khai báo các biến sử dụng trong test
  let controller: LocationUserController;
  let service: LocationUserService;
  let jwtService: JwtService;

  /**
   * Mock các service được sử dụng trong controller
   * Định nghĩa các phương thức giả lập
   */
  const mockLocationUserService = {
    getList: jest.fn(),
    createLocation: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockUserService = {
    findOne: jest.fn(),
  };

  /**
   * Cấu hình và khởi tạo module test trước mỗi test case
   * Inject các dependency và override các guard
   */
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationUserController],
      providers: [
        { provide: LocationUserService, useValue: mockLocationUserService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: UserService, useValue: mockUserService },
      ],
    })
      .overrideGuard(AuthGuard) // Ghi đè AuthGuard bằng mock
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard) // Ghi đè RolesGuard bằng mock
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<LocationUserController>(LocationUserController);
    service = module.get<LocationUserService>(LocationUserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  /**
   * Dọn dẹp mock sau mỗi test case
   * Đảm bảo không có dữ liệu tồn đọng giữa các test
   */
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Mã: TC001
   * Test case: Kiểm tra khởi tạo controller
   * Mục tiêu: Đảm bảo controller và các dependency được khởi tạo đúng
   * Input: Không có
   * Output mong đợi: Các instance được định nghĩa
   */
  it('should be defined', () => {
    expect(controller).toBeDefined(); // Đảm bảo controller đã được tạo thành công
    expect(service).toBeDefined(); // Đảm bảo service đã được inject đúng
    expect(jwtService).toBeDefined(); // Đảm bảo jwtService đã được inject đúng
  });

  /**
  * Nhóm test cho chức năng lấy danh sách địa chỉ
  */
  describe('getAllLocation', () => {
    /**
     * Mã: TC002
     * Test case: Lấy danh sách địa chỉ của người dùng thành công
     * Mục tiêu: Kiểm tra việc lấy danh sách địa chỉ theo user_id
     * Input: user_id hợp lệ
     * Output mong đợi: Danh sách địa chỉ và thông tin tổng số bản ghi
     */
    it('should return locations for a user', async () => {
      const user_id = 'test-user-id';
      const mockLocations = [
        { id: '1', name: 'Location 1', user_id },
        { id: '2', name: 'Location 2', user_id },
      ];

      // Giả lập service trả về danh sách location
      mockLocationUserService.getList.mockResolvedValue({
        data: mockLocations,
        total: 2,
      });

      // Gọi controller
      const result = await controller.getAllLocation(user_id);

      // Kiểm tra gọi đúng tham số
      expect(service.getList).toHaveBeenCalledWith({ user_id });

      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: { data: mockLocations, total: 2 },
      });
    });

    /**
     * Mã: TC003
     * Test case: Xử lý lỗi khi lấy danh sách địa chỉ
     * Mục tiêu: Kiểm tra xử lý lỗi khi có vấn đề với database
     * Input: user_id hợp lệ
     * Output mong đợi: Thông báo lỗi với status 500
     * Ghi chú: Error path - trường hợp thất bại
     */
    it('should handle errors in getAllLocation', async () => {
      const user_id = 'test-user-id';

      
      mockLocationUserService.getList.mockRejectedValue(
        new Error('Database error'),
      );

      const result = await controller.getAllLocation(user_id);

      
      expect(result).toEqual({
        status: 500,
        message: 'Database error',
        success: false,
      });
    });
  });

  /**
   * Nhóm test cho chức năng lấy danh sách địa chỉ (Admin view)
   */
  describe('getAllLocationAdmin', () => {
    /**
     * Mã: TC004
     * Test case: Admin lấy danh sách địa chỉ thành công
     * Mục tiêu: Kiểm tra chức năng xem danh sách địa chỉ dành cho admin
     * Input: user_id của admin
     * Output mong đợi: Danh sách địa chỉ và tổng số bản ghi
     */
    it('should return locations for admin view', async () => {
      // Dữ liệu mẫu cho test
      const user_id = 'admin-user-id';
      const mockLocations = [
        { id: '1', name: 'Location 1', user_id },
        { id: '2', name: 'Location 2', user_id },
      ];

      mockLocationUserService.getList.mockResolvedValue({
        data: mockLocations,
        total: 2,
      });

      const result = await controller.getAllLocationAdmin(user_id);

      expect(service.getList).toHaveBeenCalledWith({ user_id });

      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: { data: mockLocations, total: 2 },
      });
    });

    /**
     * Mã: TC005
     * Test case: Xử lý lỗi khi admin lấy danh sách
     * Mục tiêu: Kiểm tra xử lý lỗi trong view admin
     * Input: 
     * - tham số user_id của admin
     * - Giá trị mock từ service : Error với message 'Admin access error'
     * Output mong đợi: Thông báo lỗi với status 500, message : Admin access error
     */
    it('should handle errors in getAllLocationAdmin', async () => {
      // Dữ liệu mẫu cho test
      const user_id = 'admin-user-id';
      mockLocationUserService.getList.mockRejectedValue(
        new Error('Admin access error'),
      );

      const result = await controller.getAllLocationAdmin(user_id);

      expect(result).toEqual({
        status: 500,
        message: 'Admin access error',
        success: false,
      });
    });
  });

  /**
   * Nhóm test cho chức năng tạo mới địa chỉ
   */
  describe('create', () => {
    /**
     * Mã: TC006
     * Test case: Tạo mới địa chỉ thành công
     * Mục tiêu: Kiểm tra việc tạo mới địa chỉ với dữ liệu hợp lệ
     * Input: 1 đối tượng CreateLocationUserDto chứa đầy đủ các trường thuộc tính
     * Output mong đợi: Thông tin địa chỉ mới được tạo
     */
    it('should create a new location', async () => {
      // Dữ liệu mẫu cho test
      const createDto: CreateLocationUserDto = {
        name: 'New Location',
        address: '123 Street',
        phone: '1234567890',
        default_location: true,
        user_id: 'test-user-id',
      };

      const mockCreatedLocation = { id: '1', ...createDto };

      mockLocationUserService.createLocation.mockResolvedValue(
        mockCreatedLocation,
      );

      const result = await controller.create(createDto);

      
      expect(service.createLocation).toHaveBeenCalledWith(createDto);

      
      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: mockCreatedLocation,
      });
    });

    /**
     * Mã: TC007
     * Test case: Xử lý lỗi khi tạo địa chỉ
     * Mục tiêu: Kiểm tra xử lý lỗi trong quá trình tạo địa chỉ
     * Input: một đối tượng CreateLocationUserDto chứa đầy đủ các trường thuộc tính
     * Output mong đợi: Thông báo lỗi với status 500, message Creation failed
     */
    it('should handle errors in create', async () => {
      // Dữ liệu mẫu cho test
      const createDto: CreateLocationUserDto = {
        name: 'New Location',
        address: '123 Street',
        phone: '1234567890',
        default_location: true,
        user_id: 'test-user-id',
      };

      mockLocationUserService.createLocation.mockRejectedValue(
        new Error('Creation failed'),
      );

      const result = await controller.create(createDto);

      expect(result).toEqual({
        status: 500,
        message: 'Creation failed',
        success: false,
      });
    });
  });

   /**
   * Nhóm test cho chức năng cập nhật địa chỉ
   */
  describe('update', () => {
    
    /**
     * Mã: TC008
     * Test case: Cập nhật địa chỉ thành công
     * Mục tiêu: Kiểm tra việc cập nhật thông tin địa chỉ
     * Input: một đối tượng UpdateLocationUserDto chứa đầy đủ các trường thuộc tính
     * Output mong đợi: Thông tin địa chỉ sau khi cập nhật
     */
    it('should update a location', async () => {
      // Dữ liệu mẫu cho test
      const updateDto: UpdateLocationUserDto = {
        id: '1',
        name: 'Updated Location',
        address: '456 Street',
        phone: '0987654321',
        default_location: false,
        user_id: 'test-user-id',
      };

      const mockUpdatedLocation = { ...updateDto };

      mockLocationUserService.update.mockResolvedValue(mockUpdatedLocation);

      const result = await controller.update(updateDto);

      expect(service.update).toHaveBeenCalledWith(updateDto);
      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: mockUpdatedLocation,
      });
    });

    
    /**
     * Mã: TC009
     * Test case: Xử lý lỗi khi cập nhật địa chỉ
     * Mục tiêu: Kiểm tra xử lý lỗi trong quá trình cập nhật
     * Input: một đối tượng UpdateLocationUserDto chứa đầy đủ các trường thuộc tính
     * Output mong đợi: Thông báo lỗi với status 500, message Update failed
     */
    it('should handle errors in update', async () => {
      // Dữ liệu mẫu cho test
      const updateDto: UpdateLocationUserDto = {
        id: '1',
        name: 'Updated Location',
        address: '456 Street',
        phone: '0987654321',
        default_location: false,
        user_id: 'test-user-id',
      };

      mockLocationUserService.update.mockRejectedValue(
        new Error('Update failed'),
      );

      const result = await controller.update(updateDto);

      expect(result).toEqual({
        status: 500,
        message: 'Update failed',
        success: false,
      });
    });
  });

  /**
   * Nhóm test cho chức năng xóa địa chỉ
   */
  describe('remove', () => {
    
    /**
     * Mã: TC010
     * Test case: Xóa địa chỉ thành công
     * Mục tiêu: Kiểm tra việc xóa địa chỉ
     * Input: ID địa chỉ cần xóa
     * Output mong đợi: Kết quả xóa thành công
     */
    it('should delete a location', async () => {
      // Dữ liệu mẫu cho test
      const locationId = 'test-location-id';
      const mockDeleteResult = { affected: 1 };

      mockLocationUserService.delete.mockResolvedValue(mockDeleteResult);

      const result = await controller.remove(locationId);

      expect(service.delete).toHaveBeenCalledWith(locationId);
      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: mockDeleteResult,
      });
    });

   /**
     * Mã: TC011
     * Test case: Xử lý lỗi khi xóa địa chỉ
     * Mục tiêu: Kiểm tra xử lý lỗi trong quá trình xóa
     * Input: 
     * - ID địa chỉ cần xóa
     * - Giá trị mock từ service : Error với message 'Delete failed'
     * Output mong đợi: Thông báo lỗi với status 500, message Delete failed
     */
    it('should handle errors in delete', async () => {
      // Dữ liệu mẫu cho test
      const locationId = 'test-location-id';
      mockLocationUserService.delete.mockRejectedValue(
        new Error('Delete failed'),
      );

      const result = await controller.remove(locationId);

      expect(result).toEqual({
        status: 500,
        message: 'Delete failed',
        success: false,
      });
    });
  });
});
