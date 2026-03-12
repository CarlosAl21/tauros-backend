import { Test, TestingModule } from '@nestjs/testing';
import { MaquinaController } from './maquina.controller';
import { MaquinaService } from './maquina.service';

describe('MaquinaController', () => {
  let controller: MaquinaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaquinaController],
      providers: [MaquinaService],
    }).compile();

    controller = module.get<MaquinaController>(MaquinaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
