import { Test, TestingModule } from '@nestjs/testing';
import { ComposicionCorporalService } from './composicion-corporal.service';

describe('ComposicionCorporalService', () => {
  let service: ComposicionCorporalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ComposicionCorporalService],
    }).compile();

    service = module.get<ComposicionCorporalService>(ComposicionCorporalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
