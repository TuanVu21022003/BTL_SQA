import { Test, TestingModule } from '@nestjs/testing';
import { MomoController } from './momo.controller';
import { MomoService } from './momo.service';
import { OrderService } from 'src/backend/order/order.service';
import { CreateMomoDto } from './dto/create-momo.dto';
import { OrderStatus, PaymentMethod, PaymentStatus } from 'src/share/Enum/Enum';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('MomoController', () => {
  let controller: MomoController;
  let momoService: MomoService;
  let orderService: OrderService;

  const mockMomoService = {
    createPayment: jest.fn(),
    callbackPayment: jest.fn(),
  };

  const mockOrderService = {
    createOrder: jest.fn(),
    updateOrder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MomoController],
      providers: [
        {
          provide: MomoService,
          useValue: mockMomoService,
        },
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
    }).compile();

    controller = module.get<MomoController>(MomoController);
    momoService = module.get<MomoService>(MomoService);
    orderService = module.get<OrderService>(OrderService);

    // Reset all mock implementations
    jest.clearAllMocks();

    // Reset mock defaults
    mockOrderService.createOrder.mockReset();
    mockOrderService.updateOrder.mockReset();
    mockMomoService.createPayment.mockReset();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createPayment', () => {
    const mockCreateMomoDto: CreateMomoDto = {
      amount: 100000,
      redirectUrl: 'http://example.com/redirect',
      ipnUrl: 'http://example.com/ipn',
      order: {
        totalPrice: 100000,
        paymentMethod: PaymentMethod.CashOnDelivery,
        user_id: 'user123',
        location_id: 'location123',
        orderStatus: OrderStatus.Checking,
        paymentStatus: PaymentStatus.Unpaid,
        products: [
          {
            product_id: 'product123',
            quantity: 2,
            priceout: 50000,
          },
        ],
      },
    };

    const mockOrder = {
      id: 'order123',
      user_id: 'user123',
    };

    const mockPaymentResponse = {
      payUrl: 'http://momo.payment.url',
      orderId: 'order123',
    };

    it('should successfully create payment', async () => {
      mockOrderService.createOrder.mockResolvedValue(mockOrder);
      mockMomoService.createPayment.mockResolvedValue(mockPaymentResponse);

      const result = await controller.createPayment(mockCreateMomoDto);

      expect(result).toEqual({
        success: true,
        data: {
          order: mockOrder,
          payment: mockPaymentResponse,
        },
      });

      expect(orderService.createOrder).toHaveBeenCalledWith(mockCreateMomoDto.order);
      expect(momoService.createPayment).toHaveBeenCalledWith(
        mockCreateMomoDto.amount,
        mockCreateMomoDto.redirectUrl,
        mockCreateMomoDto.ipnUrl,
        mockOrder.id,
        mockOrder.user_id,
      );
    });

    it('should handle errors during payment creation', async () => {
      const error = new Error('Failed to create order');
      mockOrderService.createOrder.mockRejectedValue(error);

      const result = await controller.createPayment(mockCreateMomoDto);

      expect(result).toEqual({
        success: false,
        message: 'Failed to create payment: Failed to create order',
      });
    });
  });

  describe('callbackPayment', () => {
    const mockSuccessPayload = {
      resultCode: 0,
      orderId: 'order123',
      extraData: 'user123',
    };

    const mockFailedPayload = {
      resultCode: 1,
      orderId: 'order123',
      extraData: 'user123',
    };

    it('should handle successful payment callback', async () => {
      mockOrderService.updateOrder.mockResolvedValue({
        id: 'order123',
        status: PaymentStatus.Paid,
      });

      const result = await controller.callbackPayment(mockSuccessPayload);

      expect(result).toBe('success');
      expect(orderService.updateOrder).toHaveBeenCalledWith({
        user_id: mockSuccessPayload.extraData,
        order_id: mockSuccessPayload.orderId,
        paymentStatus: PaymentStatus.Paid,
      });
    });

    it('should handle failed payment callback', async () => {
      const result = await controller.callbackPayment(mockFailedPayload);

      expect(result).toEqual({
        success: false,
        message: 'Thanh toán chưa thành công!',
      });

      expect(orderService.updateOrder).not.toHaveBeenCalled();
    });

    it('should handle order update failure', async () => {
      mockOrderService.updateOrder.mockResolvedValue(null);

      const result = await controller.callbackPayment(mockSuccessPayload);

      expect(result).toEqual({
        success: false,
        message: 'Lỗi khi update order',
      });
    });

    it('should handle unexpected errors', async () => {
      mockOrderService.updateOrder.mockRejectedValue(new Error('Database error'));

      let thrownError: HttpException | null = null;

      try {
        await controller.callbackPayment(mockSuccessPayload);
      } catch (error) {
        if (error instanceof HttpException) {
          thrownError = error;
        }
      }

      expect(thrownError).toBeInstanceOf(HttpException);
      expect(thrownError?.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(thrownError?.message).toBe('Database error');
    });
  });
});
