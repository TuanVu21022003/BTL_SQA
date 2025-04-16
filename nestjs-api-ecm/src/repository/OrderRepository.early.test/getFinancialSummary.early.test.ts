
import { TimeFilter } from "src/share/Enum/Enum";
import { OrderRepository } from '../OrderRepository';
import { DataSource } from 'typeorm';

describe('OrderRepository.getFinancialSummary() getFinancialSummary method', () => {
  let orderRepository: OrderRepository;
  let mockQueryBuilder: any;
  let realDate: DateConstructor;

  beforeAll(() => {
    realDate = global.Date;
    const mockDate = new Date(2023, 0, 1);
    global.Date = class extends Date {
      constructor() {
        super();
        return mockDate;
      }
      static now() {
        return mockDate.getTime();
      }
    } as DateConstructor;
  });

  afterAll(() => {
    global.Date = realDate;
  });

  beforeEach(() => {
    mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(),
    };

    const mockDataSource = {
      createQueryBuilder: jest.fn(),
      manager: {},
    } as unknown as DataSource;

    orderRepository = new OrderRepository(mockDataSource);
    jest.spyOn(orderRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder);
  });

  describe('Happy Paths', () => {
    it('should return financial summary for the current week', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([
        { time_period: '2023-W1', total_revenue: 1000, total_cost: 500, profit: 500 },
      ]);

      const result = await orderRepository.getFinancialSummary(TimeFilter.Week);

      expect(result).toEqual([
        { time_period: '2023-W1', total_revenue: 1000, total_cost: 500, profit: 500 },
      ]);
      expect(mockQueryBuilder.select).toHaveBeenCalled();
      expect(mockQueryBuilder.leftJoin).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(mockQueryBuilder.groupBy).toHaveBeenCalled();
      expect(mockQueryBuilder.orderBy).toHaveBeenCalled();
    });

    it('should return financial summary for the current month', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([
        { time_period: '2023-01', total_revenue: 2000, total_cost: 1000, profit: 1000 },
      ]);

      const result = await orderRepository.getFinancialSummary(TimeFilter.Month);

      expect(result).toEqual([
        { time_period: '2023-01', total_revenue: 2000, total_cost: 1000, profit: 1000 },
        { time_period: '2023-02', total_revenue: 0, total_cost: 0, profit: 0 },
        { time_period: '2023-03', total_revenue: 0, total_cost: 0, profit: 0 },
        { time_period: '2023-04', total_revenue: 0, total_cost: 0, profit: 0 },
        { time_period: '2023-05', total_revenue: 0, total_cost: 0, profit: 0 },
        { time_period: '2023-06', total_revenue: 0, total_cost: 0, profit: 0 },
        { time_period: '2023-07', total_revenue: 0, total_cost: 0, profit: 0 },
        { time_period: '2023-08', total_revenue: 0, total_cost: 0, profit: 0 },
        { time_period: '2023-09', total_revenue: 0, total_cost: 0, profit: 0 },
        { time_period: '2023-10', total_revenue: 0, total_cost: 0, profit: 0 },
        { time_period: '2023-11', total_revenue: 0, total_cost: 0, profit: 0 },
        { time_period: '2023-12', total_revenue: 0, total_cost: 0, profit: 0 },
      ]);
    });

    it('should return financial summary for the current quarter', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([
        { time_period: '2023-Q1', total_revenue: 3000, total_cost: 1500, profit: 1500 },
      ]);

      const result = await orderRepository.getFinancialSummary(TimeFilter.Quarter);

      expect(result).toEqual([
        { time_period: '2023-Q1', total_revenue: 3000, total_cost: 1500, profit: 1500 },
        { time_period: '2023-Q2', total_revenue: 0, total_cost: 0, profit: 0 },
        { time_period: '2023-Q3', total_revenue: 0, total_cost: 0, profit: 0 },
        { time_period: '2023-Q4', total_revenue: 0, total_cost: 0, profit: 0 },
      ]);
    });

    it('should return financial summary for the current year', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([
        { time_period: '2023', total_revenue: 4000, total_cost: 2000, profit: 2000 },
      ]);

      const result = await orderRepository.getFinancialSummary(TimeFilter.Year);

      expect(result).toEqual([
        { time_period: '2023', total_revenue: 4000, total_cost: 2000, profit: 2000 },
        { time_period: '2022', total_revenue: 0, total_cost: 0, profit: 0 },
        { time_period: '2021', total_revenue: 0, total_cost: 0, profit: 0 },
        { time_period: '2020', total_revenue: 0, total_cost: 0, profit: 0 },
      ]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle an invalid TimeFilter', async () => {
      await expect(orderRepository.getFinancialSummary('Invalid' as any)).rejects.toThrow('Invalid TimeFilter');
    });

    it('should handle empty data from the database', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      const result = await orderRepository.getFinancialSummary(TimeFilter.Month);

      expect(result).toEqual([
        { time_period: '2023-01', total_revenue: 0, total_cost: 0, profit: 0 },
        { time_period: '2023-02', total_revenue: 0, total_cost: 0, profit: 0 },
        { time_period: '2023-03', total_revenue: 0, total_cost: 0, profit: 0 },
        { time_period: '2023-04', total_revenue: 0, total_cost: 0, profit: 0 },
        { time_period: '2023-05', total_revenue: 0, total_cost: 0, profit: 0 },
        { time_period: '2023-06', total_revenue: 0, total_cost: 0, profit: 0 },
        { time_period: '2023-07', total_revenue: 0, total_cost: 0, profit: 0 },
        { time_period: '2023-08', total_revenue: 0, total_cost: 0, profit: 0 },
        { time_period: '2023-09', total_revenue: 0, total_cost: 0, profit: 0 },
        { time_period: '2023-10', total_revenue: 0, total_cost: 0, profit: 0 },
        { time_period: '2023-11', total_revenue: 0, total_cost: 0, profit: 0 },
        { time_period: '2023-12', total_revenue: 0, total_cost: 0, profit: 0 },
      ]);
    });
  });
});
