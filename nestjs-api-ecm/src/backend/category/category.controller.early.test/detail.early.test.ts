
import { CategoryService } from 'src/backend/category/category.service';
import { responseHandler } from 'src/Until/responseUtil';
import { CategoryController } from '../category.controller';


describe('CategoryController.detail() detail method', () => {
  let categoryController: CategoryController;
  let mockCategoryService: jest.Mocked<CategoryService>;

  beforeEach(() => {
    mockCategoryService = {
      detail: jest.fn(),
    } as unknown as jest.Mocked<CategoryService>;

    categoryController = new CategoryController(mockCategoryService);
  });

  describe('Happy paths', () => {
    it('should return category details successfully', async () => {
      // Arrange: Mock the service to return a valid category entity
      const mockCategoryEntity = { id: '1', name: 'Electronics' };
      mockCategoryService.detail.mockResolvedValue(mockCategoryEntity as any as never);

      // Act: Call the detail method
      const result = await categoryController.detail('1');

      // Assert: Verify the response handler is called with the correct data
      expect(result).toEqual(responseHandler.ok(mockCategoryEntity));
      expect(mockCategoryService.detail).toHaveBeenCalledWith('1');
    });
  });

  describe('Edge cases', () => {
    it('should handle service throwing an error gracefully', async () => {
      // Arrange: Mock the service to throw an error
      const errorMessage = 'Category not found';
      mockCategoryService.detail.mockRejectedValue(new Error(errorMessage) as never);

      // Act: Call the detail method
      const result = await categoryController.detail('999');

      // Assert: Verify the response handler is called with the error message
      expect(result).toEqual(responseHandler.error(errorMessage));
      expect(mockCategoryService.detail).toHaveBeenCalledWith('999');
    });

    it('should handle non-error objects thrown by the service', async () => {
      // Arrange: Mock the service to throw a non-error object
      const errorObject = { error: 'Unexpected error' };
      mockCategoryService.detail.mockRejectedValue(errorObject as never);

      // Act: Call the detail method
      const result = await categoryController.detail('999');

      // Assert: Verify the response handler is called with the stringified error object
      expect(result).toEqual(responseHandler.error(JSON.stringify(errorObject)));
      expect(mockCategoryService.detail).toHaveBeenCalledWith('999');
    });
  });
});