
import { ImportProductRepository } from '../ImportProductRepository';
import { DataSource } from 'typeorm';

describe('ImportProductRepository.findLatestProducts() findLatestProducts method', () => {
  let importProductRepository: ImportProductRepository;
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
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getRawMany: jest.fn()
    };

    // Tạo mock DataSource
    const mockDataSource = {
      manager: {},
      createQueryBuilder: jest.fn()
    } as unknown as DataSource;

    // Khởi tạo repository với mock DataSource
    importProductRepository = new ImportProductRepository(mockDataSource);

    // Mock method createQueryBuilder của repository
    jest.spyOn(importProductRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder);
  });

  describe('Happy paths', () => {
    /**
     * Test Case ID: TC001
     * Mục tiêu: Kiểm tra lấy danh sách 8 sản phẩm mới nhất thành công
     * Input: Không có (phương thức không nhận tham số)
     * Expected Output: Mảng chứa 2 sản phẩm với đầy đủ thông tin
     * - productId, productName, productImages, priceOut, productWeight, categoryName
     * Ghi chú: Happy path - Trường hợp thành công với dữ liệu đầy đủ
     */
    it('should return the latest 8 products ordered by creation date', async () => {
      // Arrange: Chuẩn bị dữ liệu mẫu cho test case
      const mockProducts = [
        { 
          productId: 1, 
          productName: 'Product 1',
          productImages: 'image1.jpg',
          priceOut: 100,
          productWeight: 1,
          categoryName: 'Category 1'
        },
        { 
          productId: 2, 
          productName: 'Product 2',
          productImages: 'image2.jpg',
          priceOut: 200,
          productWeight: 2,
          categoryName: 'Category 2'
        }
      ];
      mockQueryBuilder.getRawMany.mockResolvedValue(mockProducts);

      // Act: Gọi phương thức cần test
      const result = await importProductRepository.findLatestProducts();

      // Assert: Kiểm tra kết quả
      expect(result).toEqual(mockProducts);
      // Kiểm tra các method của query builder được gọi đúng
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('product.id', 'productId');
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith('product.name', 'productName');
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith('product.url_images', 'productImages');
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith('product.priceout', 'priceOut');
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith('product.weight', 'productWeight');
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith('category.name', 'categoryName');
      expect(mockQueryBuilder.innerJoin).toHaveBeenCalledWith('import_product.product', 'product');
      expect(mockQueryBuilder.innerJoin).toHaveBeenCalledWith('product.category', 'category');
      expect(mockQueryBuilder.innerJoin).toHaveBeenCalledWith('import_product.import', 'import');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('import.createdAt', 'DESC');
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(8);
    });
  });

  describe('Edge cases', () => {
    /**
     * Test Case ID: TC002
     * Mục tiêu: Kiểm tra xử lý khi không có sản phẩm nào trong database
     * Input: Không có (phương thức không nhận tham số)
     * Expected Output: Mảng rỗng []
     * Ghi chú: Edge case - Trường hợp không có dữ liệu
     */
    it('should return an empty array if no products are found', async () => {
      // Arrange: Mock trả về mảng rỗng
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      // Act: Gọi phương thức cần test
      const result = await importProductRepository.findLatestProducts();

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
    it('should handle errors thrown by the query builder', async () => {
      // Arrange: Mock để throw error
      mockQueryBuilder.getRawMany.mockRejectedValue(new Error('Database error'));

      // Act & Assert: Kiểm tra error được throw
      await expect(importProductRepository.findLatestProducts()).rejects.toThrow('Database error');
    });
  });
});
