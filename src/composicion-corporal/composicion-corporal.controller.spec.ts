import { Test, TestingModule } from '@nestjs/testing';
import { ComposicionCorporalController } from './composicion-corporal.controller';
import { ComposicionCorporalService } from './composicion-corporal.service';

describe('ComposicionCorporalController', () => {
  let controller: ComposicionCorporalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComposicionCorporalController],
      providers: [ComposicionCorporalService],
    }).compile();

    controller = module.get<ComposicionCorporalController>(ComposicionCorporalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
