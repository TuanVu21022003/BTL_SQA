
import { CategoryRepository } from 'src/repository/CategoryRepository';
import { ApplyStatus } from 'src/share/Enum/Enum';
import { BaseService } from '../../../base/baseService/base.service';
import { CategoryCreateDTO } from '../../../dto/categoryDTO/category.create.dto';
import { CategoryService } from '../category.service';


// Mocking dependencies
const mockCategoryCreateDTO = {
  status: ApplyStatus.True,
  name: 'Test Category',
} as unknown as jest.Mocked<CategoryCreateDTO>;

const mockCategoryRepository = {
  create: jest.fn(),
} as unknown as jest.Mocked<CategoryRepository>;

describe('CategoryService.create() create method', () => {
  let categoryService: CategoryService;

  beforeEach(() => {
    categoryService = new CategoryService(mockCategoryRepository);
  });

  describe('Happy paths', () => {
    it('should create a category successfully when status is ApplyStatus.True', async () => {
      // Arrange
      mockCategoryCreateDTO.status = ApplyStatus.True;
      const expectedResult = { id: 1, ...mockCategoryCreateDTO };
      jest.spyOn(BaseService.prototype, 'create').mockResolvedValue(expectedResult as any as never);

      // Act
      const result = await categoryService.create(mockCategoryCreateDTO);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(BaseService.prototype.create).toHaveBeenCalledWith(mockCategoryCreateDTO, { name: mockCategoryCreateDTO.name });
    });

    it('should create a category successfully when status is ApplyStatus.False', async () => {
      // Arrange
      mockCategoryCreateDTO.status = ApplyStatus.False;
      const expectedResult = { id: 2, ...mockCategoryCreateDTO };
      jest.spyOn(BaseService.prototype, 'create').mockResolvedValue(expectedResult as any as never);

      // Act
      const result = await categoryService.create(mockCategoryCreateDTO);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(BaseService.prototype.create).toHaveBeenCalledWith(mockCategoryCreateDTO, { name: mockCategoryCreateDTO.name });
    });
  });

  describe('Edge cases', () => {
    it('should throw an error when status is neither ApplyStatus.True nor ApplyStatus.False', async () => {
      // Arrange
      mockCategoryCreateDTO.status = 'InvalidStatus' as ApplyStatus;

      // Act & Assert
      await expect(categoryService.create(mockCategoryCreateDTO)).rejects.toThrow('Invalid status value');
    });
  });
});