import { Test, TestingModule } from '@nestjs/testing';
import { SuscripcionUsuarioService } from './suscripcion-usuario.service';

describe('SuscripcionUsuarioService', () => {
  let service: SuscripcionUsuarioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SuscripcionUsuarioService],
    }).compile();

    service = module.get<SuscripcionUsuarioService>(SuscripcionUsuarioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
