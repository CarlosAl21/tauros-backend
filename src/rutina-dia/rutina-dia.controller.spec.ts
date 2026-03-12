import { Test, TestingModule } from '@nestjs/testing';
import { RutinaDiaController } from './rutina-dia.controller';
import { RutinaDiaService } from './rutina-dia.service';

describe('RutinaDiaController', () => {
  let controller: RutinaDiaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RutinaDiaController],
      providers: [RutinaDiaService],
    }).compile();

    controller = module.get<RutinaDiaController>(RutinaDiaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
