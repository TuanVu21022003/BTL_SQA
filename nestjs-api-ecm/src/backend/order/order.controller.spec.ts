// Import các module cần thiết để test
import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { AuthGuard } from 'src/guards/JwtAuth.guard';
import { RolesGuard } from 'src/guards/Roles.guard';
import { OrderStatus, PaymentMethod, PaymentStatus } from 'src/share/Enum/Enum';
import { CreateOrderDto } from 'src/dto/orderDTO/order.create.dto';
import { UpdateOrderDTO } from 'src/dto/orderDTO/order.update.dto';
import { OrderAllOrderDto } from 'src/dto/orderDTO/order.allOrder.dto';

describe('OrderController', () => {
  // Khai báo các biến sử dụng trong test
  let controller: OrderController;
  let service: OrderService;

  // Mock các service được sử dụng trong controller
  const mockOrderService = {
    getAllOrder: jest.fn(),
    getOrderManagement: jest.fn(),
    createOrder: jest.fn(),
    getDetail: jest.fn(),
    updateOrder: jest.fn(),
    getOrderUserDashboard: jest.fn(),
  };

  // Mock các Guard xác thực và phân quyền
  const mockAuthGuard = { canActivate: jest.fn().mockReturnValue(true) };
  const mockRolesGuard = { canActivate: jest.fn().mockReturnValue(true) };

  // Cấu hình và khởi tạo module test trước mỗi test case
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<OrderController>(OrderController);
    service = module.get<OrderService>(OrderService);
  });

  // Xóa tất cả mock data sau mỗi test case
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
   * Nhóm test cho chức năng lấy tất cả đơn hàng
   */
  describe('getAllOrder', () => {
    /**
     * Mã: TC002
     * Test case: Lấy danh sách đơn hàng thành công
     * Mục tiêu: Kiểm tra việc lấy danh sách đơn hàng của người dùng
     * Input: 
     * - userId: ID người dùng (user123)
     * - orderDto: {page: 1, limit: 10}
     * Output mong đợi: 
     * - status: 200
     * - message: 'SUCCESS!'
     * - success: true
     * - data: Danh sách đơn hàng
     */
    it('should return all orders for a user', async () => {
      // Chuẩn bị dữ liệu test
      const userId = 'user123';
      const orderDto: OrderAllOrderDto = {
        page: 1,
        limit: 10
      };
      const mockOrders = [{
        id: '1',
        user_id: 'user123',
        products: [{
          product_id: 'prod1',
          quantity: 2,
          priceout: 100
        }],
        totalAmount: 200,
        paymentStatus: PaymentStatus.Unpaid,
        orderStatus: OrderStatus.Checking
      }];
      
      mockOrderService.getAllOrder.mockResolvedValue(mockOrders);

      // Thực thi test
      const result = await controller.getAllOrder(userId, orderDto);

      // Kiểm tra kết quả
      expect(service.getAllOrder).toHaveBeenCalledWith(userId, orderDto);
      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: mockOrders
      });
    });

    /**
     * Mã: TC003
     * Test case: Xử lý lỗi khi lấy danh sách đơn hàng
     * Mục tiêu: Kiểm tra xử lý khi service trả về lỗi
     * Input: 
     * - userId: ID người dùng
     * - orderDto: {page: 1, limit: 10}
     * Output mong đợi: 
     * - status: 500
     * - message: 'Test error'
     * - success: false
     */
    it('should handle errors', async () => {
      const userId = 'user123';
      const orderDto: OrderAllOrderDto = {
        page: 1,
        limit: 10
      };
      
      mockOrderService.getAllOrder.mockRejectedValue(new Error('Test error'));

      const result = await controller.getAllOrder(userId, orderDto);

      expect(result).toEqual({
        status: 500,
        message: 'Test error',
        success: false,
      });
    });
  });

  /**
   * Nhóm test cho chức năng quản lý đơn hàng
   */
  describe('getOrderManagement', () => {
    /**
     * Mã: TC004
     * Test case: Lấy danh sách đơn hàng quản lý không bao gồm trạng thái đã loại trừ
     * Mục tiêu: Kiểm tra việc lọc đơn hàng theo trạng thái
     * Input:
     * - page: 1
     * - limit: 10
     * - orderStatus: Checking
     * - paymentStatus: Paid
     * - includeExcluded: false
     * Output mong đợi: Danh sách đơn hàng đã lọc
     */
    it('should return managed orders with filters when includeExcluded is false', async () => {
      // Chuẩn bị dữ liệu test
      const page = 1;
      const limit = 10;
      const orderStatus = OrderStatus.Checking;
      const paymentStatus = PaymentStatus.Paid;
      const includeExcluded = false;
      const mockOrders = [{
        id: '1',
        user_id: 'user123',
        products: [{
          product_id: 'prod1',
          quantity: 2,
          priceout: 100
        }],
        totalAmount: 200,
        paymentStatus: PaymentStatus.Paid,
        orderStatus: OrderStatus.Checking
      }];

      mockOrderService.getOrderManagement.mockResolvedValue(mockOrders);

      // Thực thi test
      const result = await controller.getOrderManagement(
        page,
        limit,
        orderStatus,
        paymentStatus,
        includeExcluded
      );

      const expectedFilters = {
        orderStatus: orderStatus || '',
        paymentStatus: paymentStatus || '',
        excludedStatuses: !orderStatus ? [OrderStatus.Delivered, OrderStatus.Canceled] : [],
        includedStatuses: []
      };

      // Kiểm tra kết quả
      expect(service.getOrderManagement).toHaveBeenCalledWith(
        page,
        limit,
        expectedFilters
      );

      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: mockOrders
      });
    });

    /**
     * Mã: TC005
     * Test case: Lấy danh sách đơn hàng bao gồm trạng thái đã loại trừ
     * Mục tiêu: Kiểm tra việc lấy đơn hàng có bao gồm trạng thái đã giao và đã hủy
     * Input:
     * - page: 1
     * - limit: 10
     * - orderStatus: undefined
     * - paymentStatus: Paid
     * - includeExcluded: true
     * Output mong đợi: Danh sách đơn hàng bao gồm trạng thái đã loại trừ
     */
    it('should handle includeExcluded true case', async () => {
      const page = 1;
      const limit = 10;
      const orderStatus = undefined; // Quan trọng: orderStatus phải là undefined
      const paymentStatus = PaymentStatus.Paid;
      const includeExcluded = true;
      
      const mockOrders = [{
        id: '1',
        user_id: 'user123',
        orderStatus: OrderStatus.Checking,
        paymentStatus: PaymentStatus.Paid
      }];

      mockOrderService.getOrderManagement.mockResolvedValue(mockOrders);

      const result = await controller.getOrderManagement(
        page,
        limit,
        orderStatus,
        paymentStatus,
        includeExcluded
      );

      const expectedFilters = {
        orderStatus: '',
        paymentStatus: paymentStatus || '',
        excludedStatuses: [],
        includedStatuses: includeExcluded && !orderStatus ? [OrderStatus.Delivered, OrderStatus.Canceled] : []
      };

      expect(service.getOrderManagement).toHaveBeenCalledWith(
        page,
        limit,
        expectedFilters
      );

      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: mockOrders
      });
    });
});

/**
   * Nhóm test cho chức năng tạo đơn hàng mới
   */
  describe('createOrder', () => {
    /**
     * Mã: TC006
     * Test case: Tạo đơn hàng mới thành công
     * Mục tiêu: Kiểm tra việc tạo mới đơn hàng
     * Input:
     * - userId: ID người dùng
     * - orderDto: Thông tin đơn hàng mới
     * Output mong đợi: Thông tin đơn hàng đã tạo
     */
    it('should create a new order', async () => {
      const userId = 'user123';
      const orderDto: CreateOrderDto = {
        totalPrice: 200,
        orderStatus: OrderStatus.Checking,
        products: [{
          product_id: 'prod1',
          quantity: 2,
          priceout: 100
        }],
        paymentStatus: PaymentStatus.Unpaid,
        paymentMethod: PaymentMethod.CashOnDelivery,
        location_id: 'loc123',
        user_id: userId
      };
      
      const mockOrder = { 
        id: '1', 
        ...orderDto
      };

      mockOrderService.createOrder.mockResolvedValue(mockOrder);

      const result = await controller.createOrder(userId, orderDto);

      expect(service.createOrder).toHaveBeenCalledWith(orderDto);
      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: mockOrder
      });
    });
});

/**
   * Nhóm test cho chức năng xem chi tiết đơn hàng
   */
  describe('getDetailOrder', () => {
    /**
     * Mã: TC007
     * Test case: Lấy chi tiết đơn hàng thành công
     * Mục tiêu: Kiểm tra việc lấy thông tin chi tiết của một đơn hàng
     * Input:
     * - userId: ID người dùng
     * - orderId: ID đơn hàng
     * Output mong đợi: Chi tiết đơn hàng
     */
    it('should return order details', async () => {
      const userId = 'user123';
      const orderId = 'order123';
      const mockOrderDetail = {
        id: orderId,
        user_id: userId,
        products: [{
          product_id: 'prod1',
          quantity: 2,
          priceout: 100
        }],
        totalAmount: 200,
        paymentStatus: PaymentStatus.Unpaid,
        orderStatus: OrderStatus.Checking
      };

      mockOrderService.getDetail.mockResolvedValue(mockOrderDetail);

      const result = await controller.getDetailOrder(userId, orderId);

      expect(service.getDetail).toHaveBeenCalledWith(orderId);
      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: mockOrderDetail
      });
    });
  });

  /**
   * Nhóm test cho chức năng cập nhật đơn hàng
   */
  describe('updateOrder', () => {
    /**
     * Mã: TC008
     * Test case: Cập nhật đơn hàng thành công
     * Mục tiêu: Kiểm tra việc cập nhật thông tin đơn hàng
     * Input:
     * - userId: ID người dùng
     * - updateDto: Thông tin cập nhật
     * Output mong đợi: Thông tin đơn hàng sau khi cập nhật
     */
    it('should update an order', async () => {
      const userId = 'user123';
      const updateDto: UpdateOrderDTO = {
        order_id: 'order123',
        orderStatus: OrderStatus.Checking, // Sử dụng giá trị hợp lệ từ enum OrderStatus
        user_id: userId,
        employee_id: 'emp123',
        paymentStatus: PaymentStatus.Paid
      };

      const mockUpdatedOrder = {
        id: updateDto.order_id,
        user_id: userId,
        employee_id: 'emp123',
        orderStatus: OrderStatus.Checking,
        paymentStatus: PaymentStatus.Paid,
        products: [{
          product_id: 'prod1',
          quantity: 2,
          priceout: 100
        }],
        totalAmount: 200
      };

      mockOrderService.updateOrder.mockResolvedValue(mockUpdatedOrder);

      const result = await controller.updateOrder(userId, updateDto);

      expect(service.updateOrder).toHaveBeenCalledWith(updateDto);
      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: mockUpdatedOrder
      });
    });
});

/**
   * Nhóm test cho chức năng xem tổng quan đơn hàng của người dùng
   */
  describe('getOrderUserDashboard', () => {
    /**
     * Mã: TC009
     * Test case: Lấy thông tin tổng quan đơn hàng của người dùng thành công
     * Mục tiêu: Kiểm tra việc lấy thông tin tổng quan về đơn hàng của một người dùng
     * Input:
     * - userId: ID người dùng
     * Output mong đợi: Thông tin tổng quan bao gồm tổng số đơn hàng và các đơn hàng gần đây
     */
    it('should return user dashboard orders', async () => {
      const userId = 'user123';
      const mockDashboardData = {
        totalOrders: 5,
        recentOrders: [{
          id: 'order123',
          user_id: userId,
          products: [{
            product_id: 'prod1',
            quantity: 2,
            priceout: 100
          }],
          totalAmount: 200,
          paymentStatus: PaymentStatus.Unpaid,
          orderStatus: OrderStatus.Checking
        }]
      };

      mockOrderService.getOrderUserDashboard.mockResolvedValue(mockDashboardData);

      const result = await controller.getOrderUserDashboard(userId);

      expect(service.getOrderUserDashboard).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: mockDashboardData
      });
    });
  });
});