import { Test, TestingModule } from '@nestjs/testing';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';
import { CreateImportDTO } from 'src/dto/importDTO/import.create.dto';
import { UpdateImpotyDTO } from 'src/dto/importDTO/import.update.dto';
import { AuthGuard } from 'src/guards/JwtAuth.guard';
import { RolesGuard } from 'src/guards/Roles.guard';

// Tạo mock cho AuthGuard
const mockAuthGuard = { canActivate: jest.fn(() => true) };
// Tạo mock cho RolesGuard
const mockRolesGuard = { canActivate: jest.fn(() => true) };

describe('ImportController', () => {
  let controller: ImportController;
  let service: ImportService;

  const mockImportService = {
    create: jest.fn(),
    getImportCodeMax: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImportController],
      providers: [
        {
          provide: ImportService,
          useValue: mockImportService,
        },
      ],
    })
    .overrideGuard(AuthGuard)
    .useValue(mockAuthGuard)
    .overrideGuard(RolesGuard)
    .useValue(mockRolesGuard)
    .compile();

    controller = module.get<ImportController>(ImportController);
    service = module.get<ImportService>(ImportService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new import record', async () => {
      // Arrange
      const createDto: CreateImportDTO = {
        totalAmount: 1000,
        import_code: 'IMP001',
        user_id: '1',
        products: [
          {
            product_id: '1',
            quantity: 10,
            price_in: 100
          }
        ]
      };
      const expectedResult = { id: '1', ...createDto };
      mockImportService.create.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.create(createDto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual({ 
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: expectedResult
      });
    });

    it('should handle errors when create fails', async () => {
      // Arrange
      const createDto: CreateImportDTO = {
        totalAmount: 1000,
        import_code: 'IMP001',
        user_id: '1',
        products: [
          {
            product_id: '1',
            quantity: 10,
            price_in: 100
          }
        ]
      };
      const error = new Error('Creation failed');
      mockImportService.create.mockRejectedValue(error);

      // Act
      const result = await controller.create(createDto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual({
        status: 500,
        message: 'Creation failed',
        success: false,
      });
    });
  });

  describe('getImportCodeMax', () => {
    it('should return the max import code', async () => {
      // Arrange
      const maxCode = 'IMP999';
      mockImportService.getImportCodeMax.mockResolvedValue(maxCode);

      // Act
      const result = await controller.getImportCodeMax();

      // Assert
      expect(service.getImportCodeMax).toHaveBeenCalled();
      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: maxCode
      });
    });

    it('should handle errors when getting max code fails', async () => {
      // Arrange
      const error = new Error('Database error');
      mockImportService.getImportCodeMax.mockRejectedValue(error);

      // Act
      const result = await controller.getImportCodeMax();

      // Assert
      expect(service.getImportCodeMax).toHaveBeenCalled();
      expect(result).toEqual({
        status: 500,
        message: 'Database error',
        success: false,
      });
    });
  });

  describe('findAll', () => {
    it('should return all import records with pagination', async () => {
      // Arrange
      const page = 1;
      const limit = 10;
      const mockImports = [
        { id: '1', import_code: 'IMP001' },
        { id: '2', import_code: 'IMP002' }
      ];
      mockImportService.findAll.mockResolvedValue(mockImports);

      // Act
      const result = await controller.findAll(page, limit);

      // Assert
      expect(service.findAll).toHaveBeenCalledWith(page, limit);
      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: mockImports
      });
    });

    it('should handle errors when finding all records fails', async () => {
      // Arrange
      const page = 1;
      const limit = 10;
      const error = new Error('Find all failed');
      mockImportService.findAll.mockRejectedValue(error);

      // Act
      const result = await controller.findAll(page, limit);

      // Assert
      expect(service.findAll).toHaveBeenCalledWith(page, limit);
      expect(result).toEqual({
        status: 500,
        message: 'Find all failed',
        success: false,
      });
    });
  });

  describe('findOne', () => {
    it('should return one import record by id', async () => {
      // Arrange
      const importId = '1';
      const mockImport = { id: importId, import_code: 'IMP001' };
      mockImportService.findOne.mockResolvedValue(mockImport);

      // Act
      const result = await controller.findOne(importId);

      // Assert
      expect(service.findOne).toHaveBeenCalledWith(importId);
      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: mockImport
      });
    });

    it('should handle errors when finding one record fails', async () => {
      // Arrange
      const importId = '1';
      const error = new Error('Record not found');
      mockImportService.findOne.mockRejectedValue(error);

      // Act
      const result = await controller.findOne(importId);

      // Assert
      expect(service.findOne).toHaveBeenCalledWith(importId);
      expect(result).toEqual({
        status: 500,
        message: 'Record not found',
        success: false,
      });
    });
  });

  describe('update', () => {
    it('should update an import record', async () => {
      // Arrange
      const updateDto: UpdateImpotyDTO = {
        import_id: '1',
        import_code: 'IMP001',
        user_id: '1',
        totalAmount: 1500,
        products: [
          {
            product_id: '1',
            quantity: 15,
            price_in: 100
          }
        ]
      };
      const updatedImport = { 
        id: '1', 
        import_code: 'IMP001', 
        user_id: '1',
        totalAmount: 1500,
        products: [
          {
            product_id: '1',
            quantity: 15,
            price_in: 100
          }
        ]
      };
      mockImportService.update.mockResolvedValue(updatedImport);

      // Act
      const result = await controller.update(updateDto);

      // Assert
      expect(service.update).toHaveBeenCalledWith(updateDto);
      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: updatedImport
      });
    });

    it('should handle errors when update fails', async () => {
      // Arrange
      const updateDto: UpdateImpotyDTO = {
        import_id: '1',
        import_code: 'IMP001',
        user_id: '1',
        totalAmount: 1500,
        products: [
          {
            product_id: '1',
            quantity: 15,
            price_in: 100
          }
        ]
      };
      const error = new Error('Update failed');
      mockImportService.update.mockRejectedValue(error);

      // Act
      const result = await controller.update(updateDto);

      // Assert
      expect(service.update).toHaveBeenCalledWith(updateDto);
      expect(result).toEqual({
        status: 500,
        message: 'Update failed',
        success: false,
      });
    });
  });

  describe('delete', () => {
    it('should delete an import record', async () => {
      // Arrange
      const importId = '1';
      const deleteResult = { deleted: true };
      mockImportService.delete.mockResolvedValue(deleteResult);

      // Act
      const result = await controller.delete(importId);

      // Assert
      expect(service.delete).toHaveBeenCalledWith(importId);
      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success : true,
        data: deleteResult
      });
    });

    it('should handle errors when delete fails', async () => {
      // Arrange
      const importId = '1';
      const error = new Error('Delete failed');
      mockImportService.delete.mockRejectedValue(error);

      // Act
      const result = await controller.delete(importId);

      // Assert
      expect(service.delete).toHaveBeenCalledWith(importId);
      expect(result).toEqual({
        status: 500,
        message: 'Delete failed',
        success: false,
      });
    });
  });
});