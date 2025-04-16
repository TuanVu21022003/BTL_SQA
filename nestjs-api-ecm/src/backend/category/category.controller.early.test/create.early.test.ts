
import { CategoryService } from 'src/backend/category/category.service';
import { responseHandler } from 'src/Until/responseUtil';
import { CategoryController } from '../category.controller';


import { Test, TestingModule } from '@nestjs/testing';


// Mock classes
class MockCategoryCreateDTO {
  public name: string = 'Test Category';
  public description: string = 'Test Description';
}

class MockCategoryService {
  create = jest.fn();
}

describe('CategoryController.create() create method', () => {
  let categoryController: CategoryController;
  let mockCategoryService: MockCategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useClass: MockCategoryService,
        },
      ],
    }).compile();

    categoryController = module.get<CategoryController>(CategoryController);
    mockCategoryService = module.get<CategoryService>(CategoryService) as any;
  });

  describe('Happy paths', () => {
    it('should create a category successfully', async () => {
      // Arrange
      const mockCategoryCreateDTO = new MockCategoryCreateDTO() as any;
      const mockCategory = { id: 1, ...mockCategoryCreateDTO };
      jest.mocked(mockCategoryService.create).mockResolvedValue(mockCategory as any as never);

      // Act
      const result = await categoryController.create(mockCategoryCreateDTO);

      // Assert
      expect(mockCategoryService.create).toHaveBeenCalledWith(mockCategoryCreateDTO);
      expect(result).toEqual(responseHandler.ok(mockCategory));
    });
  });

  describe('Edge cases', () => {
    it('should handle service errors gracefully', async () => {
      // Arrange
      const mockCategoryCreateDTO = new MockCategoryCreateDTO() as any;
      const errorMessage = 'Service error';
      jest.mocked(mockCategoryService.create).mockRejectedValue(new Error(errorMessage) as never);

      // Act
      const result = await categoryController.create(mockCategoryCreateDTO);

      // Assert
      expect(mockCategoryService.create).toHaveBeenCalledWith(mockCategoryCreateDTO);
      expect(result).toEqual(responseHandler.error(errorMessage));
    });

    it('should handle non-error exceptions gracefully', async () => {
      // Arrange
      const mockCategoryCreateDTO = new MockCategoryCreateDTO() as any;
      const errorObject = { message: 'Unexpected error' };
      jest.mocked(mockCategoryService.create).mockRejectedValue(errorObject as never);

      // Act
      const result = await categoryController.create(mockCategoryCreateDTO);

      // Assert
      expect(mockCategoryService.create).toHaveBeenCalledWith(mockCategoryCreateDTO);
      expect(result).toEqual(responseHandler.error(JSON.stringify(errorObject)));
    });
  });
});