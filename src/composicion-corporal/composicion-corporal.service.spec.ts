import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ComposicionCorporalService } from './composicion-corporal.service';
import { ComposicionCorporal } from './entities/composicion-corporal.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';

describe('ComposicionCorporalService', () => {
  let service: ComposicionCorporalService;
  const composicionRepo = { find: jest.fn(), findOne: jest.fn(), create: jest.fn(), save: jest.fn(), remove: jest.fn() };
  const usuarioRepo = { findOne: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComposicionCorporalService,
        { provide: getRepositoryToken(ComposicionCorporal), useValue: composicionRepo },
        { provide: getRepositoryToken(Usuario), useValue: usuarioRepo },
      ],
    }).compile();

    service = module.get<ComposicionCorporalService>(ComposicionCorporalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findLatestByUsuario', () => {
    it('returns nulls when the user has no records', async () => {
      composicionRepo.findOne.mockResolvedValue(null);
      await expect(service.findLatestByUsuario('u1')).resolves.toEqual({ peso: null, fechaRegistro: null });
    });

    it('queries by user ordered by fechaRegistro DESC with PK tie-break', async () => {
      composicionRepo.findOne.mockResolvedValue(null);
      await service.findLatestByUsuario('u1');
      expect(composicionRepo.findOne).toHaveBeenCalledWith({
        where: { usuario: { userId: 'u1' } },
        order: { fechaRegistro: 'DESC', composicionCorporalId: 'DESC' },
      });
    });

    it('converts string peso to number and date to ISO string', async () => {
      composicionRepo.findOne.mockResolvedValue({
        peso: '72.50',
        fechaRegistro: new Date('2026-09-20T10:00:00.000Z'),
      });
      const result = await service.findLatestByUsuario('u1');
      expect(result).toEqual({ peso: 72.5, fechaRegistro: '2026-09-20T10:00:00.000Z' });
      expect(typeof result.peso).toBe('number');
    });
  });

  describe('findAll', () => {
    it('scopes by user when usuarioId is given', async () => {
      composicionRepo.find.mockResolvedValue([]);
      await service.findAll('u1');
      expect(composicionRepo.find).toHaveBeenCalledWith({
        where: { usuario: { userId: 'u1' } },
        relations: ['usuario'],
      });
    });

    it('returns everything when no usuarioId is given', async () => {
      composicionRepo.find.mockResolvedValue([]);
      await service.findAll();
      expect(composicionRepo.find).toHaveBeenCalledWith({ where: undefined, relations: ['usuario'] });
    });
  });

  describe('findOne', () => {
    it('throws NotFound when the record belongs to another user', async () => {
      composicionRepo.findOne.mockResolvedValue({ composicionCorporalId: 'c1', usuario: { userId: 'other' } });
      await expect(service.findOne('c1', 'u1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns the record when it belongs to the user', async () => {
      const record = { composicionCorporalId: 'c1', usuario: { userId: 'u1' } };
      composicionRepo.findOne.mockResolvedValue(record);
      await expect(service.findOne('c1', 'u1')).resolves.toBe(record);
    });

    it('does not restrict ADMIN/COACH (no usuarioId)', async () => {
      const record = { composicionCorporalId: 'c1', usuario: { userId: 'other' } };
      composicionRepo.findOne.mockResolvedValue(record);
      await expect(service.findOne('c1')).resolves.toBe(record);
    });
  });

  describe('create', () => {
    it('persists masa muscular fields', async () => {
      usuarioRepo.findOne.mockResolvedValue({ userId: 'u1' });
      composicionRepo.create.mockImplementation((x) => x);
      composicionRepo.save.mockResolvedValue({ composicionCorporalId: 'c1' });
      composicionRepo.findOne.mockResolvedValue({ composicionCorporalId: 'c1' });

      await service.create({ usuarioId: 'u1', peso: 70.5, masaMuscularKg: 30.25, masaMuscularPorcentaje: 42.1 });

      expect(composicionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ peso: 70.5, masaMuscularKg: 30.25, masaMuscularPorcentaje: 42.1 }),
      );
    });

    it('throws NotFound when the user does not exist', async () => {
      usuarioRepo.findOne.mockResolvedValue(null);
      await expect(service.create({ usuarioId: 'x', peso: 70 })).rejects.toBeInstanceOf(NotFoundException);
      expect(composicionRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const existing = () => ({
      composicionCorporalId: 'c1',
      peso: 70,
      talla: 175,
      grasaCorporal: 18,
      edadCorporal: 30,
      grasaVisceral: 5,
      masaMuscularKg: 30,
      masaMuscularPorcentaje: 40,
      usuario: { userId: 'u1' },
    });

    it('updates the same record in place, keeping untouched fields', async () => {
      composicionRepo.findOne.mockResolvedValueOnce(existing()).mockResolvedValueOnce({ composicionCorporalId: 'c1' });
      composicionRepo.save.mockImplementation(async (x) => x);

      await service.update('c1', { peso: 72.4, masaMuscularKg: 31.5, masaMuscularPorcentaje: 41.2 });

      expect(composicionRepo.create).not.toHaveBeenCalled();
      expect(composicionRepo.save).toHaveBeenCalledTimes(1);
      expect(composicionRepo.save).toHaveBeenCalledWith({
        ...existing(),
        peso: 72.4,
        masaMuscularKg: 31.5,
        masaMuscularPorcentaje: 41.2,
      });
      expect(composicionRepo.findOne).toHaveBeenLastCalledWith({
        where: { composicionCorporalId: 'c1' },
        relations: ['usuario'],
      });
    });

    it('does not overwrite existing values with undefined DTO fields', async () => {
      composicionRepo.findOne.mockResolvedValueOnce(existing()).mockResolvedValueOnce({});
      composicionRepo.save.mockImplementation(async (x) => x);

      await service.update('c1', { talla: undefined });

      expect(composicionRepo.save).toHaveBeenCalledWith(existing());
    });

    it('throws NotFound when the record does not exist', async () => {
      composicionRepo.findOne.mockResolvedValue(null);
      await expect(service.update('missing', { peso: 70 })).rejects.toBeInstanceOf(NotFoundException);
      expect(composicionRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('throws NotFound when the record does not exist', async () => {
      composicionRepo.findOne.mockResolvedValue(null);
      await expect(service.remove('missing')).rejects.toBeInstanceOf(NotFoundException);
      expect(composicionRepo.remove).not.toHaveBeenCalled();
    });
  });
});
