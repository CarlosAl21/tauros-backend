import { Test, TestingModule } from '@nestjs/testing';
import { SugerenciaController } from './sugerencia.controller';
import { SugerenciaService } from './sugerencia.service';

describe('SugerenciaController', () => {
  let controller: SugerenciaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SugerenciaController],
      providers: [SugerenciaService],
    }).compile();

    controller = module.get<SugerenciaController>(SugerenciaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
