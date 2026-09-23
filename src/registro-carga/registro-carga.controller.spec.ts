import { UnauthorizedException, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from 'src/auth/roles.guard';
import { ROLES_KEY } from 'src/auth/roles.decorator';
import { Rol } from 'src/usuario/entities/usuario.entity';
import { CreateRegistroCargaDto } from './dto/create-registro-carga.dto';
import { RegistroCargaController } from './registro-carga.controller';
import { RegistroCargaService } from './registro-carga.service';

describe('RegistroCargaController', () => {
  let controller: RegistroCargaController;
  const service = { create: jest.fn(), findHistory: jest.fn(), findLatestPerEjercicio: jest.fn(), findResumen: jest.fn() };
  const user = { user: { userId: 'u1', rol: Rol.USER } };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegistroCargaController],
      providers: [{ provide: RegistroCargaService, useValue: service }],
    })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();
    controller = module.get(RegistroCargaController);
  });

  it('create always uses the requesting user id', () => {
    const dto = { ejercicioId: 'e1', cargaKg: 20 };
    controller.create(user, dto);
    expect(service.create).toHaveBeenCalledWith('u1', dto);
  });

  it('fails closed without a user id', () => {
    expect(() => controller.findMyLatest({ user: { rol: Rol.USER } })).toThrow(UnauthorizedException);
  });

  it('me history and latest are scoped to the requesting user', () => {
    controller.findMyHistory(user, { ejercicioId: 'e1' });
    controller.findMyLatest(user);
    expect(service.findHistory).toHaveBeenCalledWith('u1', 'e1');
    expect(service.findLatestPerEjercicio).toHaveBeenCalledWith('u1');
  });

  it('usuario/:usuarioId is restricted to ADMIN/COACH', () => {
    const roles = Reflect.getMetadata(ROLES_KEY, RegistroCargaController.prototype.findUserHistory);
    expect(roles).toEqual([Rol.ADMIN, Rol.COACH]);
  });

  it('usuario/:usuarioId/resumen is restricted to ADMIN/COACH and delegates', () => {
    const roles = Reflect.getMetadata(ROLES_KEY, RegistroCargaController.prototype.findUserResumen);
    expect(roles).toEqual([Rol.ADMIN, Rol.COACH]);
    controller.findUserResumen('u2');
    expect(service.findResumen).toHaveBeenCalledWith('u2');
  });

  it('declares static routes before parameterized ones', () => {
    const names = Object.getOwnPropertyNames(RegistroCargaController.prototype);
    expect(names.indexOf('findMyLatest')).toBeLessThan(names.indexOf('findUserHistory'));
    expect(names.indexOf('findMyHistory')).toBeLessThan(names.indexOf('findUserHistory'));
  });

  describe('CreateRegistroCargaDto validation', () => {
    const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true });
    const validate = (body: object) =>
      pipe.transform(body, { type: 'body', metatype: CreateRegistroCargaDto });
    const ejercicioId = '3f1c2b1e-8a4d-4c6e-9b2a-1d2e3f4a5b6c';

    it('accepts 2-decimal kg values', async () => {
      await expect(validate({ ejercicioId, cargaKg: 20.41 })).resolves.toMatchObject({ cargaKg: 20.41 });
    });

    it('accepts unidad kg/lb', async () => {
      await expect(validate({ ejercicioId, cargaKg: 20.41, unidad: 'lb' })).resolves.toMatchObject({ unidad: 'lb' });
    });

    it.each([
      ['invalid unidad', { ejercicioId, cargaKg: 20, unidad: 'oz' }],
      ['zero', { ejercicioId, cargaKg: 0 }],
      ['negative', { ejercicioId, cargaKg: -5 }],
      ['too large', { ejercicioId, cargaKg: 10000 }],
      ['3 decimals', { ejercicioId, cargaKg: 20.415 }],
      ['non-uuid ejercicioId', { ejercicioId: 'abc', cargaKg: 20 }],
      ['usuarioId in body', { ejercicioId, cargaKg: 20, usuarioId: ejercicioId }],
    ])('rejects %s', async (_label, body) => {
      await expect(validate(body)).rejects.toBeDefined();
    });
  });
});
