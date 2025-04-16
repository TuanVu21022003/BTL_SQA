
import { ImportProductRepository } from '../ImportProductRepository';
import { DataSource } from 'typeorm';

describe('ImportProductRepository.findLatestProducts() findLatestProducts method', () => {
  let importProductRepository: ImportProductRepository;
  let mockQueryBuilder: any;

  beforeEach(() => {
    // Create mock query builder with all required methods
    mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getRawMany: jest.fn()
    };

    // Create mock DataSource
    const mockDataSource = {
      manager: {},
      createQueryBuilder: jest.fn()
    } as unknown as DataSource;

    // Create repository instance
    importProductRepository = new ImportProductRepository(mockDataSource);

    // Mock createQueryBuilder method on repository instance
    jest.spyOn(importProductRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder);
  });

  describe('Happy paths', () => {
    it('should return the latest 8 products ordered by creation date', async () => {
      // Arrange
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

      // Act
      const result = await importProductRepository.findLatestProducts();

      // Assert
      expect(result).toEqual(mockProducts);
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
    it('should return an empty array if no products are found', async () => {
      // Arrange
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      // Act
      const result = await importProductRepository.findLatestProducts();

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle errors thrown by the query builder', async () => {
      // Arrange
      mockQueryBuilder.getRawMany.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(importProductRepository.findLatestProducts()).rejects.toThrow('Database error');
    });
  });
});
