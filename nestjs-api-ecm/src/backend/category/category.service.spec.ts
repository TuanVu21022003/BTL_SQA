import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { CategoryRepository } from 'src/repository/CategoryRepository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CategoryEntity } from '../../entities/category_entity/category.entity';
import { ApplyStatus } from 'src/share/Enum/Enum';
import { CategoryCreateDTO } from '../../dto/categoryDTO/category.create.dto';
import { categoryUpdateDTO } from '../../dto/categoryDTO/category.update.dto';
import { Like } from 'typeorm';

describe('CategoryService', () => {
  let service: CategoryService;
  let repository: CategoryRepository;

  const mockCategoryRepository = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: getRepositoryToken(CategoryEntity),
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    repository = module.get<CategoryRepository>(getRepositoryToken(CategoryEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getList', () => {
    it('should return a list of categories with pagination', async () => {
      // Arrange
      const page = 1;
      const limit = 10;
      const filters = {};
      const mockCategories = [
        { id: '1', name: 'Category 1', status: ApplyStatus.True },
        { id: '2', name: 'Category 2', status: ApplyStatus.False },
      ];
      const mockTotal = 2;
      mockCategoryRepository.findAndCount.mockResolvedValue([mockCategories, mockTotal]);

      // Act
      const result = await service.getList(page, limit, filters);

      // Assert
      expect(result).toEqual({
        data: mockCategories,
        total: mockTotal,
        page,
        limit,
      });
      expect(mockCategoryRepository.findAndCount).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: limit,
      });
    });

    it('should apply name filter correctly', async () => {
      // Arrange
      const page = 1;
      const limit = 10;
      const filters = { name: 'test' };
      const mockCategories = [{ id: '1', name: 'test category', status: ApplyStatus.True }];
      const mockTotal = 1;
      mockCategoryRepository.findAndCount.mockResolvedValue([mockCategories, mockTotal]);

      // Act
      const result = await service.getList(page, limit, filters);

      // Assert
      expect(result).toEqual({
        data: mockCategories,
        total: mockTotal,
        page,
        limit,
      });
      expect(mockCategoryRepository.findAndCount).toHaveBeenCalledWith({
        where: { name: Like('%test%') },
        skip: 0,
        take: limit,
      });
    });

    it('should apply status filter correctly', async () => {
      // Arrange
      const page = 1;
      const limit = 10;
      const filters = { status: ApplyStatus.True };
      const mockCategories = [{ id: '1', name: 'Category 1', status: ApplyStatus.True }];
      const mockTotal = 1;
      mockCategoryRepository.findAndCount.mockResolvedValue([mockCategories, mockTotal]);

      // Act
      const result = await service.getList(page, limit, filters);

      // Assert
      expect(result).toEqual({
        data: mockCategories,
        total: mockTotal,
        page,
        limit,
      });
      expect(mockCategoryRepository.findAndCount).toHaveBeenCalledWith({
        where: { status: ApplyStatus.True },
        skip: 0,
        take: limit,
      });
    });

    it('should apply both name and status filters correctly', async () => {
      // Arrange
      const page = 1;
      const limit = 10;
      const filters = { name: 'test', status: ApplyStatus.True };
      const mockCategories = [{ id: '1', name: 'test category', status: ApplyStatus.True }];
      const mockTotal = 1;
      mockCategoryRepository.findAndCount.mockResolvedValue([mockCategories, mockTotal]);

      // Act
      const result = await service.getList(page, limit, filters);

      // Assert
      expect(result).toEqual({
        data: mockCategories,
        total: mockTotal,
        page,
        limit,
      });
      expect(mockCategoryRepository.findAndCount).toHaveBeenCalledWith({
        where: { name: Like('%test%'), status: ApplyStatus.True },
        skip: 0,
        take: limit,
      });
    });

    it('should throw an error if page is less than 1', async () => {
      // Arrange
      const page = 0;
      const limit = 10;
      const filters = {};

      // Act & Assert
      await expect(service.getList(page, limit, filters)).rejects.toThrow('PAGE NUMBER MUST BE GREATER THAN 0!');
      expect(mockCategoryRepository.findAndCount).not.toHaveBeenCalled();
    });

    it('should throw an error if limit is less than 1', async () => {
      // Arrange
      const page = 1;
      const limit = 0;
      const filters = {};

      // Act & Assert
      await expect(service.getList(page, limit, filters)).rejects.toThrow('LIMIT MUST BE GREATER THAN 0!');
      expect(mockCategoryRepository.findAndCount).not.toHaveBeenCalled();
    });

    it('should throw an error if no categories are found', async () => {
      // Arrange
      const page = 1;
      const limit = 10;
      const filters = {};
      mockCategoryRepository.findAndCount.mockResolvedValue([null, 0]);

      // Act & Assert
      await expect(service.getList(page, limit, filters)).rejects.toThrow('NO CATEGORY!');
    });
  });

  describe('create', () => {
    it('should create a category with ApplyStatus.True', async () => {
      // Arrange
      const createCategoryDto: CategoryCreateDTO = {
        name: 'Test Category',
        url_image: 'test.jpg',
        banner: 'banner.jpg',
        description: 'Test Description',
        status: ApplyStatus.True,
      };
      const createdCategory = {
        id: '1',
        ...createCategoryDto,
      };
      mockCategoryRepository.findOne.mockResolvedValue(null);
      mockCategoryRepository.create.mockReturnValue(createCategoryDto);
      mockCategoryRepository.save.mockResolvedValue(createdCategory);

      // Act
      const result = await service.create(createCategoryDto);

      // Assert
      expect(result).toEqual(createdCategory);
      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
        where: { name: createCategoryDto.name },
      });
      expect(mockCategoryRepository.create).toHaveBeenCalledWith(createCategoryDto);
      expect(mockCategoryRepository.save).toHaveBeenCalled();
    });

    it('should create a category with ApplyStatus.False', async () => {
      // Arrange
      const createCategoryDto: CategoryCreateDTO = {
        name: 'Test Category',
        url_image: 'test.jpg',
        banner: 'banner.jpg',
        description: 'Test Description',
        status: ApplyStatus.False,
      };
      const createdCategory = {
        id: '1',
        ...createCategoryDto,
      };
      mockCategoryRepository.findOne.mockResolvedValue(null);
      mockCategoryRepository.create.mockReturnValue(createCategoryDto);
      mockCategoryRepository.save.mockResolvedValue(createdCategory);

      // Act
      const result = await service.create(createCategoryDto);

      // Assert
      expect(result).toEqual(createdCategory);
      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
        where: { name: createCategoryDto.name },
      });
      expect(mockCategoryRepository.create).toHaveBeenCalledWith(createCategoryDto);
      expect(mockCategoryRepository.save).toHaveBeenCalled();
    });

    it('should throw an error if status is invalid', async () => {
      // Arrange
      const createCategoryDto = {
        name: 'Test Category',
        url_image: 'test.jpg',
        banner: 'banner.jpg',
        description: 'Test Description',
        status: 'InvalidStatus' as ApplyStatus,
      };

      // Act & Assert
      await expect(service.create(createCategoryDto)).rejects.toThrow('Invalid status value');
      expect(mockCategoryRepository.findOne).not.toHaveBeenCalled();
      expect(mockCategoryRepository.create).not.toHaveBeenCalled();
      expect(mockCategoryRepository.save).not.toHaveBeenCalled();
    });

    it('should throw an error if category with the same name already exists', async () => {
      // Arrange
      const createCategoryDto: CategoryCreateDTO = {
        name: 'Existing Category',
        url_image: 'test.jpg',
        banner: 'banner.jpg',
        description: 'Test Description',
        status: ApplyStatus.True,
      };
      const existingCategory = {
        id: '1',
        ...createCategoryDto,
      };
      mockCategoryRepository.findOne.mockResolvedValue(existingCategory);

      // Act & Assert
      await expect(service.create(createCategoryDto)).rejects.toThrow('RECORD ALREADY EXISTS!');
      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
        where: { name: createCategoryDto.name },
      });
      expect(mockCategoryRepository.create).not.toHaveBeenCalled();
      expect(mockCategoryRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('detail', () => {
    it('should return a category by id', async () => {
      // Arrange
      const categoryId = '1';
      const category = {
        id: categoryId,
        name: 'Test Category',
        status: ApplyStatus.True,
      };
      mockCategoryRepository.findOneBy.mockResolvedValue(category);

      // Act
      const result = await service.detail(categoryId);

      // Assert
      expect(result).toEqual(category);
      expect(mockCategoryRepository.findOneBy).toHaveBeenCalledWith({ id: categoryId });
    });

    it('should throw an error if category is not found', async () => {
      // Arrange
      const categoryId = 'non-existent-id';
      mockCategoryRepository.findOneBy.mockResolvedValue(null);

      // Act & Assert
      await expect(service.detail(categoryId)).rejects.toThrow('RECORD NOT FOUND!');
      expect(mockCategoryRepository.findOneBy).toHaveBeenCalledWith({ id: categoryId });
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      // Arrange
      const categoryId = '1';
      const updateCategoryDto: categoryUpdateDTO = {
        id: categoryId,
        name: 'Updated Category',
        status: ApplyStatus.False,
      };
      const existingCategory = {
        id: categoryId,
        name: 'Test Category',
        url_image: 'test.jpg',
        banner: 'banner.jpg',
        description: 'Test Description',
        status: ApplyStatus.True,
      };
      const updatedCategory = {
        ...existingCategory,
        ...updateCategoryDto,
      };
      mockCategoryRepository.findOneBy.mockResolvedValue(existingCategory);
      mockCategoryRepository.save.mockResolvedValue(updatedCategory);

      // Act
      const result = await service.update(updateCategoryDto, categoryId);

      // Assert
      expect(result).toEqual(updatedCategory);
      expect(mockCategoryRepository.findOneBy).toHaveBeenCalledWith({ id: categoryId });
      expect(mockCategoryRepository.save).toHaveBeenCalledWith(updatedCategory);
    });

    it('should throw an error if category is not found', async () => {
      // Arrange
      const categoryId = 'non-existent-id';
      const updateCategoryDto: categoryUpdateDTO = {
        id: categoryId,
        name: 'Updated Category',
      };
      mockCategoryRepository.findOneBy.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(updateCategoryDto, categoryId)).rejects.toThrow('RECORD NOT FOUND!');
      expect(mockCategoryRepository.findOneBy).toHaveBeenCalledWith({ id: categoryId });
      expect(mockCategoryRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a category', async () => {
      // Arrange
      const categoryId = '1';
      const category = {
        id: categoryId,
        name: 'Test Category',
      };
      mockCategoryRepository.findOneBy.mockResolvedValue(category);

      // Act
      await service.delete(categoryId);

      // Assert
      expect(mockCategoryRepository.findOneBy).toHaveBeenCalledWith({ id: categoryId });
      expect(mockCategoryRepository.delete).toHaveBeenCalledWith(categoryId);
    });

    it('should throw an error if category is not found', async () => {
      // Arrange
      const categoryId = 'non-existent-id';
      mockCategoryRepository.findOneBy.mockResolvedValue(null);

      // Act & Assert
      await expect(service.delete(categoryId)).rejects.toThrow('RECORD NOT FOUND!');
      expect(mockCategoryRepository.findOneBy).toHaveBeenCalledWith({ id: categoryId });
      expect(mockCategoryRepository.delete).not.toHaveBeenCalled();
    });
  });
});
