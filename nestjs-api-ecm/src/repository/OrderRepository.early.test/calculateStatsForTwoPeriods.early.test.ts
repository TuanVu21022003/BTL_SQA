
import { OrderRepository } from '../OrderRepository';
import { DataSource } from 'typeorm';
import { OrderStatus, PaymentStatus } from 'src/share/Enum/Enum';

describe('OrderRepository.calculateStatsForTwoPeriods() calculateStatsForTwoPeriods method', () => {
  let repository: OrderRepository;
  let mockQueryBuilder: any;

  beforeEach(() => {
    // Create mock query builder
    mockQueryBuilder = {
      leftJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      setParameters: jest.fn().mockReturnThis(),
      getRawOne: jest.fn(),
    };

    // Create mock DataSource
    const mockDataSource = {
      createQueryBuilder: jest.fn(),
      manager: {},
    } as unknown as DataSource;

    // Create repository instance
    repository = new OrderRepository(mockDataSource);

    // Mock createQueryBuilder method on repository instance
    jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder);
  });

  describe('Happy paths', () => {
    it('should calculate stats correctly for given periods', async () => {
      // Arrange
      mockQueryBuilder.getRawOne.mockResolvedValue({
        currentRevenue: '1000',
        lastRevenue: '800',
        currentQuantity: '50',
        lastQuantity: '40',
        currentTotalOrders: '10',
        lastTotalOrders: '8',
        currentTotalCustomers: '5',
        lastTotalCustomers: '4',
      });

      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-01-31');
      const lastStartDate = new Date('2022-12-01');
      const lastEndDate = new Date('2022-12-31');

      // Act
      const result = await repository.calculateStatsForTwoPeriods(
        startDate,
        endDate,
        lastStartDate,
        lastEndDate
      );

      // Assert
      expect(result).toEqual({
        currentRevenue: 1000,
        lastRevenue: 800,
        currentQuantity: 50,
        lastQuantity: 40,
        currentTotalOrders: 10,
        lastTotalOrders: 8,
        currentTotalCustomers: 5,
        lastTotalCustomers: 4,
      });

      // Verify query builder calls
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'orders.paymentStatus = :status',
        { status: PaymentStatus.Paid }
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'orders.orderStatus = :orderStatus',
        { orderStatus: OrderStatus.Delivered }
      );
      expect(mockQueryBuilder.setParameters).toHaveBeenCalledWith({
        startDate,
        endDate,
        lastStartDate,
        lastEndDate,
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty results gracefully', async () => {
      // Arrange
      mockQueryBuilder.getRawOne.mockResolvedValue({});

      // Act
      const result = await repository.calculateStatsForTwoPeriods(
        new Date('2023-01-01'),
        new Date('2023-01-31'),
        new Date('2022-12-01'),
        new Date('2022-12-31')
      );

      // Assert
      expect(result).toEqual({
        currentRevenue: 0,
        lastRevenue: 0,
        currentQuantity: 0,
        lastQuantity: 0,
        currentTotalOrders: 0,
        lastTotalOrders: 0,
        currentTotalCustomers: 0,
        lastTotalCustomers: 0,
      });
    });

    it('should handle invalid date ranges', async () => {
      // Arrange
      mockQueryBuilder.getRawOne.mockResolvedValue({
        currentRevenue: null,
        lastRevenue: null,
        currentQuantity: null,
        lastQuantity: null,
        currentTotalOrders: null,
        lastTotalOrders: null,
        currentTotalCustomers: null,
        lastTotalCustomers: null,
      });

      // Act
      const result = await repository.calculateStatsForTwoPeriods(
        new Date('2023-01-31'),
        new Date('2023-01-01'), // Invalid range
        new Date('2022-12-31'),
        new Date('2022-12-01')  // Invalid range
      );

      // Assert
      expect(result).toEqual({
        currentRevenue: 0,
        lastRevenue: 0,
        currentQuantity: 0,
        lastQuantity: 0,
        currentTotalOrders: 0,
        lastTotalOrders: 0,
        currentTotalCustomers: 0,
        lastTotalCustomers: 0,
      });
    });
  });
});
