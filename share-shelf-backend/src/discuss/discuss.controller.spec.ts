import { Test, TestingModule } from '@nestjs/testing';
import { DiscussController } from './discuss.controller';
import { DiscussService } from './discuss.service';

describe('DiscussController', () => {
  let controller: DiscussController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscussController],
      providers: [
        {
          provide: DiscussService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<DiscussController>(DiscussController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
