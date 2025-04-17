import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { OrderRepository } from 'src/repository/OrderRepository';
import { OrderProductRepository } from 'src/repository/OrderProductRepository';
import { ImportRepository } from 'src/repository/ImportRepository';
import { ImportProductRepository } from 'src/repository/ImportProductRepository';
import { UserRepository } from 'src/repository/UserRepository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TimeFilter, OrderStatus } from 'src/share/Enum/Enum';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

describe('DashboardService', () => {
  let service: DashboardService;
  let orderRepository: jest.Mocked<OrderRepository>;
  let orderProductRepository: jest.Mocked<OrderProductRepository>;
  let importRepository: jest.Mocked<ImportRepository>;
  let importProductRepository: jest.Mocked<ImportProductRepository>;
  let userRepository: jest.Mocked<UserRepository>;

  // Mock repositories
  const mockOrderRepository = {
    calculateStatsForTwoPeriods: jest.fn(),
    getFinancialSummary: jest.fn(),
    getTopCustomersByRevenue: jest.fn(),
    getRevenueBySupplier: jest.fn(),
    getRevenueByCategory: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockOrderProductRepository = {
    getTopProductsByRevenue: jest.fn(),
    getFeatureProductsByRevenue: jest.fn(),
  };

  const mockImportRepository = {
    // Add methods if needed
  };

  const mockImportProductRepository = {
    findLatestProducts: jest.fn(),
  };

  const mockUserRepository = {
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: getRepositoryToken(OrderRepository),
          useValue: mockOrderRepository,
        },
        {
          provide: getRepositoryToken(OrderProductRepository),
          useValue: mockOrderProductRepository,
        },
        {
          provide: getRepositoryToken(ImportRepository),
          useValue: mockImportRepository,
        },
        {
          provide: getRepositoryToken(ImportProductRepository),
          useValue: mockImportProductRepository,
        },
        {
          provide: getRepositoryToken(UserRepository),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    orderRepository = module.get(getRepositoryToken(OrderRepository)) as jest.Mocked<OrderRepository>;
    orderProductRepository = module.get(getRepositoryToken(OrderProductRepository)) as jest.Mocked<OrderProductRepository>;
    importRepository = module.get(getRepositoryToken(ImportRepository)) as jest.Mocked<ImportRepository>;
    importProductRepository = module.get(getRepositoryToken(ImportProductRepository)) as jest.Mocked<ImportProductRepository>;
    userRepository = module.get(getRepositoryToken(UserRepository)) as jest.Mocked<UserRepository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('timeFilterCreate', () => {
    it('should return correct date range for Week filter', () => {
      // Arrange
      const timeFilter = TimeFilter.Week;
      const now = new Date();
      jest.spyOn(global, 'Date').mockImplementation(() => now);

      // Act
      const result = service.timeFilterCreate(timeFilter);

      // Assert
      expect(result.startDate).toEqual(startOfWeek(now, { weekStartsOn: 1 }));
      expect(result.endDate).toEqual(endOfWeek(now, { weekStartsOn: 1 }));
    });

    it('should return correct date range for Month filter', () => {
      // Arrange
      const timeFilter = TimeFilter.Month;
      const now = new Date();
      jest.spyOn(global, 'Date').mockImplementation(() => now);

      // Act
      const result = service.timeFilterCreate(timeFilter);

      // Assert
      expect(result.startDate).toEqual(startOfMonth(now));
      expect(result.endDate).toEqual(endOfMonth(now));
    });

    it('should return correct date range for Year filter', () => {
      // Arrange
      const timeFilter = TimeFilter.Year;
      const now = new Date();
      jest.spyOn(global, 'Date').mockImplementation(() => now);

      // Act
      const result = service.timeFilterCreate(timeFilter);

      // Assert
      expect(result.startDate).toEqual(startOfYear(now));
      expect(result.endDate).toEqual(endOfYear(now));
    });

    it('should return correct date range for Quarter filter', () => {
      // Arrange
      const timeFilter = TimeFilter.Quarter;
      const now = new Date('2023-05-15'); // Q2
      jest.spyOn(global, 'Date').mockImplementation(() => now);

      // Act
      const result = service.timeFilterCreate(timeFilter);

      // Assert
      const expectedStartDate = new Date(2023, 3, 1); // April 1, 2023 (Q2 start)
      const expectedEndDate = new Date(2023, 6, 0); // June 30, 2023 (Q2 end)
      expect(result.startDate).toEqual(expectedStartDate);
      expect(result.endDate).toEqual(expectedEndDate);
    });

    it('should throw error for invalid time filter', () => {
      // Arrange
      const timeFilter = 'InvalidFilter' as TimeFilter;

      // Act & Assert
      expect(() => service.timeFilterCreate(timeFilter)).toThrow('Invalid time filter');
    });
  });

  describe('lastTimeFilterCreate', () => {
    it('should return correct previous date range for Week filter', () => {
      // Arrange
      const timeFilter = TimeFilter.Week;
      const startDate = new Date('2023-05-01');
      const endDate = new Date('2023-05-07');

      // Act
      const result = service.lastTimeFilterCreate(startDate, endDate, timeFilter);

      // Assert
      expect(result.lastStartDate).toEqual(new Date('2023-04-24'));
      expect(result.lastEndDate).toEqual(new Date('2023-04-30'));
    });

    it('should return correct previous date range for Month filter', () => {
      // Arrange
      const timeFilter = TimeFilter.Month;
      const startDate = new Date('2023-05-01');
      const endDate = new Date('2023-05-31');

      // Act
      const result = service.lastTimeFilterCreate(startDate, endDate, timeFilter);

      // Assert
      expect(result.lastStartDate).toEqual(new Date('2023-04-01'));
      expect(result.lastEndDate).toEqual(new Date('2023-04-30'));
    });

    it('should return correct previous date range for Quarter filter', () => {
      // Arrange
      const timeFilter = TimeFilter.Quarter;
      const startDate = new Date('2023-04-01');
      const endDate = new Date('2023-06-30');

      // Act
      const result = service.lastTimeFilterCreate(startDate, endDate, timeFilter);

      // Assert
      expect(result.lastStartDate).toEqual(new Date('2023-01-01'));
      expect(result.lastEndDate).toEqual(new Date('2023-03-30'));
    });

    it('should return correct previous date range for Year filter', () => {
      // Arrange
      const timeFilter = TimeFilter.Year;
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');

      // Act
      const result = service.lastTimeFilterCreate(startDate, endDate, timeFilter);

      // Assert
      expect(result.lastStartDate).toEqual(new Date('2022-01-01'));
      expect(result.lastEndDate).toEqual(new Date('2022-12-31'));
    });

    it('should throw error for invalid time filter', () => {
      // Arrange
      const timeFilter = 'InvalidFilter' as TimeFilter;
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-01-31');

      // Act & Assert
      expect(() => service.lastTimeFilterCreate(startDate, endDate, timeFilter)).toThrow('Unsupported time period for lastTimeFilterCreate.');
    });
  });

  describe('getSummaryStatistic', () => {
    it('should return summary statistics for a given time filter', async () => {
      // Arrange
      const timeFilter = TimeFilter.Week;
      const mockStartDate = new Date('2023-05-01');
      const mockEndDate = new Date('2023-05-07');
      const mockLastStartDate = new Date('2023-04-24');
      const mockLastEndDate = new Date('2023-04-30');

      jest.spyOn(service, 'timeFilterCreate').mockReturnValue({
        startDate: mockStartDate,
        endDate: mockEndDate,
      });

      jest.spyOn(service, 'lastTimeFilterCreate').mockReturnValue({
        lastStartDate: mockLastStartDate,
        lastEndDate: mockLastEndDate,
      });

      const mockStats = {
        currentRevenue: 1000,
        lastRevenue: 800,
        currentQuantity: 50,
        lastQuantity: 40,
        currentTotalOrders: 30,
        lastTotalOrders: 25,
        currentTotalCustomers: 20,
        lastTotalCustomers: 15,
      };

      orderRepository.calculateStatsForTwoPeriods.mockResolvedValue(mockStats);

      // Act
      const result = await service.getSummaryStatistic(timeFilter);

      // Assert
      expect(service.timeFilterCreate).toHaveBeenCalledWith(timeFilter);
      expect(service.lastTimeFilterCreate).toHaveBeenCalledWith(mockStartDate, mockEndDate, timeFilter);
      expect(orderRepository.calculateStatsForTwoPeriods).toHaveBeenCalledWith(
        mockStartDate,
        mockEndDate,
        mockLastStartDate,
        mockLastEndDate
      );
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
    });
  });

  describe('getFinancialSummaryByTime', () => {
    it('should return financial summary data with correct number conversions', async () => {
      // Arrange
      const timeFilter = TimeFilter.Month;
      const mockFinancialData = [
        {
          time_period: '2023-05',
          total_revenue: '5000.50',
          total_cost: '3000.25',
          profit: '2000.25',
        },
        {
          time_period: '2023-06',
          total_revenue: '6000.75',
          total_cost: '3500.50',
          profit: '2500.25',
        },
      ];

      orderRepository.getFinancialSummary.mockResolvedValue(mockFinancialData);

      // Act
      const result = await service.getFinancialSummaryByTime(timeFilter);

      // Assert
      expect(orderRepository.getFinancialSummary).toHaveBeenCalledWith(timeFilter);
      expect(result).toEqual([
        {
          time_period: '2023-05',
          total_revenue: 5000.50,
          total_cost: 3000.25,
          profit: 2000.25,
        },
        {
          time_period: '2023-06',
          total_revenue: 6000.75,
          total_cost: 3500.50,
          profit: 2500.25,
        },
      ]);
    });

    it('should handle null or undefined values in financial data', async () => {
      // Arrange
      const timeFilter = TimeFilter.Month;
      const mockFinancialData = [
        {
          time_period: '2023-05',
          total_revenue: null,
          total_cost: undefined,
          profit: '',
        },
      ];

      orderRepository.getFinancialSummary.mockResolvedValue(mockFinancialData);

      // Act
      const result = await service.getFinancialSummaryByTime(timeFilter);

      // Assert
      expect(orderRepository.getFinancialSummary).toHaveBeenCalledWith(timeFilter);
      expect(result).toEqual([
        {
          time_period: '2023-05',
          total_revenue: 0,
          total_cost: 0,
          profit: 0,
        },
      ]);
    });
  });

  describe('getTopProductsByRevenue', () => {
    it('should return top products by revenue for a given time filter', async () => {
      // Arrange
      const timeFilter = TimeFilter.Month;
      const mockStartDate = new Date('2023-05-01');
      const mockEndDate = new Date('2023-05-31');
      const mockLastStartDate = new Date('2023-04-01');
      const mockLastEndDate = new Date('2023-04-30');

      jest.spyOn(service, 'timeFilterCreate').mockReturnValue({
        startDate: mockStartDate,
        endDate: mockEndDate,
      });

      jest.spyOn(service, 'lastTimeFilterCreate').mockReturnValue({
        lastStartDate: mockLastStartDate,
        lastEndDate: mockLastEndDate,
      });

      const mockTopProducts = [
        { product_id: '1', product_name: 'Product 1', total_revenue: 3000 },
        { product_id: '2', product_name: 'Product 2', total_revenue: 2500 },
      ];

      orderProductRepository.getTopProductsByRevenue.mockResolvedValue(mockTopProducts);

      // Act
      const result = await service.getTopProductsByRevenue(timeFilter);

      // Assert
      expect(service.timeFilterCreate).toHaveBeenCalledWith(timeFilter);
      expect(service.lastTimeFilterCreate).toHaveBeenCalledWith(mockStartDate, mockEndDate, timeFilter);
      expect(orderProductRepository.getTopProductsByRevenue).toHaveBeenCalledWith(mockStartDate, mockEndDate);
      expect(result).toEqual(mockTopProducts);
    });
  });

  describe('getTopCustomersByRevenue', () => {
    it('should return top customers by revenue for a given time filter', async () => {
      // Arrange
      const timeFilter = TimeFilter.Year;
      const mockStartDate = new Date('2023-01-01');
      const mockEndDate = new Date('2023-12-31');
      const mockLastStartDate = new Date('2022-01-01');
      const mockLastEndDate = new Date('2022-12-31');

      jest.spyOn(service, 'timeFilterCreate').mockReturnValue({
        startDate: mockStartDate,
        endDate: mockEndDate,
      });

      jest.spyOn(service, 'lastTimeFilterCreate').mockReturnValue({
        lastStartDate: mockLastStartDate,
        lastEndDate: mockLastEndDate,
      });

      const mockTopCustomers = [
        { user_id: '1', user_name: 'User 1', total_revenue: 10000 },
        { user_id: '2', user_name: 'User 2', total_revenue: 8000 },
      ];

      orderRepository.getTopCustomersByRevenue.mockResolvedValue(mockTopCustomers);

      // Act
      const result = await service.getTopCustomersByRevenue(timeFilter);

      // Assert
      expect(service.timeFilterCreate).toHaveBeenCalledWith(timeFilter);
      expect(service.lastTimeFilterCreate).toHaveBeenCalledWith(mockStartDate, mockEndDate, timeFilter);
      expect(orderRepository.getTopCustomersByRevenue).toHaveBeenCalledWith(mockStartDate, mockEndDate);
      expect(result).toEqual(mockTopCustomers);
    });
  });

  describe('getRevenueBySupplier', () => {
    it('should return revenue by supplier for a given time filter', async () => {
      // Arrange
      const timeFilter = TimeFilter.Quarter;
      const mockStartDate = new Date('2023-04-01');
      const mockEndDate = new Date('2023-06-30');
      const mockLastStartDate = new Date('2023-01-01');
      const mockLastEndDate = new Date('2023-03-31');

      jest.spyOn(service, 'timeFilterCreate').mockReturnValue({
        startDate: mockStartDate,
        endDate: mockEndDate,
      });

      jest.spyOn(service, 'lastTimeFilterCreate').mockReturnValue({
        lastStartDate: mockLastStartDate,
        lastEndDate: mockLastEndDate,
      });

      const mockRevenueBySupplier = [
        { supplier_id: '1', supplier_name: 'Supplier 1', total_revenue: 5000 },
        { supplier_id: '2', supplier_name: 'Supplier 2', total_revenue: 4000 },
      ];

      orderRepository.getRevenueBySupplier.mockResolvedValue(mockRevenueBySupplier);

      // Act
      const result = await service.getRevenueBySupplier(timeFilter);

      // Assert
      expect(service.timeFilterCreate).toHaveBeenCalledWith(timeFilter);
      expect(service.lastTimeFilterCreate).toHaveBeenCalledWith(mockStartDate, mockEndDate, timeFilter);
      expect(orderRepository.getRevenueBySupplier).toHaveBeenCalledWith(mockStartDate, mockEndDate);
      expect(result).toEqual(mockRevenueBySupplier);
    });
  });

  describe('getRevenueByCategory', () => {
    it('should return revenue by category for a given time filter', async () => {
      // Arrange
      const timeFilter = TimeFilter.Week;
      const mockStartDate = new Date('2023-05-01');
      const mockEndDate = new Date('2023-05-07');
      const mockLastStartDate = new Date('2023-04-24');
      const mockLastEndDate = new Date('2023-04-30');

      jest.spyOn(service, 'timeFilterCreate').mockReturnValue({
        startDate: mockStartDate,
        endDate: mockEndDate,
      });

      jest.spyOn(service, 'lastTimeFilterCreate').mockReturnValue({
        lastStartDate: mockLastStartDate,
        lastEndDate: mockLastEndDate,
      });

      const mockRevenueByCategory = [
        { category_id: '1', category_name: 'Category 1', total_revenue: 6000 },
        { category_id: '2', category_name: 'Category 2', total_revenue: 4500 },
      ];

      orderRepository.getRevenueByCategory.mockResolvedValue(mockRevenueByCategory);

      // Act
      const result = await service.getRevenueByCategory(timeFilter);

      // Assert
      expect(service.timeFilterCreate).toHaveBeenCalledWith(timeFilter);
      expect(service.lastTimeFilterCreate).toHaveBeenCalledWith(mockStartDate, mockEndDate, timeFilter);
      expect(orderRepository.getRevenueByCategory).toHaveBeenCalledWith(mockStartDate, mockEndDate);
      expect(result).toEqual(mockRevenueByCategory);
    });
  });

  describe('getLatestProduct', () => {
    it('should return latest products', async () => {
      // Arrange
      const mockLatestProducts = [
        { id: '1', name: 'Product 1', created_at: '2023-05-15' },
        { id: '2', name: 'Product 2', created_at: '2023-05-14' },
      ];

      importProductRepository.findLatestProducts.mockResolvedValue(mockLatestProducts);

      // Act
      const result = await service.getLatestProduct();

      // Assert
      expect(importProductRepository.findLatestProducts).toHaveBeenCalled();
      expect(result).toEqual(mockLatestProducts);
    });
  });

  describe('getFeatureProduct', () => {
    it('should return feature products by revenue', async () => {
      // Arrange
      const mockFeatureProducts = [
        { id: '1', name: 'Feature Product 1', sales: 100 },
        { id: '2', name: 'Feature Product 2', sales: 80 },
      ];

      orderProductRepository.getFeatureProductsByRevenue.mockResolvedValue(mockFeatureProducts);

      // Act
      const result = await service.getFeatureProduct();

      // Assert
      expect(orderProductRepository.getFeatureProductsByRevenue).toHaveBeenCalled();
      expect(result).toEqual(mockFeatureProducts);
    });
  });

  describe('getManageUserDashBoard', () => {
    it('should return user dashboard data', async () => {
      // Arrange
      // Mock Date
      const mockToday = new Date('2023-05-15'); // Monday
      jest.spyOn(global, 'Date').mockImplementation(() => mockToday);

      // Mock startOfThisWeek calculation
      const mockStartOfThisWeek = new Date('2023-05-14'); // Sunday
      const mockStartOfLastWeek = new Date('2023-05-07'); // Sunday of last week
      const mockEndOfLastWeek = new Date('2023-05-13'); // Saturday of last week

      // Mock query builders
      const mockUserQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn(),
      };

      const mockOrderQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn(),
      };

      userRepository.createQueryBuilder.mockReturnValue(mockUserQueryBuilder as any);
      orderRepository.createQueryBuilder.mockReturnValue(mockOrderQueryBuilder as any);

      // Mock query results
      mockUserQueryBuilder.getCount
        .mockResolvedValueOnce(100) // totalUsers
        .mockResolvedValueOnce(10)  // usersThisWeek
        .mockResolvedValueOnce(8);  // usersLastWeek

      mockOrderQueryBuilder.getRawOne
        .mockResolvedValueOnce({ userCount: 50 })  // userBoughtCount
        .mockResolvedValueOnce({ userCount: 5 })   // usersBoughtThisWeek
        .mockResolvedValueOnce({ userCount: 4 });  // usersBoughtLastWeek

      // Act
      const result = await service.getManageUserDashBoard();

      // Assert
      // Verify userRepository calls
      expect(userRepository.createQueryBuilder).toHaveBeenCalledTimes(3);
      expect(mockUserQueryBuilder.where).toHaveBeenCalledWith('user.role = :role', { role: 'user' });

      // Verify orderRepository calls
      expect(orderRepository.createQueryBuilder).toHaveBeenCalledTimes(3);
      expect(mockOrderQueryBuilder.select).toHaveBeenCalledWith('COUNT(DISTINCT order.user_id)', 'userCount');
      expect(mockOrderQueryBuilder.where).toHaveBeenCalledWith(
        'order.orderStatus IN (:...statuses)',
        { statuses: [OrderStatus.Delivered, OrderStatus.Canceled] }
      );

      // Verify result
      expect(result).toEqual({
        totalUsers: 100,
        usersThisWeek: 10,
        usersLastWeek: 8,
        usersBoughtThisWeek: { userCount: 5 },
        usersBoughtLastWeek: { userCount: 4 },
      });
    });

    it('should handle errors and return error object', async () => {
      // Arrange
      const mockError = new Error('Database error');
      userRepository.createQueryBuilder.mockImplementation(() => {
        throw mockError;
      });

      // Spy on console.error
      jest.spyOn(console, 'error').mockImplementation(() => {});

      // Act
      const result = await service.getManageUserDashBoard();

      // Assert
      expect(console.error).toHaveBeenCalledWith('Error fetching dashboard data:', mockError);
      expect(result).toEqual({
        error: mockError.toString(),
      });
    });
  });

  describe('Helper methods', () => {
    describe('addDays', () => {
      it('should add days to a date', () => {
        // Arrange
        const date = new Date('2023-05-15');
        const days = 5;

        // Act
        const result = service.addDays(date, days);

        // Assert
        expect(result).toEqual(new Date('2023-05-20'));
      });

      it('should subtract days from a date when days is negative', () => {
        // Arrange
        const date = new Date('2023-05-15');
        const days = -5;

        // Act
        const result = service.addDays(date, days);

        // Assert
        expect(result).toEqual(new Date('2023-05-10'));
      });
    });

    describe('addMonths', () => {
      it('should add months to a date', () => {
        // Arrange
        const date = new Date('2023-05-15');
        const months = 2;

        // Act
        const result = service.addMonths(date, months);

        // Assert
        expect(result).toEqual(new Date('2023-07-15'));
      });

      it('should subtract months from a date when months is negative', () => {
        // Arrange
        const date = new Date('2023-05-15');
        const months = -2;

        // Act
        const result = service.addMonths(date, months);

        // Assert
        expect(result).toEqual(new Date('2023-03-15'));
      });

      it('should handle month overflow correctly', () => {
        // Arrange
        const date = new Date('2023-01-31'); // January 31
        const months = 1;

        // Act
        const result = service.addMonths(date, months);

        // Assert
        // February doesn't have 31 days, so it should be February 28 (or 29 in leap years)
        // In 2023, February has 28 days
        expect(result.getFullYear()).toBe(2023);
        expect(result.getMonth()).toBe(1); // February (0-indexed)
        // The day might be 28 due to JavaScript's Date handling
        expect(result.getDate()).toBe(28);
      });
    });

    describe('addYears', () => {
      it('should add years to a date', () => {
        // Arrange
        const date = new Date('2023-05-15');
        const years = 2;

        // Act
        const result = service.addYears(date, years);

        // Assert
        expect(result).toEqual(new Date('2025-05-15'));
      });

      it('should subtract years from a date when years is negative', () => {
        // Arrange
        const date = new Date('2023-05-15');
        const years = -2;

        // Act
        const result = service.addYears(date, years);

        // Assert
        expect(result).toEqual(new Date('2021-05-15'));
      });

      it('should handle leap years correctly', () => {
        // Arrange
        const date = new Date('2020-02-29'); // Leap day
        const years = 1;

        // Act
        const result = service.addYears(date, years);

        // Assert
        // 2021 is not a leap year, so February 29 doesn't exist
        // JavaScript's Date will handle this by moving to March 1
        expect(result.getFullYear()).toBe(2021);
        expect(result.getMonth()).toBe(1); // February (0-indexed)
        expect(result.getDate()).toBe(28); // Last day of February in 2021
      });
    });
  });
});
