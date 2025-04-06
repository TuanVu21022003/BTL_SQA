import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { OrderRepository } from 'src/repository/OrderRepository';
import { OrderProductRepository } from 'src/repository/OrderProductRepository';
import { ImportRepository } from 'src/repository/ImportRepository';
import { ImportProductRepository } from 'src/repository/ImportProductRepository';
import { UserRepository } from 'src/repository/UserRepository';
import { TimeFilter } from 'src/share/Enum/Enum';

// Mock các repository
const mockOrderRepo = {
  calculateStatsForTwoPeriods: jest.fn(),
  getFinancialSummary: jest.fn(),
  getTopCustomersByRevenue: jest.fn(),
  getRevenueBySupplier: jest.fn(),
  getRevenueByCategory: jest.fn(),
};

const mockOrderProductRepo = {
  getTopProductsByRevenue: jest.fn(),
  getFeatureProductsByRevenue: jest.fn(),
};

const mockImportRepo = {};
const mockImportProductRepo = {
  findLatestProducts: jest.fn(),
};

const mockUserRepo = {
  count: jest.fn(),
  createQueryBuilder: jest.fn(),
};

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: OrderRepository, useValue: mockOrderRepo },
        { provide: OrderProductRepository, useValue: mockOrderProductRepo },
        { provide: ImportRepository, useValue: mockImportRepo },
        { provide: ImportProductRepository, useValue: mockImportProductRepo },
        { provide: UserRepository, useValue: mockUserRepo },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSummaryStatistic', () => {
    it('should return statistics summary', async () => {
      const mockStats = {
        currentRevenue: 1000,
        lastRevenue: 900,
        currentQuantity: 100,
        lastQuantity: 90,
        currentTotalOrders: 50,
        lastTotalOrders: 45,
        currentTotalCustomers: 200,
        lastTotalCustomers: 180,
      };
      
      mockOrderRepo.calculateStatsForTwoPeriods.mockResolvedValue(mockStats);

      const timeFilter = TimeFilter.Month;
      const result = await service.getSummaryStatistic(timeFilter);

      expect(result).toEqual({
        thisTime: {
          revenue: mockStats.currentRevenue,
          product: mockStats.currentQuantity,
          customer: mockStats.currentTotalCustomers,
          order: mockStats.currentTotalOrders,
        },
        lastTime: {
          revenue: mockStats.lastRevenue,
          product: mockStats.lastQuantity,
          customer: mockStats.lastTotalCustomers,
          order: mockStats.lastTotalOrders,
        },
      });

      expect(mockOrderRepo.calculateStatsForTwoPeriods).toHaveBeenCalled();
    });
  });

  describe('getFinancialSummaryByTime', () => {
    it('should return financial summary by time', async () => {
      const mockFinancialData = [
        { time_period: '2021-01', total_revenue: 1000, total_cost: 500, profit: 500 },
        { time_period: '2021-02', total_revenue: 1100, total_cost: 600, profit: 500 },
      ];

      mockOrderRepo.getFinancialSummary.mockResolvedValue(mockFinancialData);

      const timeFilter = TimeFilter.Month;
      const result = await service.getFinancialSummaryByTime(timeFilter);

      expect(result).toEqual([
        { time_period: '2021-01', total_revenue: 1000, total_cost: 500, profit: 500 },
        { time_period: '2021-02', total_revenue: 1100, total_cost: 600, profit: 500 },
      ]);

      expect(mockOrderRepo.getFinancialSummary).toHaveBeenCalled();
    });
  });

  describe('getTopProductsByRevenue', () => {
    it('should return top products by revenue', async () => {
      const mockTopProducts = [{ id: 1, name: 'Product 1', revenue: 100 }];
      mockOrderProductRepo.getTopProductsByRevenue.mockResolvedValue(mockTopProducts);

      const timeFilter = TimeFilter.Month;
      const result = await service.getTopProductsByRevenue(timeFilter);

      expect(result).toEqual(mockTopProducts);
      expect(mockOrderProductRepo.getTopProductsByRevenue).toHaveBeenCalled();
    });
  });

  describe('getTopCustomersByRevenue', () => {
    it('should return top customers by revenue', async () => {
      const mockTopCustomers = [{ id: 1, name: 'Customer 1', revenue: 100 }];
      mockOrderRepo.getTopCustomersByRevenue.mockResolvedValue(mockTopCustomers);

      const timeFilter = TimeFilter.Month;
      const result = await service.getTopCustomersByRevenue(timeFilter);

      expect(result).toEqual(mockTopCustomers);
      expect(mockOrderRepo.getTopCustomersByRevenue).toHaveBeenCalled();
    });
  });

  describe('getRevenueBySupplier', () => {
    it('should return revenue by supplier', async () => {
      const mockRevenueBySupplier = [{ supplier: 'Supplier 1', revenue: 500 }];
      mockOrderRepo.getRevenueBySupplier.mockResolvedValue(mockRevenueBySupplier);

      const timeFilter = TimeFilter.Month;
      const result = await service.getRevenueBySupplier(timeFilter);

      expect(result).toEqual(mockRevenueBySupplier);
      expect(mockOrderRepo.getRevenueBySupplier).toHaveBeenCalled();
    });
  });

  describe('getRevenueByCategory', () => {
    it('should return revenue by category', async () => {
      const mockRevenueByCategory = [{ category: 'Category 1', revenue: 200 }];
      mockOrderRepo.getRevenueByCategory.mockResolvedValue(mockRevenueByCategory);

      const timeFilter = TimeFilter.Month;
      const result = await service.getRevenueByCategory(timeFilter);

      expect(result).toEqual(mockRevenueByCategory);
      expect(mockOrderRepo.getRevenueByCategory).toHaveBeenCalled();
    });
  });

  describe('getLatestProduct', () => {
    it('should return latest products', async () => {
      const mockLatestProducts = [{ id: 1, name: 'Product 1' }];
      mockImportProductRepo.findLatestProducts.mockResolvedValue(mockLatestProducts);

      const result = await service.getLatestProduct();

      expect(result).toEqual(mockLatestProducts);
      expect(mockImportProductRepo.findLatestProducts).toHaveBeenCalled();
    });
  });

  describe('getFeatureProduct', () => {
    it('should return feature products', async () => {
      const mockFeatureProducts = [{ id: 1, name: 'Product 1', revenue: 100 }];
      mockOrderProductRepo.getFeatureProductsByRevenue.mockResolvedValue(mockFeatureProducts);

      const result = await service.getFeatureProduct();

      expect(result).toEqual(mockFeatureProducts);
      expect(mockOrderProductRepo.getFeatureProductsByRevenue).toHaveBeenCalled();
    });
  });

  describe('getManageUserDashBoard', () => {
    it('should return user dashboard statistics', async () => {
      const mockUserData = {
        totalUsers: 100,
        usersThisWeek: 10,
        usersLastWeek: 15,
        usersBoughtThisWeek: 5,
        usersBoughtLastWeek: 7,
      };

      mockUserRepo.count.mockResolvedValue(mockUserData.totalUsers);
      mockUserRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(mockUserData.usersThisWeek),
      });

      const result = await service.getManageUserDashBoard();

      expect(result).toEqual(mockUserData);
    });
  });
});
