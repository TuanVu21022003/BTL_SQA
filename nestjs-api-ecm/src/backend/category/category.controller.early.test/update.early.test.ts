
import { CategoryService } from 'src/backend/category/category.service';
import { categoryUpdateDTO } from 'src/dto/categoryDTO/category.update.dto';
import { responseHandler } from 'src/Until/responseUtil';
import { CategoryController } from '../category.controller';


describe('CategoryController.update() update method', () => {
  let categoryController: CategoryController;
  let mockCategoryService: jest.Mocked<CategoryService>;

  beforeEach(() => {
    mockCategoryService = {
      update: jest.fn(),
    } as unknown as jest.Mocked<CategoryService>;

    categoryController = new CategoryController(mockCategoryService);
  });

  describe('Happy paths', () => {
    it('should successfully update a category and return a success response', async () => {
      // Arrange
      const mockCategoryUpdateDTO: categoryUpdateDTO = { id: '1', name: 'Updated Category' };
      const mockUpdatedCategory = { id: '1', name: 'Updated Category' };
      mockCategoryService.update.mockResolvedValue(mockUpdatedCategory as any as never);

      // Act
      const result = await categoryController.update(mockCategoryUpdateDTO);

      // Assert
      expect(mockCategoryService.update).toHaveBeenCalledWith(mockCategoryUpdateDTO, '1');
      expect(result).toEqual(responseHandler.ok(mockUpdatedCategory));
    });
  });

  describe('Edge cases', () => {
    it('should handle errors thrown by the service and return an error response', async () => {
      // Arrange
      const mockCategoryUpdateDTO: categoryUpdateDTO = { id: '1', name: 'Updated Category' };
      const errorMessage = 'Update failed';
      mockCategoryService.update.mockRejectedValue(new Error(errorMessage) as never);

      // Act
      const result = await categoryController.update(mockCategoryUpdateDTO);

      // Assert
      expect(mockCategoryService.update).toHaveBeenCalledWith(mockCategoryUpdateDTO, '1');
      expect(result).toEqual(responseHandler.error(errorMessage));
    });

    it('should handle non-Error exceptions and return an error response', async () => {
      // Arrange
      const mockCategoryUpdateDTO: categoryUpdateDTO = { id: '1', name: 'Updated Category' };
      const errorObject = { message: 'Non-error exception' };
      mockCategoryService.update.mockRejectedValue(errorObject as never);

      // Act
      const result = await categoryController.update(mockCategoryUpdateDTO);

      // Assert
      expect(mockCategoryService.update).toHaveBeenCalledWith(mockCategoryUpdateDTO, '1');
      expect(result).toEqual(responseHandler.error(JSON.stringify(errorObject)));
    });
  });
});