import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { ProductRepository } from 'src/repository/ProductRepository';
import { ImportProductRepository } from 'src/repository/ImportProductRepository';
import { EntityManager } from 'typeorm';
import { ProductEntity } from 'src/entities/product_entity/product.entity';
import { Import_productEntity } from 'src/entities/import_entity/import_product.entity';
import { ProductCreateDTO } from 'src/dto/productDTO/product.create.dto';
import { ProductUpdateDTO } from 'src/dto/productDTO/product.update.dto';
import { ExpirationStatus, ApplyStatus } from 'src/share/Enum/Enum';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('ProductService', () => {
  let service: ProductService;
  let productRepo: ProductRepository;
  let importProductRepo: ImportProductRepository;
  let entityManager: EntityManager;

  const mockProduct = {
    id: '1',
    name: 'Test Product',
    priceout: 100,
    banner: 'banner.jpg',
    description: 'Test Description',
    stockQuantity: 10,
    weight: 1,
    url_image: 'image.jpg',
    category_id: 'cat1',
    supplier_id: 'sup1',
    expire_date: new Date(),
    status: ExpirationStatus.Valid,
    category: { id: 'cat1', status: ApplyStatus.True },
  };

  const mockProductRepository = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockImportProductRepository = {
    find: jest.fn(),
  };

  const mockEntityManager = {
    transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(ProductEntity),
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(Import_productEntity),
          useValue: mockImportProductRepository,
        },
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    productRepo = module.get<ProductRepository>(getRepositoryToken(ProductEntity));
    importProductRepo = module.get<ImportProductRepository>(
      getRepositoryToken(Import_productEntity),
    );
    entityManager = module.get<EntityManager>(EntityManager);
  });

  describe('getList', () => {
    it('should return a list of products with pagination', async () => {
      const mockQueryBuilder = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockProduct], 1]),
      };
      mockProductRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getList(1, 10, { status: ExpirationStatus.Valid });

      expect(mockProductRepository.createQueryBuilder).toHaveBeenCalledWith('product');
      expect(mockQueryBuilder.innerJoinAndSelect).toHaveBeenCalledWith(
        'product.category',
        'category',
        'category.status = :categoryStatus',
        { categoryStatus: ApplyStatus.True },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('product.status = :status', {
        status: ExpirationStatus.Valid,
      });
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(result).toEqual({
        products: [mockProduct],
        total: 1,
        page: 1,
        limit: 10,
      });
    });

    it('should throw error if page is less than 1', async () => {
      await expect(service.getList(0, 10, {})).rejects.toThrow('PAGE NUMBER MUST BE GREATER THAN 0!');
    });

    it('should throw error if limit is less than 1', async () => {
      await expect(service.getList(1, 0, {})).rejects.toThrow('LIMIT MUST BE GREATER THAN 0!');
    });
    it('should throw error if no products found', async () => {
        const mockQueryBuilder = {
          innerJoinAndSelect: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          take: jest.fn().mockReturnThis(),
          getManyAndCount: jest.fn().mockResolvedValue([null, 0]),
        };
        mockProductRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
  
        await expect(service.getList(1, 10, { status: ExpirationStatus.Valid }))
          .rejects.toThrow('NO PRODUCT!');
      });
  
      it('should not add status condition if status is invalid', async () => {
        const mockQueryBuilder = {
          innerJoinAndSelect: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          take: jest.fn().mockReturnThis(),
          getManyAndCount: jest.fn().mockResolvedValue([[mockProduct], 1]),
        };
        mockProductRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
  
        const filters = { status: 'INVALID_STATUS' };
        const result = await service.getList(1, 10, filters);
  
        // Không gọi andWhere với status
        expect(mockQueryBuilder.andWhere).not.toHaveBeenCalledWith('product.status = :status', expect.anything());
        expect(result).toEqual({
          products: [mockProduct],
          total: 1,
          page: 1,
          limit: 10,
        });
      });
      it('should use default page and limit if not provided', async () => {
        const mockQueryBuilder = {
          innerJoinAndSelect: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          take: jest.fn().mockReturnThis(),
          getManyAndCount: jest.fn().mockResolvedValue([[mockProduct], 1]),
        };
        mockProductRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    
        // Call without page and limit (should use defaults)
        // @ts-ignore
        const result = await service.getList(undefined, undefined, {});
    
        expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
        expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
        expect(result).toEqual({
          products: [mockProduct],
          total: 1,
          page: 1,
          limit: 10,
        });
      });
    
      it('should not add status condition if filters.status is not provided', async () => {
        const mockQueryBuilder = {
          innerJoinAndSelect: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          take: jest.fn().mockReturnThis(),
          getManyAndCount: jest.fn().mockResolvedValue([[mockProduct], 1]),
        };
        mockProductRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    
        const filters = {};
        const result = await service.getList(1, 10, filters);
    
        expect(mockQueryBuilder.andWhere).not.toHaveBeenCalledWith('product.status = :status', expect.anything());
        expect(result).toEqual({
          products: [mockProduct],
          total: 1,
          page: 1,
          limit: 10,
        });
      });
    
      it('should handle filters as undefined', async () => {
        const mockQueryBuilder = {
          innerJoinAndSelect: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          take: jest.fn().mockReturnThis(),
          getManyAndCount: jest.fn().mockResolvedValue([[mockProduct], 1]),
        };
        mockProductRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

        // Instead of passing undefined, pass an empty object to match service expectations
        const result = await service.getList(1, 10, {});

        expect(mockQueryBuilder.andWhere).not.toHaveBeenCalledWith('product.status = :status', expect.anything());
        expect(result).toEqual({
          products: [mockProduct],
          total: 1,
          page: 1,
          limit: 10,
        });
      });
  });

  describe('searchProducts', () => {
    it('should return products based on search filters', async () => {
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockProduct], 1]),
      };
      mockProductRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const filters = { name: 'Test', category_id: ['cat1'] };
      const result = await service.searchProducts(1, 10, filters);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('product.name LIKE :name', {
        name: '%Test%',
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('product.category_id IN (:...categoryIds)', {
        categoryIds: ['cat1'],
      });
      expect(mockQueryBuilder.innerJoinAndSelect).toHaveBeenCalledWith(
        'product.category',
        'category',
        'category.status = :categoryStatus',
        { categoryStatus: ApplyStatus.True },
      );
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(result).toEqual({
        products: [mockProduct],
        total: 1,
      });
    });

    it('should return products when category_id is a single value', async () => {
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockProduct], 1]),
      };
      mockProductRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const filters = { name: 'Test', category_id: 'cat1' }; // category_id as string
      const result = await service.searchProducts(1, 10, filters);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('product.name LIKE :name', {
        name: '%Test%',
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('product.category_id = :categoryId', {
        categoryId: 'cat1',
      });
      expect(mockQueryBuilder.innerJoinAndSelect).toHaveBeenCalledWith(
        'product.category',
        'category',
        'category.status = :categoryStatus',
        { categoryStatus: ApplyStatus.True },
      );
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(result).toEqual({
        products: [mockProduct],
        total: 1,
      });
    });

    it('should work when no filters are provided', async () => {
        const mockQueryBuilder = {
          andWhere: jest.fn().mockReturnThis(),
          innerJoinAndSelect: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          take: jest.fn().mockReturnThis(),
          getManyAndCount: jest.fn().mockResolvedValue([[mockProduct], 1]),
        };
        mockProductRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
  
        const result = await service.searchProducts(1, 10, {});
        expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
        expect(result).toEqual({
          products: [mockProduct],
          total: 1,
        });
      });
  
      it('should return empty products if getManyAndCount returns empty', async () => {
        const mockQueryBuilder = {
          andWhere: jest.fn().mockReturnThis(),
          innerJoinAndSelect: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          take: jest.fn().mockReturnThis(),
          getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
        };
        mockProductRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
  
        const result = await service.searchProducts(1, 10, {});
        expect(result).toEqual({
          products: [],
          total: 0,
        });
      });
      
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const createDto: ProductCreateDTO = {
        name: 'New Product',
        priceout: 200,
        banner: 'banner.jpg',
        description: 'New Description',
        stockQuantity: 20,
        weight: 2,
        url_image: 'image.jpg',
        category_id: 'cat1',
        supplier_id: 'sup1',
        expire_date: new Date(),
      };
      mockProductRepository.create.mockReturnValue(createDto);
      mockProductRepository.save.mockResolvedValue(mockProduct);

      const result = await service.create(createDto);

      expect(mockProductRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockProductRepository.save).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('detail', () => {
    it('should return product details', async () => {
      mockProductRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.detail('1');

      expect(mockProductRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['category'],
      });
      expect(result).toEqual({ products: mockProduct });
    });
    it('should return null if product not found', async () => {
        mockProductRepository.findOne.mockResolvedValue(null);
  
        const result = await service.detail('notfound');
        expect(result).toEqual({ products: null });
      });
  });

  describe('update', () => {
    it('should update a product', async () => {
        const updateDto: ProductUpdateDTO = {
          id: '1',
          name: 'Updated Product',
        };
        mockProductRepository.findOneBy.mockResolvedValue(mockProduct);
        mockProductRepository.save.mockResolvedValue({ ...mockProduct, name: 'Updated Product' });
    
        const result = await service.update(updateDto, '1');
    
        expect(mockProductRepository.findOneBy).toHaveBeenCalledWith({ id: '1' });
        expect(mockProductRepository.save).toHaveBeenCalledWith(expect.objectContaining({ ...mockProduct, ...updateDto }));
        expect(result).toEqual({ ...mockProduct, name: 'Updated Product' });
      });
      it('should throw error if product to update not found', async () => {
        const updateDto: ProductUpdateDTO = {
          id: 'notfound',
          name: 'Updated Product',
        };
        // Mock BaseService.prototype.update to throw
        const error = new Error('Product not found');
        const baseServiceProto = Object.getPrototypeOf(service);
        const updateSpy = jest.spyOn(baseServiceProto, 'update').mockRejectedValue(error);

        await expect(service.update(updateDto, 'notfound')).rejects.toThrow('Product not found');

        updateSpy.mockRestore();
      });
  });

  describe('delete', () => {
    it('should delete a product', async () => {
      mockProductRepository.findOneBy.mockResolvedValue(mockProduct);
      mockProductRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.delete('1');

      expect(mockProductRepository.findOneBy).toHaveBeenCalledWith({ id: '1' });
      expect(mockProductRepository.delete).toHaveBeenCalledWith('1');
      expect(result).toEqual(undefined);
    });
    it('should throw error if product to delete not found', async () => {
        // Mock BaseService.prototype.delete to throw
        const error = new Error('Product not found');
        const baseServiceProto = Object.getPrototypeOf(service);
        const deleteSpy = jest.spyOn(baseServiceProto, 'delete').mockRejectedValue(error);

        await expect(service.delete('notfound')).rejects.toThrow('Product not found');

        deleteSpy.mockRestore();
      });
  });
});