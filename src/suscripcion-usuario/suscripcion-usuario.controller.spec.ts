import { Test, TestingModule } from '@nestjs/testing';
import { SuscripcionUsuarioController } from './suscripcion-usuario.controller';
import { SuscripcionUsuarioService } from './suscripcion-usuario.service';

describe('SuscripcionUsuarioController', () => {
  let controller: SuscripcionUsuarioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuscripcionUsuarioController],
      providers: [SuscripcionUsuarioService],
    }).compile();

    controller = module.get<SuscripcionUsuarioController>(SuscripcionUsuarioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
