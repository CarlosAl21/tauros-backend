import { Test, TestingModule } from '@nestjs/testing';
import { RutinaEjercicioService } from './rutina-ejercicio.service';

describe('RutinaEjercicioService', () => {
  let service: RutinaEjercicioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RutinaEjercicioService],
    }).compile();

    service = module.get<RutinaEjercicioService>(RutinaEjercicioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
