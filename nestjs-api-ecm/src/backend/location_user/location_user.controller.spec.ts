import { Test, TestingModule } from '@nestjs/testing';
import { LocationUserController } from './location_user.controller';
import { LocationUserService } from './location_user.service';
import { CreateLocationUserDto } from 'src/dto/locationUserDTO/create-location_user.dto';
import { UpdateLocationUserDto } from 'src/dto/locationUserDTO/update-location_user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { AuthGuard } from 'src/guards/JwtAuth.guard';
import { RolesGuard } from 'src/guards/Roles.guard';

jest.mock('src/guards/JwtAuth.guard', () => ({
  AuthGuard: jest.fn().mockImplementation(() => ({
    canActivate: () => true
  }))
}));

jest.mock('src/guards/Roles.guard', () => ({
  RolesGuard: jest.fn().mockImplementation(() => ({
    canActivate: () => true
  }))
}));

describe('LocationUserController', () => {
  let controller: LocationUserController;
  let service: LocationUserService;
  let jwtService: JwtService;

  const mockLocationUserService = {
    getList: jest.fn(),
    createLocation: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn()
  };

  const mockUserService = {
    findOne: jest.fn(),
    // Add other methods that UserService uses
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationUserController],
      providers: [
        {
          provide: LocationUserService,
          useValue: mockLocationUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    })
    .overrideGuard(AuthGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<LocationUserController>(LocationUserController);
    service = module.get<LocationUserService>(LocationUserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
    expect(jwtService).toBeDefined();
  });

  describe('getAllLocation', () => {
    it('should return locations for a user', async () => {
      const user_id = 'test-user-id';
      const mockLocations = [
        { id: '1', name: 'Location 1', user_id },
        { id: '2', name: 'Location 2', user_id },
      ];

      mockLocationUserService.getList.mockResolvedValue({ data: mockLocations, total: 2 });

      const result = await controller.getAllLocation(user_id);

      expect(service.getList).toHaveBeenCalledWith({ user_id });
      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: { data: mockLocations, total: 2 }
      });
    });

    it('should handle errors in getAllLocation', async () => {
      const user_id = 'test-user-id';
      mockLocationUserService.getList.mockRejectedValue(new Error('Database error'));

      const result = await controller.getAllLocation(user_id);

      expect(result).toEqual({
        status: 500,
        message: 'Database error',
        success: false,
      });
    });
  });

  describe('getAllLocationAdmin', () => {
    it('should return locations for admin view', async () => {
      const user_id = 'admin-user-id';
      const mockLocations = [
        { id: '1', name: 'Location 1', user_id },
        { id: '2', name: 'Location 2', user_id },
      ];

      mockLocationUserService.getList.mockResolvedValue({ data: mockLocations, total: 2 });

      const result = await controller.getAllLocationAdmin(user_id);

      expect(service.getList).toHaveBeenCalledWith({ user_id });
      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: { data: mockLocations, total: 2 }
      });
    });

    it('should handle errors in getAllLocationAdmin', async () => {
      const user_id = 'admin-user-id';
      mockLocationUserService.getList.mockRejectedValue(new Error('Admin access error'));

      const result = await controller.getAllLocationAdmin(user_id);

      expect(result).toEqual({
        status: 500,
        message: 'Admin access error',
        success: false,
      });
    });
  });

  describe('create', () => {
    it('should create a new location', async () => {
      const createDto: CreateLocationUserDto = {
        name: 'New Location',
        address: '123 Street',
        phone: '1234567890',
        default_location: true,
        user_id: 'test-user-id'
      };

      const mockCreatedLocation = { id: '1', ...createDto };
      mockLocationUserService.createLocation.mockResolvedValue(mockCreatedLocation);

      const result = await controller.create(createDto);

      expect(service.createLocation).toHaveBeenCalledWith(createDto);
      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: mockCreatedLocation
      });
    });

    it('should handle errors in create', async () => {
      const createDto: CreateLocationUserDto = {
        name: 'New Location',
        address: '123 Street',
        phone: '1234567890',
        default_location: true,
        user_id: 'test-user-id'
      };

      mockLocationUserService.createLocation.mockRejectedValue(new Error('Creation failed'));

      const result = await controller.create(createDto);

      expect(result).toEqual({
        status: 500,
        message: 'Creation failed',
        success: false,
      });
    });
  });

  describe('update', () => {
    it('should update a location', async () => {
      const updateDto: UpdateLocationUserDto = {
        id: '1',
        name: 'Updated Location',
        address: '456 Street',
        phone: '0987654321',
        default_location: false,
        user_id: 'test-user-id'
      };

      const mockUpdatedLocation = { ...updateDto };
      mockLocationUserService.update.mockResolvedValue(mockUpdatedLocation);

      const result = await controller.update(updateDto);

      expect(service.update).toHaveBeenCalledWith(updateDto);
      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: mockUpdatedLocation
      });
    });

    it('should handle errors in update', async () => {
      const updateDto: UpdateLocationUserDto = {
        id: '1',
        name: 'Updated Location',
        address: '456 Street',
        phone: '0987654321',
        default_location: false,
        user_id: 'test-user-id'
      };

      mockLocationUserService.update.mockRejectedValue(new Error('Update failed'));

      const result = await controller.update(updateDto);

      expect(result).toEqual({
        status: 500,
        message: 'Update failed',
        success: false,
      });
    });
  });

  describe('remove', () => {
    it('should delete a location', async () => {
      const locationId = 'test-location-id';
      const mockDeleteResult = { affected: 1 };
      
      mockLocationUserService.delete.mockResolvedValue(mockDeleteResult);

      const result = await controller.remove(locationId);

      expect(service.delete).toHaveBeenCalledWith(locationId);
      expect(result).toEqual({
        status: 200,
        message: 'SUCCESS!',
        success: true,
        data: mockDeleteResult
      });
    });

    it('should handle errors in delete', async () => {
      const locationId = 'test-location-id';
      mockLocationUserService.delete.mockRejectedValue(new Error('Delete failed'));

      const result = await controller.remove(locationId);

      expect(result).toEqual({
        status: 500,
        message: 'Delete failed',
        success: false,
      });
    });
  });
});