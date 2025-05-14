import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { responseHandler } from 'src/Until/responseUtil';
import { AuthGuard } from 'src/guards/JwtAuth.guard';
import { RolesGuard } from 'src/guards/Roles.guard';
import { Roles } from 'src/decorator/Role.decorator';
import { CreateOrderDto } from 'src/dto/orderDTO/order.create.dto';
import { OrderAllOrderDto } from 'src/dto/orderDTO/order.allOrder.dto';
import { UpdateOrderDTO } from 'src/dto/orderDTO/order.update.dto';
import { OrderStatus, PaymentStatus } from 'src/share/Enum/Enum';

jest.mock('src/Until/responseUtil', () => ({
  responseHandler: {
    ok: jest.fn((data) => ({ success: true, data })),
    error: jest.fn((msg) => ({ success: false, message: msg })),
  },
}));

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        { provide: OrderService, useValue: mockOrderService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<OrderController>(OrderController);
    service = module.get<OrderService>(OrderService);

    jest.clearAllMocks();
  });

  describe('getAllOrder', () => {
    it('should return all orders for a user', async () => {
      const user_id = 'user123';
      const dto: OrderAllOrderDto = { page: 1, limit: 10 };
      const result = { list: [], total: 0 };
      mockOrderService.getAllOrder.mockResolvedValue(result);

      const response = await controller.getAllOrder(user_id, dto);

      expect(service.getAllOrder).toHaveBeenCalledWith(user_id, dto);
      expect(responseHandler.ok).toHaveBeenCalledWith(result);
      expect(response.success).toBe(true);
    });

    it('should handle errors', async () => {
      mockOrderService.getAllOrder.mockRejectedValue(new Error('fail'));
      const response = await controller.getAllOrder('user', { page: 1, limit: 1 });
      expect(response.success).toBe(false);
      expect(responseHandler.error).toHaveBeenCalled();
    });
    it('should handle errors with non-Error object', async () => {
      mockOrderService.getAllOrder.mockRejectedValue({ foo: 'bar' });
      const response = await controller.getAllOrder('user', { page: 1, limit: 1 });
      expect(response.success).toBe(false);
      expect(responseHandler.error).toHaveBeenCalled();
    });
  });

  describe('getOrderManagement', () => {
    it('should return managed orders', async () => {
      const page = 1, limit = 10;
      const filters = {
        orderStatus: '',
        paymentStatus: '',
        includedStatuses: [],
        excludedStatuses: [OrderStatus.Delivered, OrderStatus.Canceled],
      };
      const result = { orders: [], total: 0, orderStatusSummary: {} };
      mockOrderService.getOrderManagement.mockResolvedValue(result);

      const response = await controller.getOrderManagement(
        page,
        limit,
        undefined,
        undefined,
        false
      );

      expect(service.getOrderManagement).toHaveBeenCalled();
      expect(responseHandler.ok).toHaveBeenCalledWith(result);
      expect(response.success).toBe(true);
    });

    it('should handle includeExcluded true and no orderStatus', async () => {
      const page = 1, limit = 10;
      const result = { orders: [], total: 0, orderStatusSummary: {} };
      mockOrderService.getOrderManagement.mockResolvedValue(result);

      const response = await controller.getOrderManagement(
        page,
        limit,
        undefined,
        undefined,
        true // includeExcluded true
      );

      expect(service.getOrderManagement).toHaveBeenCalledWith(
        page,
        limit,
        expect.objectContaining({
          includedStatuses: [OrderStatus.Delivered, OrderStatus.Canceled],
          excludedStatuses: [],
        }),
      );
      expect(response.success).toBe(true);
    });

    it('should handle includeExcluded false and no orderStatus', async () => {
      const page = 1, limit = 10;
      const result = { orders: [], total: 0, orderStatusSummary: {} };
      mockOrderService.getOrderManagement.mockResolvedValue(result);

      const response = await controller.getOrderManagement(
        page,
        limit,
        undefined,
        undefined,
        false // includeExcluded false
      );

      expect(service.getOrderManagement).toHaveBeenCalledWith(
        page,
        limit,
        expect.objectContaining({
          includedStatuses: [],
          excludedStatuses: [OrderStatus.Delivered, OrderStatus.Canceled],
        }),
      );
      expect(response.success).toBe(true);
    });

    it('should handle orderStatus provided (included/excluded should be empty)', async () => {
      const page = 1, limit = 10;
      const result = { orders: [], total: 0, orderStatusSummary: {} };
      mockOrderService.getOrderManagement.mockResolvedValue(result);

      const response = await controller.getOrderManagement(
        page,
        limit,
        OrderStatus.Checking,
        undefined,
        true // includeExcluded true, but orderStatus provided
      );

      expect(service.getOrderManagement).toHaveBeenCalledWith(
        page,
        limit,
        expect.objectContaining({
          orderStatus: OrderStatus.Checking,
          includedStatuses: [],
          excludedStatuses: [],
        }),
      );
      expect(response.success).toBe(true);
    });

    it('should handle errors with non-Error object', async () => {
      mockOrderService.getOrderManagement.mockRejectedValue({ foo: 'bar' });
      const response = await controller.getOrderManagement(1, 1, undefined, undefined, false);
      expect(response.success).toBe(false);
      expect(responseHandler.error).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      mockOrderService.getOrderManagement.mockRejectedValue(new Error('fail'));
      const response = await controller.getOrderManagement(1, 1, undefined, undefined, false);
      expect(response.success).toBe(false);
      expect(responseHandler.error).toHaveBeenCalled();
    });
  });

  describe('createOrder', () => {
    it('should create an order', async () => {
      const user_id = 'user123';
      const dto: CreateOrderDto = {
        totalPrice: 100,
        paymentMethod: 'Thanh toán khi nhận hàng' as any,
        user_id,
        location_id: 'loc1',
        orderStatus: 'Đang kiểm hàng' as any,
        paymentStatus: 'Chưa thanh toán' as any,
        products: [],
      };
      const result = { id: 'order1' };
      mockOrderService.createOrder.mockResolvedValue(result);

      const response = await controller.createOrder(user_id, dto);

      expect(service.createOrder).toHaveBeenCalledWith(dto);
      expect(responseHandler.ok).toHaveBeenCalledWith(result);
      expect(response.success).toBe(true);
    });

    it('should handle errors', async () => {
      mockOrderService.createOrder.mockRejectedValue(new Error('fail'));
      const response = await controller.createOrder('user', {} as any);
      expect(response.success).toBe(false);
      expect(responseHandler.error).toHaveBeenCalled();
    });

    it('should handle errors with non-Error object', async () => {
      mockOrderService.createOrder.mockRejectedValue({ foo: 'bar' });
      const response = await controller.createOrder('user', {} as any);
      expect(response.success).toBe(false);
      expect(responseHandler.error).toHaveBeenCalled();
    });
  });

  describe('getDetailOrder', () => {
    it('should return order detail', async () => {
      const user_id = 'user123', id = 'order1';
      const result = { id: 'order1', detail: true };
      mockOrderService.getDetail.mockResolvedValue(result);

      const response = await controller.getDetailOrder(user_id, id);

      expect(service.getDetail).toHaveBeenCalledWith(id);
      expect(responseHandler.ok).toHaveBeenCalledWith(result);
      expect(response.success).toBe(true);
    });

    it('should handle errors', async () => {
      mockOrderService.getDetail.mockRejectedValue(new Error('fail'));
      const response = await controller.getDetailOrder('user', 'order');
      expect(response.success).toBe(false);
      expect(responseHandler.error).toHaveBeenCalled();
    });

    it('should handle errors with non-Error object', async () => {
      mockOrderService.getDetail.mockRejectedValue({ foo: 'bar' });
      const response = await controller.getDetailOrder('user', 'order');
      expect(response.success).toBe(false);
      expect(responseHandler.error).toHaveBeenCalled();
    });
  });

  describe('updateOrder', () => {
    it('should update an order', async () => {
      const user_id = 'user123';
      const dto: UpdateOrderDTO = {
        order_id: 'order1',
        orderStatus: 'Đang kiểm hàng' as any,
        user_id,
        employee_id: 'emp1',
        paymentStatus: 'Đã thanh toán' as any,
      };
      const result = { id: 'order1', updated: true };
      mockOrderService.updateOrder.mockResolvedValue(result);

      const response = await controller.updateOrder(user_id, dto);

      expect(service.updateOrder).toHaveBeenCalledWith(dto);
      expect(responseHandler.ok).toHaveBeenCalledWith(result);
      expect(response.success).toBe(true);
    });

    it('should handle errors', async () => {
      mockOrderService.updateOrder.mockRejectedValue(new Error('fail'));
      const response = await controller.updateOrder('user', {} as any);
      expect(response.success).toBe(false);
      expect(responseHandler.error).toHaveBeenCalled();
    });

    it('should handle errors with non-Error object', async () => {
      mockOrderService.updateOrder.mockRejectedValue({ foo: 'bar' });
      const response = await controller.updateOrder('user', {} as any);
      expect(response.success).toBe(false);
      expect(responseHandler.error).toHaveBeenCalled();
    });
  });

  describe('getOrderUserDashboard', () => {
    it('should return user dashboard', async () => {
      const user_id = 'user123';
      const result = { totalOrders: 1, statusSummary: {} };
      mockOrderService.getOrderUserDashboard.mockResolvedValue(result);

      const response = await controller.getOrderUserDashboard(user_id);

      expect(service.getOrderUserDashboard).toHaveBeenCalledWith(user_id);
      expect(responseHandler.ok).toHaveBeenCalledWith(result);
      expect(response.success).toBe(true);
    });

    it('should handle errors', async () => {
      mockOrderService.getOrderUserDashboard.mockRejectedValue(new Error('fail'));
      const response = await controller.getOrderUserDashboard('user');
      expect(response.success).toBe(false);
      expect(responseHandler.error).toHaveBeenCalled();
    });

    it('should handle errors with non-Error object', async () => {
      mockOrderService.getOrderUserDashboard.mockRejectedValue({ foo: 'bar' });
      const response = await controller.getOrderUserDashboard('user');
      expect(response.success).toBe(false);
      expect(responseHandler.error).toHaveBeenCalled();
    });
  });
});