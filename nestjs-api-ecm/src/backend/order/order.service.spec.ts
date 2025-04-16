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

describe('OrderController', () => {
  let controller: OrderController;
  let service: OrderService;

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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createOrder', () => {
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

  describe('getAllOrder', () => {
    const userId = 'user123';
    const orderDto = { page: 1, limit: 10 };

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

  describe('getOrderManagement', () => {
    const excludedStatuses = [OrderStatus.Delivered, OrderStatus.Canceled];

    it('should return managed orders with filters when includeExcluded is false', async () => {
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

      mockOrderService.getOrderManagement.mockResolvedValue(mockOrders);

      const result = await controller.getOrderManagement(
        page,
        limit,
        orderStatus,
        paymentStatus,
        includeExcluded,
      );

      const expectedFilters = {
        orderStatus: orderStatus,
        paymentStatus: paymentStatus,
        excludedStatuses: !orderStatus ? excludedStatuses : [],
        includedStatuses: [],
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

  describe('updateOrder', () => {
    const userId = 'user123';
    const updateDto: UpdateOrderDTO = {
      order_id: 'order123',
      orderStatus: OrderStatus.Checking,
      user_id: 'user123',
      employee_id: 'emp123',
      paymentStatus: PaymentStatus.Paid,
    };

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
