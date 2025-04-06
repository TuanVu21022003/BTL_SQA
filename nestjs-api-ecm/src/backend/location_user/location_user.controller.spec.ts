import { Test, TestingModule } from '@nestjs/testing';
import { LocationUserController } from './location_user.controller';
import { LocationUserService } from './location_user.service';

describe('LocationUserController', () => {
  let controller: LocationUserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationUserController],
      providers: [LocationUserService],
    }).compile();

    controller = module.get<LocationUserController>(LocationUserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
