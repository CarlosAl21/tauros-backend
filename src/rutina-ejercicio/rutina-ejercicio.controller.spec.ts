import { Test, TestingModule } from '@nestjs/testing';
import { RutinaEjercicioController } from './rutina-ejercicio.controller';
import { RutinaEjercicioService } from './rutina-ejercicio.service';

describe('RutinaEjercicioController', () => {
  let controller: RutinaEjercicioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RutinaEjercicioController],
      providers: [RutinaEjercicioService],
    }).compile();

    controller = module.get<RutinaEjercicioController>(RutinaEjercicioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
