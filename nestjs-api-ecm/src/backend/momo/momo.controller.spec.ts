import { Test, TestingModule } from '@nestjs/testing';
import { MomoController } from './momo.controller';
import { MomoService } from './momo.service';

describe('MomoController', () => {
  let controller: MomoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MomoController],
      providers: [MomoService],
    }).compile();

    controller = module.get<MomoController>(MomoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
