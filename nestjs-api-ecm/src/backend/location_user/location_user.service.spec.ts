import { Test, TestingModule } from '@nestjs/testing';
import { LocationUserService } from './location_user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Location_userEntity } from 'src/entities/user_entity/location_user.entity';
import { CreateLocationUserDto } from 'src/dto/locationUserDTO/create-location_user.dto';
import { UpdateLocationUserDto } from 'src/dto/locationUserDTO/update-location_user.dto';

describe('LocationUserService', () => {
  let service: LocationUserService;
  let mockLocationUserRepository: any;

  beforeEach(async () => {
    mockLocationUserRepository = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getList', () => {
    it('should return list with user_id filter', async () => {
      const mockLocations = [{ id: '1', name: 'Location 1' }];
      const mockTotal = 1;
      mockLocationUserRepository.findAndCount.mockResolvedValue([mockLocations, mockTotal]);

      const result = await service.getList({ user_id: '123' });

      expect(result).toEqual({
        data: mockLocations,
        total: mockTotal,
      });
      expect(mockLocationUserRepository.findAndCount).toHaveBeenCalledWith({
        where: { user_id: '123' },
      });
    });

    it('should return list with default_location filter', async () => {
      const mockLocations = [{ id: '1', name: 'Location 1' }];
      const mockTotal = 1;
      mockLocationUserRepository.findAndCount.mockResolvedValue([mockLocations, mockTotal]);

      const result = await service.getList({ default_location: true });

      expect(result).toEqual({
        data: mockLocations,
        total: mockTotal,
      });
      expect(mockLocationUserRepository.findAndCount).toHaveBeenCalledWith({
        where: { default_location: true },
      });
    });

    it('should throw error when no locations found', async () => {
      mockLocationUserRepository.findAndCount.mockResolvedValue([null, 0]);

      await expect(service.getList({})).rejects.toThrow('NO LOCATION!');
    });
  });

  describe('createLocation', () => {
    it('should create location without updating default location', async () => {
      const createDto: CreateLocationUserDto = {
        name: 'New Location',
        address: '123 Street',
        phone: '1234567890',
        default_location: false,
        user_id: '123'
      };

      const mockLocation = { ...createDto, id: '1' };
      mockLocationUserRepository.create.mockReturnValue(mockLocation);
      mockLocationUserRepository.save.mockResolvedValue(mockLocation);
      // Mock for checking default location
      mockLocationUserRepository.findOne.mockResolvedValueOnce(null);
      // Mock for checking existing record
      mockLocationUserRepository.findOne.mockResolvedValueOnce(null);

      const result = await service.createLocation(createDto);

      expect(result).toEqual(mockLocation);
    });

    it('should create location and update existing default location', async () => {
      const createDto: CreateLocationUserDto = {
        name: 'New Location',
        address: '123 Street',
        phone: '1234567890',
        default_location: true,
        user_id: '123'
      };

      const existingLocation = {
        id: '2',
        default_location: true,
        user_id: '123'
      };

      const mockLocation = { ...createDto, id: '1' };
      mockLocationUserRepository.create.mockReturnValue(mockLocation);
      mockLocationUserRepository.save.mockResolvedValue(mockLocation);
      
      // Mock for checking default location
      mockLocationUserRepository.findOne
        .mockResolvedValueOnce(existingLocation)  // For updateDefaultMethod
        .mockResolvedValueOnce(null);             // For create method's existence check
      
      mockLocationUserRepository.findOneBy.mockResolvedValue(existingLocation);

      const result = await service.createLocation(createDto);

      expect(result).toEqual(mockLocation);
      expect(mockLocationUserRepository.findOne).toHaveBeenCalledWith({
        where: {
          default_location: true,
          user_id: '123'
        }
      });
    });
  });

  describe('detail', () => {
    it('should return location details', async () => {
      const mockLocation = { id: '1', name: 'Test Location' };
      mockLocationUserRepository.findOneBy.mockResolvedValue(mockLocation);

      const result = await service.detail('1');
      expect(result).toEqual(mockLocation);
    });

    it('should throw error when location not found', async () => {
      mockLocationUserRepository.findOneBy.mockResolvedValue(null);

      await expect(service.detail('1')).rejects.toThrow('RECORD NOT FOUND!');
    });
  });

  describe('update', () => {
    it('should update location without changing default status', async () => {
      const updateDto: UpdateLocationUserDto = {
        id: '1',
        name: 'Updated Location',
        default_location: false,
        user_id: '123'
      };

      const mockLocation = { ...updateDto };
      mockLocationUserRepository.findOneBy.mockResolvedValue(mockLocation);
      mockLocationUserRepository.save.mockResolvedValue(mockLocation);

      const result = await service.update(updateDto);
      expect(result).toEqual(mockLocation);
    });

    it('should update location and handle default location changes', async () => {
      const updateDto: UpdateLocationUserDto = {
        id: '1',
        name: 'Updated Location',
        default_location: true,
        user_id: '123'
      };

      const existingLocation = {
        id: '2',
        default_location: true,
        user_id: '123'
      };

      const mockLocation = { ...updateDto };
      mockLocationUserRepository.findOneBy.mockResolvedValue(mockLocation);
      mockLocationUserRepository.findOne.mockResolvedValue(existingLocation);
      mockLocationUserRepository.save.mockResolvedValue(mockLocation);

      const result = await service.update(updateDto);
      expect(result).toEqual(mockLocation);
    });
  });

  describe('delete', () => {
    it('should delete location', async () => {
      const mockLocation = { id: '1', name: 'Test Location' };
      mockLocationUserRepository.findOneBy.mockResolvedValue(mockLocation);
      mockLocationUserRepository.delete.mockResolvedValue({ affected: 1 });

      await service.delete('1');

      expect(mockLocationUserRepository.findOneBy).toHaveBeenCalledWith({ id: '1' });
      expect(mockLocationUserRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw error when location not found', async () => {
      mockLocationUserRepository.findOneBy.mockResolvedValue(null);

      await expect(service.delete('1')).rejects.toThrow('RECORD NOT FOUND!');
    });
  });
});