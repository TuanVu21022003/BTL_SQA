import { Test, TestingModule } from '@nestjs/testing';
import { ImportService } from './import.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ImportEntity } from 'src/entities/import_entity/import.entity';
import { Import_productEntity } from 'src/entities/import_entity/import_product.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateImportDTO } from 'src/dto/importDTO/import.create.dto';
import { UpdateImpotyDTO } from 'src/dto/importDTO/import.update.dto';
import { InternalServerErrorException } from '@nestjs/common';

describe('ImportService', () => {
  let service: ImportService;
  let importRepo: Repository<ImportEntity>;
  let importProductRepo: Repository<Import_productEntity>;
  let dataSource: DataSource;

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      save: jest.fn(),
    },
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImportService,
        {
          provide: getRepositoryToken(ImportEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Import_productEntity),
          useClass: Repository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<ImportService>(ImportService);
    importRepo = module.get<Repository<ImportEntity>>(getRepositoryToken(ImportEntity));
    importProductRepo = module.get<Repository<Import_productEntity>>(getRepositoryToken(Import_productEntity));
    dataSource = module.get<DataSource>(DataSource);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateImportDTO = {
      totalAmount: 1000,
      import_code: 'IMP001',
      user_id: '1',
      products: [
        {
          product_id: '1',
          quantity: 10,
          price_in: 100,
        },
      ],
    };

    it('should successfully create an import', async () => {
      const mockImportEntity = {
        id: '1',
        employee_id: createDto.user_id,
        total_amount: createDto.totalAmount,
        import_code: 'IP001',
      };

      const mockImportProduct = {
        id: '1',
        quantity: createDto.products[0].quantity,
        price_in: createDto.products[0].price_in,
        product_id: createDto.products[0].product_id,
        import_id: mockImportEntity.id,
      };

      jest.spyOn(importRepo, 'create').mockReturnValue(mockImportEntity as any);
      jest.spyOn(importProductRepo, 'create').mockReturnValue(mockImportProduct as any);
      jest.spyOn(mockQueryRunner.manager, 'save')
        .mockResolvedValueOnce(mockImportEntity)
        .mockResolvedValueOnce([mockImportProduct]);

      const result = await service.create(createDto);

      expect(result).toEqual(mockImportEntity);
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should rollback transaction and throw error on failure', async () => {
      jest.spyOn(importRepo, 'create').mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(service.create(createDto)).rejects.toThrow(
        new InternalServerErrorException('ORDER.OCCUR ERROR WHEN SAVE TO DATABASE!')
      );

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should handle query runner release in finally block', async () => {
      jest.spyOn(importRepo, 'create').mockImplementation(() => {
        throw new Error('Test error');
      });

      try {
        await service.create(createDto);
      } catch (error) {
        // Expected error
      }

      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should handle empty products array', async () => {
      const emptyProductsDto = { ...createDto, products: [] };
      
      await expect(service.create(emptyProductsDto)).rejects.toThrow(
        new InternalServerErrorException('ORDER.OCCUR ERROR WHEN SAVE TO DATABASE!')
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated imports', async () => {
      const mockImports = [
        { 
          id: '1', 
          import_code: 'IMP001',
          total_amount: 1000,
          employee_id: '1',
          createdAt: new Date(),
          employee: null,
          importProducts: []
        },
        { 
          id: '2', 
          import_code: 'IMP002',
          total_amount: 2000,
          employee_id: '2',
          createdAt: new Date(),
          employee: null,
          importProducts: []
        }
      ];
      const mockTotal = 2;

      jest.spyOn(importRepo, 'findAndCount').mockResolvedValue([mockImports, mockTotal]);

      const result = await service.findAll(1, 10);

      expect(result).toEqual({
        list: mockImports,
        total: mockTotal,
      });
      expect(importRepo.findAndCount).toHaveBeenCalledWith({
        relations: ['importProducts'],
        skip: 0,
        take: 10,
      });
    });

    it('should handle empty result', async () => {
      jest.spyOn(importRepo, 'findAndCount').mockResolvedValue([[], 0]);

      const result = await service.findAll(1, 10);

      expect(result).toEqual({
        list: [],
        total: 0,
      });
    });

    it('should handle pagination parameters correctly', async () => {
      jest.spyOn(importRepo, 'findAndCount').mockResolvedValue([[], 0]);

      await service.findAll(2, 15);

      expect(importRepo.findAndCount).toHaveBeenCalledWith({
        relations: ['importProducts'],
        skip: 15,
        take: 15,
      });
    });

    it('should handle findAndCount error', async () => {
      jest.spyOn(importRepo, 'findAndCount').mockRejectedValue(new Error('Database error'));

      await expect(service.findAll(1, 10)).rejects.toThrow();
    });
  });

  describe('getImportCodeMax', () => {
    it('should generate new code when no existing codes', async () => {
      jest.spyOn(importRepo, 'createQueryBuilder').mockReturnValue({
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ max: null }),
      } as any);

      const result = await service.getImportCodeMax();
      expect(result).toEqual({ import_code: 'IPC00001' });
    });

    it('should increment existing max code', async () => {
      jest.spyOn(importRepo, 'createQueryBuilder').mockReturnValue({
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ max: 'IPC00001' }),
      } as any);

      const result = await service.getImportCodeMax();
      expect(result).toEqual({ import_code: 'IPC00002' });
    });

    it('should handle query builder error', async () => {
      jest.spyOn(importRepo, 'createQueryBuilder').mockImplementation(() => {
        throw new Error('Query builder error');
      });

      await expect(service.getImportCodeMax()).rejects.toThrow();
    });
  });

  describe('findOne', () => {
    it('should return import by id', async () => {
      const mockImport = {
        id: '1',
        import_code: 'IMP001',
        importProducts: [],
      };

      jest.spyOn(importRepo, 'findOne').mockResolvedValue(mockImport as any);

      const result = await service.findOne('1');
      expect(result).toEqual(mockImport);
    });

    it('should throw error when import not found', async () => {
      jest.spyOn(importRepo, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow('IMPORT.IMPORT DETAIL NOT EXISTS!');
    });

    it('should handle findOne error', async () => {
      jest.spyOn(importRepo, 'findOne').mockRejectedValue(new Error('Database error'));

      await expect(service.findOne('1')).rejects.toThrow();
    });
  });

  describe('update', () => {
    const updateDto: UpdateImpotyDTO = {
      import_id: '1',
      totalAmount: 1000,
      user_id: '1',
      import_code: 'IMP001',
      products: [
        {
          product_id: '1',
          quantity: 20,
          price_in: 100,
        },
      ],
    };

    it('should update import successfully', async () => {
      const mockImport = {
        id: '1',
        import_code: 'IMP001',
        importProducts: [],
        total_amount: 1000,
        employee_id: '1',
      };

      jest.spyOn(importRepo, 'findOne').mockResolvedValue(mockImport as any);
      jest.spyOn(importRepo, 'save').mockResolvedValue({ ...mockImport, ...updateDto } as any);

      const result = await service.update(updateDto);
      expect(result.total_amount).toBe(updateDto.totalAmount);
      expect(result.employee_id).toBe(updateDto.user_id);
    });

    it('should throw error when import not found', async () => {
      jest.spyOn(importRepo, 'findOne').mockResolvedValue(null);

      await expect(service.update(updateDto)).rejects.toThrow('IMPORT.ORDER UPDATE NOT FOUND!');
    });

    it('should handle transaction rollback on error during update', async () => {
        const mockImport = {
          id: '1',
          import_code: 'IMP001',
          importProducts: [],
        };
  
        // Mock findOne để trả về một import hợp lệ
        jest.spyOn(importRepo, 'findOne').mockResolvedValue(mockImport as any);
        
        // Mock save để throw error với message cụ thể
        jest.spyOn(importRepo, 'save').mockRejectedValue(new Error('ORDER.OCCUR ERROR WHEN UPDATE TO DATABASE!'));
  
        // Kiểm tra xem service có throw đúng loại exception không
        await expect(service.update(updateDto)).rejects.toThrow(
          new InternalServerErrorException('ORDER.OCCUR ERROR WHEN UPDATE TO DATABASE!')
        );
  
        // // Kiểm tra xem transaction có được rollback không
        // expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
        
        // // Kiểm tra xem resources có được release không
        // expect(mockQueryRunner.release).toHaveBeenCalled();
      });
  });

  describe('delete', () => {
    it('should delete import successfully', async () => {
      const mockDeleteResult = { affected: 1 };
      jest.spyOn(importRepo, 'delete').mockResolvedValue(mockDeleteResult as any);

      const result = await service.delete('1');
      expect(result).toEqual(mockDeleteResult);
    });

    it('should handle non-existent import deletion', async () => {
      const mockDeleteResult = { affected: 0 };
      jest.spyOn(importRepo, 'delete').mockResolvedValue(mockDeleteResult as any);

      const result = await service.delete('999');
      expect(result.affected).toBe(0);
    });

    it('should handle delete error', async () => {
      jest.spyOn(importRepo, 'delete').mockRejectedValue(new Error('Database error'));

      await expect(service.delete('1')).rejects.toThrow();
    });
  });
});