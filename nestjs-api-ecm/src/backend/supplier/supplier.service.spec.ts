import { Test, TestingModule } from '@nestjs/testing';
import { SupplierController } from './supplier.controller';
import { SupplierService } from './supplier.service';
import { AuthGuard } from 'src/guards/JwtAuth.guard';
import { RolesGuard } from 'src/guards/Roles.guard';
import { responseHandler } from 'src/Until/responseUtil';
import { CreateSupplierDto } from 'src/dto/supplierDTO/create-supplier.dto';
import { UpdateSupplierDto } from 'src/dto/supplierDTO/update-supplier.dto';
import { SearchSupplierDto } from 'src/dto/supplierDTO/search-supplier.dto';

describe('SupplierController', () => {
  let controller: SupplierController;
  let service: SupplierService;

  const mockSupplierService = {
    getList: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupplierController],
      providers: [
        {
          provide: SupplierService,
          useValue: mockSupplierService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<SupplierController>(SupplierController);
    service = module.get<SupplierService>(SupplierService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getList', () => {
    it('should return a list of suppliers', async () => {
      const result = { data: [], total: 0, page: 1, limit: 10 };
      mockSupplierService.getList.mockResolvedValue(result);

      const response = await controller.getList(1, 10);
      expect(service.getList).toHaveBeenCalledWith(1, 10, {});
      expect(response).toEqual(responseHandler.ok(result));
    });

    it('should handle errors', async () => {
      mockSupplierService.getList.mockRejectedValue(new Error('fail'));
      const response = await controller.getList(1, 10);
      expect(response).toEqual(responseHandler.error('fail'));
    });

    it('should handle non-Error thrown values', async () => {
      mockSupplierService.getList.mockRejectedValue({ msg: 'fail' });
      const response = await controller.getList(1, 10);
      expect(response).toEqual(responseHandler.error(JSON.stringify({ msg: 'fail' })));
    });
  });

  describe('getAllBySearch', () => {
    it('should return filtered suppliers', async () => {
      const result = { data: [], total: 0, page: 1, limit: 10 };
      mockSupplierService.getList.mockResolvedValue(result);

      const searchDto: SearchSupplierDto = { name: 'test', phone: '0123456789' };
      const response = await controller.getAllBySearch(1, 10, searchDto);
      expect(service.getList).toHaveBeenCalledWith(1, 10, { name: 'test', phone: '0123456789' });
      expect(response).toEqual(responseHandler.ok(result));
    });

    it('should handle errors', async () => {
      mockSupplierService.getList.mockRejectedValue(new Error('fail'));
      const response = await controller.getAllBySearch(1, 10, { name: 'test' });
      expect(response).toEqual(responseHandler.error('fail'));
    });

    it('should handle non-Error thrown values', async () => {
      mockSupplierService.getList.mockRejectedValue({ msg: 'fail' });
      const response = await controller.getAllBySearch(1, 10, { name: 'test' });
      expect(response).toEqual(responseHandler.error(JSON.stringify({ msg: 'fail' })));
    });
  });

  describe('create', () => {
    it('should create a supplier', async () => {
      const dto: CreateSupplierDto = {
        name: 'test',
        url_image: 'test@example.com',
        phone: '0123456789',
        address: 'address',
      };
      const result = { id: '1', ...dto };
      mockSupplierService.create.mockResolvedValue(result);

      const response = await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(response).toEqual(responseHandler.ok(result));
    });

    it('should handle errors', async () => {
      mockSupplierService.create.mockRejectedValue(new Error('fail'));
      const response = await controller.create({
        name: 'test',
        url_image: 'test@example.com',
        phone: '0123456789',
        address: 'address',
      });
      expect(response).toEqual(responseHandler.error('fail'));
    });

    it('should handle non-Error thrown values', async () => {
      mockSupplierService.create.mockRejectedValue({ msg: 'fail' });
      const response = await controller.create({
        name: 'test',
        url_image: 'test@example.com',
        phone: '0123456789',
        address: 'address',
      });
      expect(response).toEqual(responseHandler.error(JSON.stringify({ msg: 'fail' })));
    });
  });

  describe('findOne', () => {
    it('should return a supplier by id', async () => {
      const result = { id: '1', name: 'test' };
      mockSupplierService.findOne.mockResolvedValue(result);

      const response = await controller.findOne('1');
      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(response).toEqual(responseHandler.ok(result));
    });

    it('should handle RECORD NOT FOUND error', async () => {
      mockSupplierService.findOne.mockRejectedValue(new Error('RECORD NOT FOUND!'));
      const response = await controller.findOne('1');
      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(response).toEqual(responseHandler.error('RECORD NOT FOUND!'));
    });

    it('should handle other errors', async () => {
      mockSupplierService.findOne.mockRejectedValue(new Error('fail'));
      const response = await controller.findOne('1');
      expect(response).toEqual(responseHandler.error('fail'));
    });

    it('should handle non-Error thrown values', async () => {
      mockSupplierService.findOne.mockRejectedValue({ msg: 'fail' });
      const response = await controller.findOne('1');
      expect(response).toEqual(responseHandler.error(JSON.stringify({ msg: 'fail' })));
    });
  });

  describe('update', () => {
    it('should update a supplier', async () => {
      const dto: UpdateSupplierDto = {
        id: '1',
        name: 'test',
        url_image: 'test@example.com',
        phone: '0123456789',
        address: 'address',
      };
      const result = { ...dto };
      mockSupplierService.update.mockResolvedValue(result);

      const response = await controller.update('1', dto);
      expect(service.update).toHaveBeenCalledWith(dto, '1');
      expect(response).toEqual(responseHandler.ok(result));
    });

    it('should handle errors', async () => {
      mockSupplierService.update.mockRejectedValue(new Error('fail'));
      const response = await controller.update('1', {
        id: '1',
        name: 'test',
        url_image: 'test@example.com',
        phone: '0123456789',
        address: 'address',
      });
      expect(response).toEqual(responseHandler.error('fail'));
    });

    it('should handle non-Error thrown values', async () => {
      mockSupplierService.update.mockRejectedValue({ msg: 'fail' });
      const response = await controller.update('1', {
        id: '1',
        name: 'test',
        url_image: 'test@example.com',
        phone: '0123456789',
        address: 'address',
      });
      expect(response).toEqual(responseHandler.error(JSON.stringify({ msg: 'fail' })));
    });
  });

  describe('remove', () => {
    it('should delete a supplier', async () => {
      const result = { id: '1' };
      mockSupplierService.delete.mockResolvedValue(result);

      const response = await controller.remove('1');
      expect(service.delete).toHaveBeenCalledWith('1');
      expect(response).toEqual(responseHandler.ok(result));
    });

    it('should handle errors', async () => {
      mockSupplierService.delete.mockRejectedValue(new Error('fail'));
      const response = await controller.remove('1');
      expect(response).toEqual(responseHandler.error('fail'));
    });

    it('should handle non-Error thrown values', async () => {
      mockSupplierService.delete.mockRejectedValue({ msg: 'fail' });
      const response = await controller.remove('1');
      expect(response).toEqual(responseHandler.error(JSON.stringify({ msg: 'fail' })));
    });
  });
});