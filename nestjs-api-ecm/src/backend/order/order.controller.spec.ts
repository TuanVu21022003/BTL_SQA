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
  let controller: OrderController;
  let service: OrderService;

  const mockOrderService = {
    getAllOrder: jest.fn(),
    getOrderManagement: jest.fn(),
    createOrder: jest.fn(),
    getDetail: jest.fn(),
    updateOrder: jest.fn(),
    getOrderUserDashboard: jest.fn(),
  };

  const mockAuthGuard = { canActivate: jest.fn().mockReturnValue(true) };
  const mockRolesGuard = { canActivate: jest.fn().mockReturnValue(true) };

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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllOrder', () => {
    it('should return all orders for a user', async () => {
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

      const result = await controller.getAllOrder(userId, orderDto);

      expect(service.getAllOrder).toHaveBeenCalledWith(userId, orderDto);
      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: mockOrders
      });
    });

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

  describe('getOrderManagement', () => {
    it('should return managed orders with filters when includeExcluded is false', async () => {
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

  describe('createOrder', () => {
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

  describe('getDetailOrder', () => {
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

  describe('updateOrder', () => {
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

  describe('getOrderUserDashboard', () => {
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