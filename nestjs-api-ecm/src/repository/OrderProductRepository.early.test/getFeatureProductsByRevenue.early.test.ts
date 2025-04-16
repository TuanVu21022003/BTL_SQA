
/**
 * File: nestjs-api-ecm\src\repository\OrderProductRepository.early.test\getFeatureProductsByRevenue.early.test.ts
 * Class: OrderProductRepository
 * Method: getFeatureProductsByRevenue
 * 
 * Mô tả: Test suite cho phương thức getFeatureProductsByRevenue của OrderProductRepository
 * Chức năng: Lấy danh sách các sản phẩm nổi bật dựa trên doanh thu
 */

import { OrderProductRepository } from '../OrderProductRepository';
import { DataSource } from 'typeorm';
import { PaymentStatus, OrderStatus } from 'src/share/Enum/Enum';

describe('OrderProductRepository.getFeatureProductsByRevenue() getFeatureProductsByRevenue method', () => {
  let repository: OrderProductRepository;
  let mockQueryBuilder: any;

  /**
   * Setup trước mỗi test case
   * Khởi tạo các mock object và repository để test
   */
  beforeEach(() => {
    // Tạo mock query builder với các method cần thiết
    mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getRawMany: jest.fn()
    };

    // Tạo mock DataSource
    const mockDataSource = {
      createQueryBuilder: jest.fn(),
      manager: {},
    } as unknown as DataSource;

    // Khởi tạo repository với mock DataSource
    repository = new OrderProductRepository(mockDataSource);

    // Mock method createQueryBuilder của repository
    jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder);
  });

  describe('Happy paths', () => {
    /**
     * Test Case ID: TC001
     * Mục tiêu: Kiểm tra lấy top 5 sản phẩm có doanh thu cao nhất thành công
     * Input: Không có (phương thức không nhận tham số)
     * Expected Output: Mảng chứa thông tin của 2 sản phẩm nổi bật với các trường:
     * - productId, productName, productImage, priceout, categoryName
     * Ghi chú: Happy path - Trường hợp thành công với dữ liệu đầy đủ
     */
    it('should return the top 5 products by revenue', async () => {
      // Arrange: Chuẩn bị dữ liệu mẫu cho test case
      const mockProducts = [
        {
          productId: 1,
          productName: 'Product A',
          productImage: 'imageA.jpg',
          priceout: 100,
          categoryName: 'Category A',
          totalRevenue: 1000,
        },
        {
          productId: 2,
          productName: 'Product B',
          productImage: 'imageB.jpg',
          priceout: 200,
          categoryName: 'Category B',
          totalRevenue: 800,
        },
      ];
      mockQueryBuilder.getRawMany.mockResolvedValue(mockProducts);

      // Act: Gọi phương thức cần test
      const result = await repository.getFeatureProductsByRevenue();

      // Assert: Kiểm tra kết quả
      expect(result).toEqual([
        {
          productId: 1,
          productName: 'Product A',
          productImage: 'imageA.jpg',
          priceout: 100,
          categoryName: 'Category A',
        },
        {
          productId: 2,
          productName: 'Product B',
          productImage: 'imageB.jpg',
          priceout: 200,
          categoryName: 'Category B',
        },
      ]);

      // Kiểm tra các method của query builder được gọi đúng
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('order_product.product_id', 'productId');
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith('product.name', 'productName');
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith('product.url_images', 'productImage');
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith('product.priceout', 'priceout');
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith('category.name', 'categoryName');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('order.paymentStatus = :status', { status: PaymentStatus.Paid });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('order.orderStatus = :orderStatus', { orderStatus: OrderStatus.Delivered });
    });
  });

  describe('Edge cases', () => {
    /**
     * Test Case ID: TC002
     * Mục tiêu: Kiểm tra xử lý khi không có sản phẩm nào thỏa mãn điều kiện
     * Input: Không có (phương thức không nhận tham số)
     * Expected Output: Mảng rỗng []
     * Ghi chú: Edge case - Trường hợp không có dữ liệu thỏa mãn
     */
    it('should return an empty array if no products meet the criteria', async () => {
      // Arrange: Mock trả về mảng rỗng
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      // Act: Gọi phương thức cần test
      const result = await repository.getFeatureProductsByRevenue();

      // Assert: Kiểm tra kết quả là mảng rỗng
      expect(result).toEqual([]);
    });

    /**
     * Test Case ID: TC003
     * Mục tiêu: Kiểm tra xử lý khi có lỗi từ database
     * Input: Không có (phương thức không nhận tham số)
     * Expected Output: Throw Error với message 'Database error'
     * Ghi chú: Edge case - Trường hợp xảy ra lỗi database
     */
    it('should handle errors gracefully', async () => {
      // Arrange: Mock để throw error
      mockQueryBuilder.getRawMany.mockRejectedValue(new Error('Database error'));

      // Act & Assert: Kiểm tra error được throw
      await expect(repository.getFeatureProductsByRevenue()).rejects.toThrow('Database error');
    });
  });
});
