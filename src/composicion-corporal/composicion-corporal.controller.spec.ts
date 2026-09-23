import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ComposicionCorporalController } from './composicion-corporal.controller';
import { ComposicionCorporalService } from './composicion-corporal.service';
import { Rol } from 'src/usuario/entities/usuario.entity';
import { RolesGuard } from 'src/auth/roles.guard';

describe('ComposicionCorporalController', () => {
  let controller: ComposicionCorporalController;
  const service = { findAll: jest.fn(), findOne: jest.fn(), findLatestByUsuario: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComposicionCorporalController],
      providers: [{ provide: ComposicionCorporalService, useValue: service }],
    })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ComposicionCorporalController>(ComposicionCorporalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll scopes USER to own records', async () => {
    await controller.findAll({ user: { userId: 'u1', rol: Rol.USER } });
    expect(service.findAll).toHaveBeenCalledWith('u1');
  });

  it('findAll does not scope ADMIN/COACH', async () => {
    await controller.findAll({ user: { userId: 'a1', rol: Rol.ADMIN } });
    await controller.findAll({ user: { userId: 'c1', rol: Rol.COACH } });
    expect(service.findAll).toHaveBeenNthCalledWith(1, undefined);
    expect(service.findAll).toHaveBeenNthCalledWith(2, undefined);
  });

  it('findAll fails closed for USER without userId', async () => {
    await expect(controller.findAll({ user: { rol: Rol.USER } })).rejects.toBeInstanceOf(UnauthorizedException);
    expect(service.findAll).not.toHaveBeenCalled();
  });

  it('findOne passes USER id as owner scope', () => {
    controller.findOne({ user: { userId: 'u1', rol: Rol.USER } }, 'c1');
    expect(service.findOne).toHaveBeenCalledWith('c1', 'u1');
  });

  it('findMyLatest uses the requesting user id', () => {
    controller.findMyLatest({ user: { userId: 'u1', rol: Rol.COACH } });
    expect(service.findLatestByUsuario).toHaveBeenCalledWith('u1');
  });

  it('declares me/latest before :id so it is not shadowed', () => {
    const names = Object.getOwnPropertyNames(ComposicionCorporalController.prototype);
    expect(names.indexOf('findMyLatest')).toBeLessThan(names.indexOf('findOne'));
  });
});
