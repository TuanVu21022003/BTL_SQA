
import { ApplyStatus } from 'src/share/Enum/Enum';
import { responseHandler } from 'src/Until/responseUtil';
import { CategoryController } from '../category.controller';


class MockCategoryService {
  public getList = jest.fn();
}

describe('CategoryController.getList() getList method', () => {
  let categoryController: CategoryController;
  let mockCategoryService: MockCategoryService;

  beforeEach(() => {
    mockCategoryService = new MockCategoryService();
    categoryController = new CategoryController(mockCategoryService as any);
  });

  describe('Happy paths', () => {
    it('should return a list of categories when called with valid parameters', async () => {
      const mockCategories = [{ id: 1, name: 'Category 1' }];
      jest.mocked(mockCategoryService.getList).mockResolvedValue(mockCategories as any as never);

      const result = await categoryController.getList(1, 10, 'Category', ApplyStatus.All);

      expect(mockCategoryService.getList).toHaveBeenCalledWith(1, 10, { name: 'Category', status: ApplyStatus.All });
      expect(result).toEqual(responseHandler.ok(mockCategories));
    });

    it('should return a list of categories with default filters when no query parameters are provided', async () => {
      const mockCategories = [{ id: 1, name: 'Category 1' }];
      jest.mocked(mockCategoryService.getList).mockResolvedValue(mockCategories as any as never);

      const result = await categoryController.getList(1, 10);

      expect(mockCategoryService.getList).toHaveBeenCalledWith(1, 10, { name: '', status: '' });
      expect(result).toEqual(responseHandler.ok(mockCategories));
    });
  });

  describe('Edge cases', () => {
    it('should handle an error thrown by the service gracefully', async () => {
      const errorMessage = 'Service error';
      jest.mocked(mockCategoryService.getList).mockRejectedValue(new Error(errorMessage) as never);

      const result = await categoryController.getList(1, 10);

      expect(mockCategoryService.getList).toHaveBeenCalledWith(1, 10, { name: '', status: '' });
      expect(result).toEqual(responseHandler.error(errorMessage));
    });

    it('should handle non-error objects thrown by the service gracefully', async () => {
      const errorObject = { message: 'Non-error object' };
      jest.mocked(mockCategoryService.getList).mockRejectedValue(errorObject as never);

      const result = await categoryController.getList(1, 10);

      expect(mockCategoryService.getList).toHaveBeenCalledWith(1, 10, { name: '', status: '' });
      expect(result).toEqual(responseHandler.error(JSON.stringify(errorObject)));
    });
  });
});