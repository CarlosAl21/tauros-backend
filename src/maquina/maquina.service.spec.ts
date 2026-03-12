import { Test, TestingModule } from '@nestjs/testing';
import { MaquinaService } from './maquina.service';

describe('MaquinaService', () => {
  let service: MaquinaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MaquinaService],
    }).compile();

    service = module.get<MaquinaService>(MaquinaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
