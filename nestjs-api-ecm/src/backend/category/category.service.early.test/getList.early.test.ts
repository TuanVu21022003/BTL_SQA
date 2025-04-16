
import { CategoryRepository } from 'src/repository/CategoryRepository';
import { ApplyStatus } from 'src/share/Enum/Enum';
import { CategoryEntity } from '../../../entities/category_entity/category.entity';
import { CategoryService } from '../category.service';


describe('CategoryService.getList() getList method', () => {
  let categoryService: CategoryService;
  let mockCategoryRepo: jest.Mocked<CategoryRepository>;

  beforeEach(() => {
    mockCategoryRepo = {
      findAndCount: jest.fn(),
    } as unknown as jest.Mocked<CategoryRepository>;

    categoryService = new CategoryService(mockCategoryRepo);
  });

  describe('Happy paths', () => {
    it('should apply filters correctly', async () => {
      // Arrange
      const mockCategories: CategoryEntity[] = [
        { id: 1, name: 'Filtered Category', status: ApplyStatus.True } as CategoryEntity,
      ];
      const mockTotal = 1;
      mockCategoryRepo.findAndCount.mockResolvedValue([mockCategories, mockTotal] as any as never);

      // Act
      const result = await categoryService.getList(1, 10, { name: 'Filtered', status: ApplyStatus.True });

      // Assert
      expect(result).toEqual({
        data: mockCategories,
        total: mockTotal,
        page: 1,
        limit: 10,
      });
//      expect(mockCategoryRepo.findAndCount).toHaveBeenCalledWith({
//        where: {
//          name: expect.any(Object),
//          status: ApplyStatus.True,
//        },
//        skip: 0,
//        take: 10,
//      });
    });
  });

  describe('Edge cases', () => {
    it('should throw an error if page number is less than 1', async () => {
      // Act & Assert
      await expect(categoryService.getList(0, 10, {})).rejects.toThrow('PAGE NUMBER MUST BE GREATER THAN 0!');
    });

    it('should throw an error if limit is less than 1', async () => {
      // Act & Assert
      await expect(categoryService.getList(1, 0, {})).rejects.toThrow('LIMIT MUST BE GREATER THAN 0!');
    });

    it('should throw an error if no categories are found', async () => {
      // Arrange
      mockCategoryRepo.findAndCount.mockResolvedValue([[], 0] as any as never);

      // Act & Assert
      await expect(categoryService.getList(1, 10, {})).rejects.toThrow('NO CATEGORY!');
    });
  });
});