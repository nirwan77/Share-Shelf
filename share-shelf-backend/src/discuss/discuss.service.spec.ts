import { Test, TestingModule } from '@nestjs/testing';
import { DiscussService } from './discuss.service';

describe('DiscussService', () => {
  let service: DiscussService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscussService],
    }).compile();

    service = module.get<DiscussService>(DiscussService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
