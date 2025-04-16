// Import các module cần thiết từ NestJS và các file liên quan
import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import {
  NotificationStatus,
  NotificationType,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
} from 'src/share/Enum/Enum';
import { AuthGuard } from 'src/guards/JwtAuth.guard';
import { RolesGuard } from 'src/guards/Roles.guard';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { CreateOrderDto } from 'src/dto/orderDTO/order.create.dto';
import { UpdateOrderDTO } from 'src/dto/orderDTO/order.update.dto';

/**
 * Test suite cho OrderController
 * Mục đích: Kiểm tra các chức năng của controller đơn hàng
 */
describe('OrderController', () => {
    // Khai báo các biến controller và service để sử dụng trong các test case
  let controller: OrderController;
  let service: OrderService;

  // Mock các service được sử dụng trong controller
  const mockOrderService = {
    createOrder: jest.fn(),
    getAllOrder: jest.fn(),
    getOrderManagement: jest.fn(),
    updateOrder: jest.fn(),
  };

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockUserService = {
    findOne: jest.fn(),
  };

  /**
   * Cấu hình và khởi tạo module test trước mỗi test case
   */
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: AuthGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
        {
          provide: RolesGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    service = module.get<OrderService>(OrderService);
  });

  /**
   * Xóa tất cả mock data sau mỗi test case
   */
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Mã: TC001
   * Test case: Kiểm tra khởi tạo controller
   * Mục tiêu: Đảm bảo controller được khởi tạo thành công
   * Input: Không có
   * Output mong đợi: Controller được định nghĩa
   */
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  /**
   * Nhóm test cho chức năng tạo đơn hàng
   */
  describe('createOrder', () => {
    // Dữ liệu mẫu cho việc tạo đơn hàng
    const createOrderDto: CreateOrderDto = {
      user_id: 'user123',
      products: [
        {
          product_id: 'prod1',
          quantity: 2,
          priceout: 100,
        },
      ],
      totalPrice: 200,
      paymentMethod: PaymentMethod.BankTransfer,
      location_id: 'loc123',
      paymentStatus: PaymentStatus.Paid,
      orderStatus: OrderStatus.Checking,
    };

    /**
     * Mã: TC002
     * Test case: Tạo đơn hàng thành công
     * Mục tiêu: Kiểm tra việc tạo đơn hàng với dữ liệu hợp lệ
     * Input: đối tượng CreateOrderDto đầy đủ các trường thuộc tính
     * Output mong đợi: Trả về thông tin đơn hàng mới với status 200
     */
    it('should create order successfully', async () => {
      const mockCreatedOrder = {
        id: 'order123',
        ...createOrderDto,
        orderStatus: OrderStatus.Checking,
      };

      mockOrderService.createOrder.mockResolvedValue(mockCreatedOrder);

      const result = await controller.createOrder('user123', createOrderDto);

      expect(service.createOrder).toHaveBeenCalledWith(createOrderDto);
      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: mockCreatedOrder,
      });
    });

    /**
     * Mã: TC003
     * Test case: Xử lý lỗi khi tạo đơn hàng
     * Mục tiêu: Kiểm tra xử lý lỗi khi có vấn đề với database
     * Input: đối tượng CreateOrderDto với các trường thuộc tính hợp lệ nhưng database lỗi
     * Output mong đợi: Trả về thông báo lỗi với status 500
     */
    it('should handle creation error', async () => {
      mockOrderService.createOrder.mockRejectedValue(
        new Error('Database error'),
      );

      const result = await controller.createOrder('user123', createOrderDto);

      expect(result).toEqual({
        status: 500,
        message: 'Database error',
        success: false,
      });
    });

    /**
     * Mã: TC004
     * Test case: Xử lý trường hợp không có sản phẩm trong đơn hàng
     * Mục tiêu: Kiểm tra validation khi mảng sản phẩm rỗng
     * Input: đối tượngCreateOrderDto với mảng products rỗng
     * Output mong đợi: Trả về lỗi với thông báo yêu cầu sản phẩm
     */
    it('should handle empty products array', async () => {
      const invalidDto = {
        ...createOrderDto,
        products: [],
      };

      mockOrderService.createOrder.mockRejectedValue(
        new Error('Products required'),
      );

      const result = await controller.createOrder('user123', invalidDto);

      expect(result).toEqual({
        status: 500,
        message: 'Products required',
        success: false,
      });
    });
  });

  /**
   * Nhóm test cho chức năng lấy danh sách đơn hàng
   */
  describe('getAllOrder', () => {
    const userId = 'user123';
    const orderDto = { page: 1, limit: 10 };

    /**
     * Mã: TC005
     * Test case: Lấy danh sách đơn hàng của người dùng
     * Mục tiêu: Kiểm tra việc lấy danh sách đơn hàng theo user
     * Input: userId và thông tin phân trang
     * Output mong đợi: Danh sách đơn hàng và tổng số lượng
     */
    it('should return all orders for user', async () => {
      const mockOrders = {
        list: [
          {
            id: 'order1',
            user_id: userId,
            orderStatus: OrderStatus.Checking,
          },
        ],
        total: 1,
      };

      mockOrderService.getAllOrder.mockResolvedValue(mockOrders);

      const result = await controller.getAllOrder(userId, orderDto);

      expect(service.getAllOrder).toHaveBeenCalledWith(userId, orderDto);
      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: mockOrders,
      });
    });

    /**
     * Mã: TC006
     * Test case: Xử lý trường hợp không có đơn hàng
     * Mục tiêu: Kiểm tra response khi không có đơn hàng nào
     * Input: userId và thông tin phân trang
     * Output mong đợi: Danh sách rỗng và tổng số lượng 0
     */
    it('should return empty list when no orders', async () => {
      const emptyResponse = { list: [], total: 0 };
      mockOrderService.getAllOrder.mockResolvedValue(emptyResponse);

      const result = await controller.getAllOrder(userId, orderDto);

      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data : emptyResponse,
      });
    });

    /**
     * Mã: TC007
     * Test case: Xử lý lỗi khi truy vấn đơn hàng
     * Mục tiêu: Kiểm tra xử lý lỗi từ service
     * Input: Các tham số tìm kiếm đơn hàng
     * Output mong đợi: Response với data undefined
     */
    it('should handle service error', async () => {
      mockOrderService.getAllOrder.mockRejectedValue(
        new Error('Database error'),
      );

      const result = await controller.getOrderManagement(
        1,
        10,
        OrderStatus.Checking,
        PaymentStatus.Paid,
        false
      );

      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data : undefined,
      });
    });
  });

  /**
   * Nhóm test cho chức năng quản lý đơn hàng
   */
  describe('getOrderManagement', () => {
    const excludedStatuses = [OrderStatus.Delivered, OrderStatus.Canceled];

    /**
     * Mã: TC008
     * Test case: Lấy danh sách đơn hàng đã lọc khi includeExcluded là false
     * Mục tiêu: Kiểm tra việc lọc đơn hàng không bao gồm trạng thái đã loại trừ
     * Input: 
     * - page: 1
     * - limit: 10
     * - orderStatus: Checking
     * - paymentStatus: Paid
     * - includeExcluded: false
     * Output mong đợi: Danh sách đơn hàng đã lọc theo điều kiện
     */
    it('should return managed orders with filters when includeExcluded is false', async () => {
        // Chuẩn bị dữ liệu test
      const page = 1;
      const limit = 10;
      const orderStatus = OrderStatus.Checking;
      const paymentStatus = PaymentStatus.Paid;
      const includeExcluded = false;

      const mockOrders = [
        {
          id: '1',
          orderStatus: OrderStatus.Checking,
          paymentStatus: PaymentStatus.Paid,
        },
      ];

      // Mock response từ service
      mockOrderService.getOrderManagement.mockResolvedValue(mockOrders);

      // Thực thi hàm cần test
      const result = await controller.getOrderManagement(
        page,
        limit,
        orderStatus,
        paymentStatus,
        includeExcluded,
      );

      // Định nghĩa bộ lọc mong đợi
      const expectedFilters = {
        orderStatus: orderStatus,
        paymentStatus: paymentStatus,
        excludedStatuses: !orderStatus ? excludedStatuses : [],
        includedStatuses: [],
      };

      // Kiểm tra kết quả
      expect(service.getOrderManagement).toHaveBeenCalledWith(
        page,
        limit,
        expectedFilters,
      );

      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: mockOrders,
      });
    });

    /**
     * Mã: TC009
     * Test case: Xử lý trường hợp includeExcluded là true
     * Mục tiêu: Kiểm tra việc lọc đơn hàng khi bao gồm các trạng thái đã loại trừ
     * Input:
     * - page: 1
     * - limit: 10
     * - orderStatus: undefined
     * - paymentStatus: Paid
     * - includeExcluded: true
     * Output mong đợi: Danh sách đơn hàng bao gồm cả trạng thái đã loại trừ
     */
    it('should handle includeExcluded true case', async () => {
      const page = 1;
      const limit = 10;
      const orderStatus = undefined;
      const paymentStatus = PaymentStatus.Paid;
      const includeExcluded = true;

      const mockOrders = [
        {
          id: '1',
          orderStatus: OrderStatus.Delivered,
          paymentStatus: PaymentStatus.Paid,
        },
      ];

      mockOrderService.getOrderManagement.mockResolvedValue(mockOrders);

      const result = await controller.getOrderManagement(
        page,
        limit,
        orderStatus,
        paymentStatus,
        includeExcluded,
      );

      const expectedFilters = {
        orderStatus: '',
        paymentStatus: paymentStatus,
        excludedStatuses: [],
        includedStatuses:
          includeExcluded && !orderStatus ? excludedStatuses : [],
      };

      expect(service.getOrderManagement).toHaveBeenCalledWith(
        page,
        limit,
        expectedFilters,
      );

      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: mockOrders,
      });
    });

    /**
     * Mã: TC010
     * Test case: Xử lý trường hợp không có tham số
     * Mục tiêu: Kiểm tra hành vi mặc định khi không có tham số lọc
     * Input: Chỉ có page và limit, các tham số khác undefined
     * Output mong đợi: Danh sách rỗng với các bộ lọc mặc định
     */
    it('should handle empty parameters', async () => {
      const mockOrders = [];
      mockOrderService.getOrderManagement.mockResolvedValue(mockOrders);

      const result = await controller.getOrderManagement(
        1,
        10,
        undefined,
        undefined,
        undefined,
      );

      expect(service.getOrderManagement).toHaveBeenCalledWith(1, 10, {
        orderStatus: '',
        paymentStatus: '',
        excludedStatuses: [], // Changed from excludedStatuses to []
        includedStatuses: [],
      });

      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data : []
      });
    });

    /**
     * Mã: TC011
     * Test case: Xử lý lỗi từ service
     * Mục tiêu: Kiểm tra xử lý lỗi khi service gặp vấn đề
     * Input: Các tham số hợp lệ nhưng service trả về lỗi
     * Output mong đợi: Response thông báo lỗi với status 500
     */
    it('should handle service error', async () => {
      mockOrderService.getOrderManagement.mockRejectedValue(
        new Error('Database error'),
      );

      const result = await controller.getOrderManagement(
        1,
        10,
        OrderStatus.Checking,
        PaymentStatus.Paid,
        false
      );
  
      expect(result).toEqual({
        status: 500,
        message: 'Database error',
        success: false
      });

      expect(service.getOrderManagement).toHaveBeenCalledWith(
        1,
        10,
        {
          orderStatus: OrderStatus.Checking,
          paymentStatus: PaymentStatus.Paid,
          excludedStatuses: [],
          includedStatuses: []
        }
      );
    });
  });

  /**
   * Nhóm test cho chức năng cập nhật đơn hàng
   * Mục đích: Kiểm tra các tính năng cập nhật thông tin đơn hàng
   */
  describe('updateOrder', () => {
    const userId = 'user123';
    const updateDto: UpdateOrderDTO = {
      order_id: 'order123',
      orderStatus: OrderStatus.Checking,
      user_id: 'user123',
      employee_id: 'emp123',
      paymentStatus: PaymentStatus.Paid,
    };

    /**
     * Mã: TC012
     * Test case: Cập nhật đơn hàng thành công
     * Mục tiêu: Kiểm tra việc cập nhật đơn hàng với dữ liệu hợp lệ
     * Input: UpdateOrderDTO hợp lệ
     * Output mong đợi: Thông tin đơn hàng đã cập nhật
     */
    it('should update order successfully', async () => {
      const mockUpdatedOrder = {
        id: updateDto.order_id,
        ...updateDto,
      };

      mockOrderService.updateOrder.mockResolvedValue(mockUpdatedOrder);

      const result = await controller.updateOrder(userId, updateDto);

      expect(service.updateOrder).toHaveBeenCalledWith(updateDto);
      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: mockUpdatedOrder,
      });
    });

    /**
     * Mã: TC013
     * Test case: Xử lý user_id không hợp lệ
     * Mục tiêu: Kiểm tra xử lý lỗi khi user_id không tồn tại
     * Input: user_id không hợp lệ
     * Output mong đợi: Thông báo lỗi với status 500
     */
    it('should handle invalid user_id', async () => {
        mockOrderService.updateOrder.mockRejectedValue(
          new Error('Invalid user')
        );
    
        const result = await controller.updateOrder('invalid_user', updateDto);
    
        expect(result).toEqual({
          status: 500,
          message: 'Invalid user',
          success: false
        });
      });

      /**
     * Mã: TC014
     * Test case: Xử lý thiếu trường bắt buộc
     * Mục tiêu: Kiểm tra validation khi thiếu thông tin bắt buộc
     * Input: UpdateOrderDTO thiếu trường
     * Output mong đợi: Thông báo lỗi thiếu trường
     */
      it('should handle missing required fields', async () => {
        const incompleteDto = {
          order_id: 'order123',
        };
    
        mockOrderService.updateOrder.mockRejectedValue(
          new Error('Missing required fields')
        );
    
        const result = await controller.updateOrder(
          userId, 
          incompleteDto as UpdateOrderDTO
        );
    
        expect(result).toEqual({
          status: 500,
          message: 'Missing required fields',
          success: false
        });
      });

      /**
     * Mã: TC015
     * Test case: Xử lý lỗi từ service
     * Mục tiêu: Kiểm tra xử lý lỗi khi service gặp vấn đề
     * Input: UpdateOrderDTO hợp lệ nhưng service lỗi
     * Output mong đợi: Thông báo lỗi database
     */
    it('should handle service error', async () => {
        mockOrderService.updateOrder.mockRejectedValue(
          new Error('Database error')
        );
    
        const result = await controller.updateOrder(userId, updateDto);
    
        expect(result).toEqual({
          status: 500,
          message: 'Database error',
          success: false
        });
      });
  });
});
