import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { TimeFilter } from 'src/share/Enum/Enum';
import { responseHandler } from 'src/Until/responseUtil';
import { AuthGuard } from 'src/guards/JwtAuth.guard';
import { RolesGuard } from 'src/guards/Roles.guard';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

// Mock cho responseHandler
jest.mock('src/Until/responseUtil', () => ({
  responseHandler: {
    ok: jest.fn(data => ({ success: true, data, status: 200, message: 'SUCCESS!' })),
    error: jest.fn(message => ({ success: false, status: 500, message: message || 'Internal server error' })),
  },
}));

// Mock cho AuthGuard và RolesGuard
jest.mock('src/guards/JwtAuth.guard', () => ({
  AuthGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn().mockReturnValue(true),
  })),
}));

jest.mock('src/guards/Roles.guard', () => ({
  RolesGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn().mockReturnValue(true),
  })),
}));

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: DashboardService;

  // Mock cho DashboardService
  const mockDashboardService = {
    getSummaryStatistic: jest.fn(),
    getFinancialSummaryByTime: jest.fn(),
    getTopProductsByRevenue: jest.fn(),
    getTopCustomersByRevenue: jest.fn(),
    getRevenueBySupplier: jest.fn(),
    getRevenueByCategory: jest.fn(),
    getLatestProduct: jest.fn(),
    getFeatureProduct: jest.fn(),
    getManageUserDashBoard: jest.fn(),
  };

  // Mock cho JwtService
  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  // Mock cho ConfigService
  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: mockDashboardService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    })
    .overrideGuard(AuthGuard)
    .useValue({ canActivate: jest.fn().mockReturnValue(true) })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: jest.fn().mockReturnValue(true) })
    .compile();

    controller = module.get<DashboardController>(DashboardController);
    service = module.get<DashboardService>(DashboardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('summaryStatistic', () => {
    it('should return summary statistics for a given time filter', async () => {
      // Arrange
      const timeFilter = TimeFilter.Week;
      const mockResult = {
        thisTime: {
          revenue: 1000,
          product: 50,
          customer: 20,
          order: 30,
        },
        lastTime: {
          revenue: 800,
          product: 40,
          customer: 15,
          order: 25,
        },
      };
      mockDashboardService.getSummaryStatistic.mockResolvedValue(mockResult);

      // Act
      const result = await controller.summaryStatistic(timeFilter);

      // Assert
      expect(service.getSummaryStatistic).toHaveBeenCalledWith(timeFilter);
      expect(responseHandler.ok).toHaveBeenCalledWith(mockResult);
      expect(result).toEqual(responseHandler.ok(mockResult));
    });

    it('should handle errors and return error response', async () => {
      // Arrange
      const timeFilter = TimeFilter.Week;
      const mockError = new Error('Test error');
      mockDashboardService.getSummaryStatistic.mockRejectedValue(mockError);

      // Act
      const result = await controller.summaryStatistic(timeFilter);

      // Assert
      expect(service.getSummaryStatistic).toHaveBeenCalledWith(timeFilter);
      expect(responseHandler.error).toHaveBeenCalledWith(mockError.message);
      expect(result).toEqual(responseHandler.error(mockError.message));
    });

    it('should handle non-Error objects and return stringified error', async () => {
      // Arrange
      const timeFilter = TimeFilter.Week;
      const mockError = { code: 500, message: 'Custom error object' };
      mockDashboardService.getSummaryStatistic.mockRejectedValue(mockError);

      // Act
      const result = await controller.summaryStatistic(timeFilter);

      // Assert
      expect(service.getSummaryStatistic).toHaveBeenCalledWith(timeFilter);
      expect(responseHandler.error).toHaveBeenCalledWith(JSON.stringify(mockError));
      expect(result).toEqual(responseHandler.error(JSON.stringify(mockError)));
    });
  });

  describe('getFinancialSummary', () => {
    it('should return financial summary for a given time filter', async () => {
      // Arrange
      const timeFilter = TimeFilter.Month;
      const mockResult = [
        {
          time_period: '2023-01',
          total_revenue: 5000,
          total_cost: 3000,
          profit: 2000,
        },
        {
          time_period: '2023-02',
          total_revenue: 6000,
          total_cost: 3500,
          profit: 2500,
        },
      ];
      mockDashboardService.getFinancialSummaryByTime.mockResolvedValue(mockResult);

      // Act
      const result = await controller.getFinancialSummary(timeFilter);

      // Assert
      expect(service.getFinancialSummaryByTime).toHaveBeenCalledWith(timeFilter);
      expect(responseHandler.ok).toHaveBeenCalledWith(mockResult);
      expect(result).toEqual(responseHandler.ok(mockResult));
    });

    it('should handle errors and return error response', async () => {
      // Arrange
      const timeFilter = TimeFilter.Month;
      const mockError = new Error('Failed to get financial summary');
      mockDashboardService.getFinancialSummaryByTime.mockRejectedValue(mockError);

      // Act
      const result = await controller.getFinancialSummary(timeFilter);

      // Assert
      expect(service.getFinancialSummaryByTime).toHaveBeenCalledWith(timeFilter);
      expect(responseHandler.error).toHaveBeenCalledWith(mockError.message);
      expect(result).toEqual(responseHandler.error(mockError.message));
    });
  });

  describe('getTopProducts', () => {
    it('should return top products by revenue for a given time filter', async () => {
      // Arrange
      const timeFilter = TimeFilter.Quarter;
      const mockResult = [
        { product_id: '1', product_name: 'Product 1', total_revenue: 3000 },
        { product_id: '2', product_name: 'Product 2', total_revenue: 2500 },
      ];
      mockDashboardService.getTopProductsByRevenue.mockResolvedValue(mockResult);

      // Act
      const result = await controller.getTopProducts(timeFilter);

      // Assert
      expect(service.getTopProductsByRevenue).toHaveBeenCalledWith(timeFilter);
      expect(responseHandler.ok).toHaveBeenCalledWith(mockResult);
      expect(result).toEqual(responseHandler.ok(mockResult));
    });

    it('should handle errors and return error response', async () => {
      // Arrange
      const timeFilter = TimeFilter.Quarter;
      const mockError = new Error('Failed to get top products');
      mockDashboardService.getTopProductsByRevenue.mockRejectedValue(mockError);

      // Act
      const result = await controller.getTopProducts(timeFilter);

      // Assert
      expect(service.getTopProductsByRevenue).toHaveBeenCalledWith(timeFilter);
      expect(responseHandler.error).toHaveBeenCalledWith(mockError.message);
      expect(result).toEqual(responseHandler.error(mockError.message));
    });
  });

  describe('getTopCustomers', () => {
    it('should return top customers by revenue for a given time filter', async () => {
      // Arrange
      const timeFilter = TimeFilter.Year;
      const mockResult = [
        { user_id: '1', user_name: 'User 1', total_revenue: 10000 },
        { user_id: '2', user_name: 'User 2', total_revenue: 8000 },
      ];
      mockDashboardService.getTopCustomersByRevenue.mockResolvedValue(mockResult);

      // Act
      const result = await controller.getTopCustomers(timeFilter);

      // Assert
      expect(service.getTopCustomersByRevenue).toHaveBeenCalledWith(timeFilter);
      expect(responseHandler.ok).toHaveBeenCalledWith(mockResult);
      expect(result).toEqual(responseHandler.ok(mockResult));
    });

    it('should handle errors and return error response', async () => {
      // Arrange
      const timeFilter = TimeFilter.Year;
      const mockError = new Error('Failed to get top customers');
      mockDashboardService.getTopCustomersByRevenue.mockRejectedValue(mockError);

      // Act
      const result = await controller.getTopCustomers(timeFilter);

      // Assert
      expect(service.getTopCustomersByRevenue).toHaveBeenCalledWith(timeFilter);
      expect(responseHandler.error).toHaveBeenCalledWith(mockError.message);
      expect(result).toEqual(responseHandler.error(mockError.message));
    });
  });

  describe('getRevenueBySupplier', () => {
    it('should return revenue by supplier for a given time filter', async () => {
      // Arrange
      const timeFilter = TimeFilter.Week;
      const mockResult = [
        { supplier_id: '1', supplier_name: 'Supplier 1', total_revenue: 5000 },
        { supplier_id: '2', supplier_name: 'Supplier 2', total_revenue: 4000 },
      ];
      mockDashboardService.getRevenueBySupplier.mockResolvedValue(mockResult);

      // Act
      const result = await controller.getRevenueBySupplier(timeFilter);

      // Assert
      expect(service.getRevenueBySupplier).toHaveBeenCalledWith(timeFilter);
      expect(responseHandler.ok).toHaveBeenCalledWith(mockResult);
      expect(result).toEqual(responseHandler.ok(mockResult));
    });

    it('should handle errors and return error response', async () => {
      // Arrange
      const timeFilter = TimeFilter.Week;
      const mockError = new Error('Failed to get revenue by supplier');
      mockDashboardService.getRevenueBySupplier.mockRejectedValue(mockError);

      // Act
      const result = await controller.getRevenueBySupplier(timeFilter);

      // Assert
      expect(service.getRevenueBySupplier).toHaveBeenCalledWith(timeFilter);
      expect(responseHandler.error).toHaveBeenCalledWith(mockError.message);
      expect(result).toEqual(responseHandler.error(mockError.message));
    });
  });

  describe('getRevenueByCategory', () => {
    it('should return revenue by category for a given time filter', async () => {
      // Arrange
      const timeFilter = TimeFilter.Month;
      const mockResult = [
        { category_id: '1', category_name: 'Category 1', total_revenue: 6000 },
        { category_id: '2', category_name: 'Category 2', total_revenue: 4500 },
      ];
      mockDashboardService.getRevenueByCategory.mockResolvedValue(mockResult);

      // Act
      const result = await controller.getRevenueByCategory(timeFilter);

      // Assert
      expect(service.getRevenueByCategory).toHaveBeenCalledWith(timeFilter);
      expect(responseHandler.ok).toHaveBeenCalledWith(mockResult);
      expect(result).toEqual(responseHandler.ok(mockResult));
    });

    it('should handle errors and return error response', async () => {
      // Arrange
      const timeFilter = TimeFilter.Month;
      const mockError = new Error('Failed to get revenue by category');
      mockDashboardService.getRevenueByCategory.mockRejectedValue(mockError);

      // Act
      const result = await controller.getRevenueByCategory(timeFilter);

      // Assert
      expect(service.getRevenueByCategory).toHaveBeenCalledWith(timeFilter);
      expect(responseHandler.error).toHaveBeenCalledWith(mockError.message);
      expect(result).toEqual(responseHandler.error(mockError.message));
    });
  });

  describe('getLateProduct', () => {
    it('should return latest products', async () => {
      // Arrange
      const mockResult = [
        { id: '1', name: 'Product 1', created_at: '2023-01-01' },
        { id: '2', name: 'Product 2', created_at: '2023-01-02' },
      ];
      mockDashboardService.getLatestProduct.mockResolvedValue(mockResult);

      // Act
      const result = await controller.getLateProduct();

      // Assert
      expect(service.getLatestProduct).toHaveBeenCalled();
      expect(responseHandler.ok).toHaveBeenCalledWith(mockResult);
      expect(result).toEqual(responseHandler.ok(mockResult));
    });

    it('should handle errors and return error response', async () => {
      // Arrange
      const mockError = new Error('Failed to get latest products');
      mockDashboardService.getLatestProduct.mockRejectedValue(mockError);

      // Act
      const result = await controller.getLateProduct();

      // Assert
      expect(service.getLatestProduct).toHaveBeenCalled();
      expect(responseHandler.error).toHaveBeenCalledWith(mockError.message);
      expect(result).toEqual(responseHandler.error(mockError.message));
    });
  });

  describe('getFeatureProduct', () => {
    it('should return feature products', async () => {
      // Arrange
      const mockResult = [
        { id: '1', name: 'Feature Product 1', sales: 100 },
        { id: '2', name: 'Feature Product 2', sales: 80 },
      ];
      mockDashboardService.getFeatureProduct.mockResolvedValue(mockResult);

      // Act
      const result = await controller.getFeatureProduct();

      // Assert
      expect(service.getFeatureProduct).toHaveBeenCalled();
      expect(responseHandler.ok).toHaveBeenCalledWith(mockResult);
      expect(result).toEqual(responseHandler.ok(mockResult));
    });

    it('should handle errors and return error response', async () => {
      // Arrange
      const mockError = new Error('Failed to get feature products');
      mockDashboardService.getFeatureProduct.mockRejectedValue(mockError);

      // Act
      const result = await controller.getFeatureProduct();

      // Assert
      expect(service.getFeatureProduct).toHaveBeenCalled();
      expect(responseHandler.error).toHaveBeenCalledWith(mockError.message);
      expect(result).toEqual(responseHandler.error(mockError.message));
    });
  });

  describe('getManageUserDashBoard', () => {
    it('should return user dashboard data', async () => {
      // Arrange
      const mockResult = {
        totalUsers: 100,
        usersThisWeek: 10,
        usersLastWeek: 8,
        usersBoughtThisWeek: 5,
        usersBoughtLastWeek: 4,
      };
      mockDashboardService.getManageUserDashBoard.mockResolvedValue(mockResult);

      // Act
      const result = await controller.getManageUserDashBoard();

      // Assert
      expect(service.getManageUserDashBoard).toHaveBeenCalled();
      expect(responseHandler.ok).toHaveBeenCalledWith(mockResult);
      expect(result).toEqual(responseHandler.ok(mockResult));
    });

    it('should handle errors and return error response', async () => {
      // Arrange
      const mockError = new Error('Failed to get user dashboard data');
      mockDashboardService.getManageUserDashBoard.mockRejectedValue(mockError);

      // Act
      const result = await controller.getManageUserDashBoard();

      // Assert
      expect(service.getManageUserDashBoard).toHaveBeenCalled();
      expect(responseHandler.error).toHaveBeenCalledWith(mockError.message);
      expect(result).toEqual(responseHandler.error(mockError.message));
    });
  });
});
