import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ComposicionCorporalService } from './composicion-corporal.service';
import { ComposicionCorporal } from './entities/composicion-corporal.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';

describe('ComposicionCorporalService', () => {
  let service: ComposicionCorporalService;
  const composicionRepo = { find: jest.fn(), findOne: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComposicionCorporalService,
        { provide: getRepositoryToken(ComposicionCorporal), useValue: composicionRepo },
        { provide: getRepositoryToken(Usuario), useValue: {} },
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
});
