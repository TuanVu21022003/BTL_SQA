
import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { responseHandler } from 'src/Until/responseUtil';
import { AuthGuard } from 'src/guards/JwtAuth.guard';
import { RolesGuard } from 'src/guards/Roles.guard';
import { ProductCreateDTO } from 'src/dto/productDTO/product.create.dto';
import { ProductUpdateDTO } from 'src/dto/productDTO/product.update.dto';
import { ExpirationStatus } from 'src/share/Enum/Enum';

describe('ProductController', () => {
  let controller: ProductController;
  let service: ProductService;

  const mockProductService = {
    getList: jest.fn(),
    searchProducts: jest.fn(),
    create: jest.fn(),
    detail: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        { provide: ProductService, useValue: mockProductService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get<ProductService>(ProductService);

    jest.clearAllMocks();
  });


  it('should be defined', () => {
    expect(controller).toBeDefined();
  });


  describe('getList', () => {
    it('should return products list', async () => {
      const mockResult = { products: [], total: 0, page: 1, limit: 10 };
      mockProductService.getList.mockResolvedValue(mockResult);

      const result = await controller.getList(1, 10, ExpirationStatus.All);
      expect(result).toEqual(responseHandler.ok(mockResult));
      expect(mockProductService.getList).toHaveBeenCalledWith(1, 10, { status: ExpirationStatus.All });
    });

    it('should handle errors', async () => {
      mockProductService.getList.mockRejectedValue(new Error('fail'));
      const result = await controller.getList(1, 10, ExpirationStatus.All);
      expect(result).toEqual(responseHandler.error('fail'));
    });

    it('should use empty status if not provided', async () => {
        const mockResult = { products: [], total: 0, page: 1, limit: 10 };
        mockProductService.getList.mockResolvedValue(mockResult);
  
        // Không truyền status
        // @ts-ignore
        const result = await controller.getList(1, 10);
        expect(result).toEqual(responseHandler.ok(mockResult));
        expect(mockProductService.getList).toHaveBeenCalledWith(1, 10, { status: '' });
      });
  
      it('should handle errors with non-Error object', async () => {
        mockProductService.getList.mockRejectedValue({ msg: 'fail' });
        // @ts-ignore
        const result = await controller.getList(1, 10);
        expect(result).toEqual(responseHandler.error(JSON.stringify({ msg: 'fail' })));
      });
  });

  describe('search', () => {
    it('should return search results', async () => {
      const mockResult = { products: [], total: 0 };
      mockProductService.searchProducts.mockResolvedValue(mockResult);

      const result = await controller.search(1, 10, 'abc', 'cat1');
      expect(result).toEqual(responseHandler.ok(mockResult));
      expect(mockProductService.searchProducts).toHaveBeenCalledWith(1, 10, { name: 'abc', category_id: 'cat1' });
    });

    it('should handle errors', async () => {
      mockProductService.searchProducts.mockRejectedValue(new Error('fail'));
      const result = await controller.search(1, 10, 'abc', 'cat1');
      expect(result).toEqual(responseHandler.error('fail'));
    });

    it('should handle errors with non-Error object', async () => {
        mockProductService.searchProducts.mockRejectedValue({ msg: 'fail' });
        // @ts-ignore
        const result = await controller.search(1, 10, 'abc', 'cat1');
        expect(result).toEqual(responseHandler.error(JSON.stringify({ msg: 'fail' })));
      });
  });

  describe('create', () => {
    it('should create a product', async () => {
      const dto: ProductCreateDTO = {
        name: 'test',
        priceout: 100,
        banner: 'banner',
        description: 'desc',
        stockQuantity: 10,
        weight: 1,
        url_image: 'img',
        category_id: 'cat',
        supplier_id: 'sup',
        expire_date: new Date(),
      };
      const mockProduct = { ...dto, id: '1' };
      mockProductService.create.mockResolvedValue(mockProduct);

      const result = await controller.create(dto);
      expect(result).toEqual(responseHandler.ok(mockProduct));
      expect(mockProductService.create).toHaveBeenCalledWith(dto);
    });

    it('should handle errors', async () => {
      mockProductService.create.mockRejectedValue(new Error('fail'));
      const dto: ProductCreateDTO = {
        name: 'test',
        priceout: 100,
        banner: 'banner',
        description: 'desc',
        stockQuantity: 10,
        weight: 1,
        url_image: 'img',
        category_id: 'cat',
        supplier_id: 'sup',
        expire_date: new Date(),
      };
      const result = await controller.create(dto);
      expect(result).toEqual(responseHandler.error('fail'));
    });

    it('should handle errors with non-Error object', async () => {
        mockProductService.create.mockRejectedValue({ msg: 'fail' });
        const dto: ProductCreateDTO = {
          name: 'test',
          priceout: 100,
          banner: 'banner',
          description: 'desc',
          stockQuantity: 10,
          weight: 1,
          url_image: 'img',
          category_id: 'cat',
          supplier_id: 'sup',
          expire_date: new Date(),
        };
        const result = await controller.create(dto);
        expect(result).toEqual(responseHandler.error(JSON.stringify({ msg: 'fail' })));
      });
  });

  describe('detail', () => {
    it('should return product detail', async () => {
      const mockDetail = { products: { id: '1', name: 'test' } };
      mockProductService.detail.mockResolvedValue(mockDetail);

      const result = await controller.detail('1');
      expect(result).toEqual(responseHandler.ok(mockDetail));
      expect(mockProductService.detail).toHaveBeenCalledWith('1');
    });

    it('should handle errors', async () => {
      mockProductService.detail.mockRejectedValue(new Error('fail'));
      const result = await controller.detail('1');
      expect(result).toEqual(responseHandler.error('fail'));
    });

    it('should handle errors with non-Error object', async () => {
        mockProductService.detail.mockRejectedValue({ msg: 'fail' });
        const result = await controller.detail('1');
        expect(result).toEqual(responseHandler.error(JSON.stringify({ msg: 'fail' })));
      });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const dto: ProductUpdateDTO = {
        id: '1',
        name: 'test',
        priceout: 100,
        banner: 'banner',
        description: 'desc',
        stockQuantity: 10,
        weight: 1,
        url_image: 'img',
        category_id: 'cat',
        supplier_id: 'sup',
        expire_date: new Date(),
      };
      const mockUpdate = { ...dto };
      mockProductService.update.mockResolvedValue(mockUpdate);

      const result = await controller.update(dto);
      expect(result).toEqual(responseHandler.ok(mockUpdate));
      expect(mockProductService.update).toHaveBeenCalledWith(dto, dto.id);
    });

    it('should handle errors', async () => {
      mockProductService.update.mockRejectedValue(new Error('fail'));
      const dto: ProductUpdateDTO = {
        id: '1',
        name: 'test',
        priceout: 100,
        banner: 'banner',
        description: 'desc',
        stockQuantity: 10,
        weight: 1,
        url_image: 'img',
        category_id: 'cat',
        supplier_id: 'sup',
        expire_date: new Date(),
      };
      const result = await controller.update(dto);
      expect(result).toEqual(responseHandler.error('fail'));
    });

    it('should handle errors with non-Error object', async () => {
        mockProductService.update.mockRejectedValue({ msg: 'fail' });
        const dto: ProductUpdateDTO = {
          id: '1',
          name: 'test',
          priceout: 100,
          banner: 'banner',
          description: 'desc',
          stockQuantity: 10,
          weight: 1,
          url_image: 'img',
          category_id: 'cat',
          supplier_id: 'sup',
          expire_date: new Date(),
        };
        const result = await controller.update(dto);
        expect(result).toEqual(responseHandler.error(JSON.stringify({ msg: 'fail' })));
      });
  });

  describe('delete', () => {
    it('should delete a product', async () => {
      mockProductService.delete.mockResolvedValue({ affected: 1 });
      const result = await controller.delete('1');
      expect(result).toEqual(responseHandler.ok({ affected: 1 }));
      expect(mockProductService.delete).toHaveBeenCalledWith('1');
    });

    it('should handle errors', async () => {
      mockProductService.delete.mockRejectedValue(new Error('fail'));
      const result = await controller.delete('1');
      expect(result).toEqual(responseHandler.error('fail'));
    });

    it('should handle errors with non-Error object', async () => {
        mockProductService.delete.mockRejectedValue({ msg: 'fail' });
        const result = await controller.delete('1');
        expect(result).toEqual(responseHandler.error(JSON.stringify({ msg: 'fail' })));
      });
  });
});
