import { Test, TestingModule } from '@nestjs/testing';
import { RutinaDiaService } from './rutina-dia.service';

describe('RutinaDiaService', () => {
  let service: RutinaDiaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RutinaDiaService],
    }).compile();

    service = module.get<RutinaDiaService>(RutinaDiaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
