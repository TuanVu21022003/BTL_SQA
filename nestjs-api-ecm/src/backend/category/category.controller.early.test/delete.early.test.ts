
import { CategoryService } from 'src/backend/category/category.service';
import { responseHandler } from 'src/Until/responseUtil';
import { CategoryController } from '../category.controller';


describe('CategoryController.delete() delete method', () => {
  let categoryController: CategoryController;
  let mockCategoryService: jest.Mocked<CategoryService>;

  beforeEach(() => {
    mockCategoryService = {
      delete: jest.fn(),
    } as unknown as jest.Mocked<CategoryService>;

    categoryController = new CategoryController(mockCategoryService);
  });

  describe('Happy paths', () => {
    it('should successfully delete a category and return a success response', async () => {
      // Arrange
      const categoryId = '123';
      mockCategoryService.delete.mockResolvedValue(undefined as never);

      // Act

      // Assert
      expect(mockCategoryService.delete).toHaveBeenCalledWith(categoryId);
      expect(responseHandler.ok).toHaveBeenCalledWith(undefined);
    });
  });

  describe('Edge cases', () => {
    it('should handle errors thrown by the service and return an error response', async () => {
      // Arrange
      const categoryId = '123';
      const errorMessage = 'Category not found';
      mockCategoryService.delete.mockRejectedValue(new Error(errorMessage) as never);

      // Act

      // Assert
      expect(mockCategoryService.delete).toHaveBeenCalledWith(categoryId);
      expect(responseHandler.error).toHaveBeenCalledWith(errorMessage);
    });

    it('should handle non-error objects thrown by the service and return an error response', async () => {
      // Arrange
      const categoryId = '123';
      const errorObject = { message: 'Unexpected error' };
      mockCategoryService.delete.mockRejectedValue(errorObject as never);

      // Act

      // Assert
      expect(mockCategoryService.delete).toHaveBeenCalledWith(categoryId);
      expect(responseHandler.error).toHaveBeenCalledWith(JSON.stringify(errorObject));
    });
  });
});