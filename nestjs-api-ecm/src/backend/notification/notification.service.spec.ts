import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { 
  NotificationStatus, 
  NotificationType,
  OrderStatus,
  PaymentStatus,
  PaymentMethod
} from 'src/share/Enum/Enum';
import * as admin from 'firebase-admin';
import { OrderEntity } from 'src/entities/order_entity/oder.entity';

// Khai báo biến toàn cục để kiểm soát độ dài của apps
let appsLength = 0;

// Mock path
jest.mock('path', () => ({
  resolve: jest.fn().mockReturnValue('./mock-service-account.json')
}));

// Mock firebase-admin
jest.mock('firebase-admin', () => {
  const mockDatabase = {
    ref: jest.fn().mockReturnValue({
      push: jest.fn().mockResolvedValue(undefined),
    }),
  };
  const mockCert = jest.fn().mockReturnValue('mock-credential');
  
  jest.mock('./mock-service-account.json', () => ({
    type: "service_account",
    project_id: "mock-project",
    private_key_id: "mock-key-id",
    private_key: "mock-private-key",
    client_email: "mock@example.com",
    client_id: "mock-client-id",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/mock"
  }), { virtual: true });
  
  return {
    get apps() {
      return new Array(appsLength).fill({});
    },
    initializeApp: jest.fn(),
    credential: {
      cert: mockCert,
    },
    database: jest.fn().mockReturnValue(mockDatabase),
  };
});

// Mock dotenv
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

describe('NotificationService', () => {
  let service: NotificationService;
  let mockRef: { push: jest.Mock };

  beforeEach(async () => {
    // Reset all mocks
    jest.clearAllMocks();
    appsLength = 0;

    // Setup mock ref
    mockRef = {
      push: jest.fn().mockResolvedValue(undefined),
    };

    // Setup database mock with proper typing
    const mockDatabase = {
      ref: jest.fn().mockReturnValue(mockRef),
    };

    // Cast admin.database to jest.Mock explicitly
    (admin.database as unknown as jest.Mock).mockReturnValue(mockDatabase);

    // Mock process.env
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH = 'path/to/service-account.json';
    process.env.FIREBASE_SERVICE_DATABASE = 'https://your-database.firebaseio.com';

    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationService],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('constructor', () => {
    it('should initialize Firebase Admin SDK if not already initialized', () => {
      // Đảm bảo apps là mảng rỗng
      appsLength = 0;
      
      new NotificationService();
      
      expect(admin.initializeApp).toHaveBeenCalledWith({
        credential: admin.credential.cert('mock-credential'),
        databaseURL: process.env.FIREBASE_SERVICE_DATABASE,
      });
    });

    it('should not initialize Firebase Admin SDK if already initialized', () => {
      // Reset mocks
      jest.clearAllMocks();
      
      // Giả lập Firebase đã được khởi tạo
      appsLength = 1;
      
      new NotificationService();
      expect(admin.initializeApp).not.toHaveBeenCalled();
    });
  });

  describe('sendNotification', () => {
    const mockOrder = {
      id: 'test-order-id',
      order_code: 'ORDER123',
      total_price: 100,
      orderStatus: OrderStatus.Checking,
      payment_method: PaymentMethod.CashOnDelivery,
      employee_id: null,
      user_id: 'user123',
      location_id: 'location123',
      paymentStatus: PaymentStatus.Unpaid,
      note: 'Test note',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      deletedAt: null,
      orderProducts: [],
      user: null,
      employee: null,
      location: null,
      location_user: null
    } as OrderEntity;

    const mockMessage = 'Test notification message';

    it('should successfully send a notification', async () => {
      const dbRef = (admin.database() as any).ref('notificationAdmins');
      
      await service.sendNotification(
        mockOrder,
        mockMessage,
        NotificationStatus.Success,
        NotificationType.NewOrder,
      );

      expect(dbRef.push).toHaveBeenCalledWith({
        order_id: mockOrder.id,
        isRead: false,
        message: mockMessage,
        createdAt: mockOrder.createdAt.toISOString(),
        status: NotificationStatus.Success,
        notificationType: NotificationType.NewOrder,
      });
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      mockRef.push.mockRejectedValue(error);

      await expect(
        service.sendNotification(
          mockOrder,
          mockMessage,
          NotificationStatus.Success,
          NotificationType.NewOrder,
        ),
      ).rejects.toThrow('Database error');
    });
  });

  // Clean up after all tests
  afterAll(() => {
    jest.resetModules();
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH = undefined;
    process.env.FIREBASE_SERVICE_DATABASE = undefined;
  });
});