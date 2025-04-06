import { Test, TestingModule } from '@nestjs/testing';
import { LocationUserService } from './location_user.service';
import { LocationUserRepository } from 'src/repository/LocationUserRepository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Location_userEntity } from 'src/entities/user_entity/location_user.entity';
import { CreateLocationUserDto } from 'src/dto/locationUserDTO/create-location_user.dto';
import { UpdateLocationUserDto } from 'src/dto/locationUserDTO/update-location_user.dto';

describe('LocationUserService', () => {
  let service: LocationUserService;
  let repository: LocationUserRepository;

  const mockLocationUserRepository = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationUserService,
        {
          provide: getRepositoryToken(Location_userEntity),
          useValue: mockLocationUserRepository,
        },
      ],
    }).compile();

    service = module.get<LocationUserService>(LocationUserService);
    repository = module.get<LocationUserRepository>(getRepositoryToken(Location_userEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getList', () => {
    it('should return a list of location users', async () => {
      const filters = { user_id: '123' };
      const mockData = [
        {
          id: '1',
          name: 'Test Location',
          address: '123 Main St',
          phone: '123456789',
          default_location: true,
          user_id: '123',
        },
      ];
      mockLocationUserRepository.findAndCount.mockResolvedValue([mockData, mockData.length]);

      const result = await service.getList(filters);
      expect(result).toEqual({ data: mockData, total: mockData.length });
      expect(mockLocationUserRepository.findAndCount).toHaveBeenCalledWith({
        where: { user_id: '8f796b83-7cea-44a1-ae08-9cc796631a5f' },
      });
    });

    it('should throw an error when no locations found', async () => {
      const filters = { user_id: '123' };
      mockLocationUserRepository.findAndCount.mockResolvedValue([[], 0]);

      await expect(service.getList(filters)).rejects.toThrowError('NO LOCATION!');
    });
  });

  describe('createLocation', () => {
    it('should create a new location user', async () => {
      const createLocationUserDto: CreateLocationUserDto = {
        name: 'Test Location',
        address: '123 Main St',
        phone: '123456789',
        default_location: true,
        user_id: '123',
      };

      const mockCreateResponse = {
        id: '1',
        ...createLocationUserDto,
      };

      mockLocationUserRepository.create.mockReturnValue(mockCreateResponse);
      mockLocationUserRepository.save.mockResolvedValue(mockCreateResponse);

      const result = await service.createLocation(createLocationUserDto);
      expect(result).toEqual(mockCreateResponse);
      expect(mockLocationUserRepository.save).toHaveBeenCalledWith(createLocationUserDto);
    });

    it('should update default location method if default_location is true', async () => {
      const createLocationUserDto: CreateLocationUserDto = {
        name: 'Test Location',
        address: '123 Main St',
        phone: '123456789',
        default_location: true,
        user_id: '123',
      };

      const mockExistingLocation = {
        id: '1',
        user_id: '123',
        default_location: false,
      };

      mockLocationUserRepository.findOne.mockResolvedValue(mockExistingLocation);
      mockLocationUserRepository.update.mockResolvedValue(mockExistingLocation);

      await service.createLocation(createLocationUserDto);
      expect(mockLocationUserRepository.update).toHaveBeenCalledWith(mockExistingLocation.id, {
        default_location: false,
      });
    });
  });

  describe('update', () => {
    it('should update location user', async () => {
      const locationUpdateDTO: UpdateLocationUserDto = {
        id: '1',
        name: 'Updated Location',
        address: '456 Main St',
        phone: '987654321',
        default_location: false,
        user_id: '123',
      };
      const mockUpdatedLocation = { id: '1', ...locationUpdateDTO };

      mockLocationUserRepository.update.mockResolvedValue(mockUpdatedLocation);

      const result = await service.update(locationUpdateDTO);
      expect(result).toEqual(mockUpdatedLocation);
      expect(mockLocationUserRepository.update).toHaveBeenCalledWith(locationUpdateDTO, locationUpdateDTO.id);
    });

    it('should update default location if default_location is true', async () => {
      const locationUpdateDTO: UpdateLocationUserDto = {
        id: '1',
        user_id: '123',
        default_location: true,
        name: 'Updated Location',
        address: '456 Main St',
        phone: '987654321',
      };

      const mockExistingLocation = {
        id: '2',
        user_id: '123',
        default_location: false,
      };

      mockLocationUserRepository.findOne.mockResolvedValue(mockExistingLocation);
      mockLocationUserRepository.update.mockResolvedValue(mockExistingLocation);

      await service.update(locationUpdateDTO);
      expect(mockLocationUserRepository.update).toHaveBeenCalledWith(mockExistingLocation.id, {
        default_location: false,
      });
    });
  });

  describe('updateDefaultMethod', () => {
    it('should set the previous default location to false', async () => {
      const locationDTO = {
        user_id: '123',
        default_location: true,
        name: 'Test Location',
        address: '123 Main St',
        phone: '123456789',
      };

      const mockExistingLocation = { id: '1', user_id: '123', default_location: true };

      mockLocationUserRepository.findOne.mockResolvedValue(mockExistingLocation);
      mockLocationUserRepository.update.mockResolvedValue(mockExistingLocation);

      await service.updateDefaultMethod(locationDTO);
      expect(mockLocationUserRepository.update).toHaveBeenCalledWith(mockExistingLocation.id, {
        default_location: false,
      });
    });

    it('should not update if no default location found', async () => {
      const locationDTO = {
        user_id: '123',
        default_location: true,
        name: 'Test Location',
        address: '123 Main St',
        phone: '123456789',
      };

      mockLocationUserRepository.findOne.mockResolvedValue(null);

      await service.updateDefaultMethod(locationDTO);
      expect(mockLocationUserRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a location user', async () => {
      const id = '1';
      const mockDeleteResponse = { affected: 1 };
      mockLocationUserRepository.delete.mockResolvedValue(mockDeleteResponse);

      const result = await service.delete(id);
      expect(result).toEqual(mockDeleteResponse);
      expect(mockLocationUserRepository.delete).toHaveBeenCalledWith(id);
    });
  });
});
