import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Ejercicio } from 'src/ejercicio/entities/ejercicio.entity';
import { RutinaEjercicio } from 'src/rutina-ejercicio/entities/rutina-ejercicio.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { RegistroCarga } from './entities/registro-carga.entity';
import { HISTORY_LIMIT, RegistroCargaService } from './registro-carga.service';

describe('RegistroCargaService', () => {
  let service: RegistroCargaService;
  const qb = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    addGroupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  };
  const registroRepo = {
    create: jest.fn((x) => x),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(() => qb),
  };
  const usuarioRepo = { findOne: jest.fn() };
  const ejercicioRepo = { findOne: jest.fn() };
  const rutinaEjercicioRepo = { findOne: jest.fn() };

  const fecha = new Date('2026-09-23T12:00:00.000Z');

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistroCargaService,
        { provide: getRepositoryToken(RegistroCarga), useValue: registroRepo },
        { provide: getRepositoryToken(Usuario), useValue: usuarioRepo },
        { provide: getRepositoryToken(Ejercicio), useValue: ejercicioRepo },
        { provide: getRepositoryToken(RutinaEjercicio), useValue: rutinaEjercicioRepo },
      ],
    }).compile();
    service = module.get(RegistroCargaService);
  });

  describe('create', () => {
    beforeEach(() => {
      usuarioRepo.findOne.mockResolvedValue({ userId: 'u1' });
      ejercicioRepo.findOne.mockResolvedValue({ ejercicioId: 'e1' });
      registroRepo.save.mockResolvedValue({ registroCargaId: 'r1' });
      registroRepo.findOne.mockResolvedValue({
        registroCargaId: 'r1',
        ejercicioId: 'e1',
        rutinaEjercicioId: null,
        cargaKg: '20.41',
        unidad: 'lb',
        fechaRegistro: fecha,
      });
    });

    it('creates a record for the requesting user and maps the response', async () => {
      const result = await service.create('u1', { ejercicioId: 'e1', cargaKg: 20.41 });
      expect(registroRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ usuario: { userId: 'u1' }, cargaKg: 20.41, unidad: 'kg', rutinaEjercicio: null }),
      );
      expect(result).toEqual({
        registroCargaId: 'r1',
        ejercicioId: 'e1',
        rutinaEjercicioId: null,
        cargaKg: 20.41,
        unidad: 'lb',
        fechaRegistro: '2026-09-23T12:00:00.000Z',
      });
    });

    it('stores the unit the user typed', async () => {
      await service.create('u1', { ejercicioId: 'e1', cargaKg: 20.41, unidad: 'lb' });
      expect(registroRepo.create).toHaveBeenCalledWith(expect.objectContaining({ unidad: 'lb' }));
    });

    it('throws 404 when the exercise does not exist', async () => {
      ejercicioRepo.findOne.mockResolvedValue(null);
      await expect(service.create('u1', { ejercicioId: 'x', cargaKg: 10 })).rejects.toBeInstanceOf(NotFoundException);
    });

    it('scopes rutinaEjercicio lookup to the user plan and 404s when not owned', async () => {
      rutinaEjercicioRepo.findOne.mockResolvedValue(null);
      await expect(
        service.create('u1', { ejercicioId: 'e1', cargaKg: 10, rutinaEjercicioId: 're1' }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(rutinaEjercicioRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            rutinaEjercicioId: 're1',
            rutinaDia: { planEntrenamiento: { usuario: { userId: 'u1' } } },
          },
        }),
      );
      expect(registroRepo.save).not.toHaveBeenCalled();
    });

    it('rejects a rutinaEjercicio that points to a different exercise', async () => {
      rutinaEjercicioRepo.findOne.mockResolvedValue({ rutinaEjercicioId: 're1', ejercicio: { ejercicioId: 'other' } });
      await expect(
        service.create('u1', { ejercicioId: 'e1', cargaKg: 10, rutinaEjercicioId: 're1' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  it('findHistory filters by user and exercise, newest first, limited', async () => {
    registroRepo.find.mockResolvedValue([]);
    await service.findHistory('u1', 'e1');
    expect(registroRepo.find).toHaveBeenCalledWith({
      where: { usuario: { userId: 'u1' }, ejercicio: { ejercicioId: 'e1' } },
      order: { fechaRegistro: 'DESC', registroCargaId: 'DESC' },
      take: HISTORY_LIMIT,
    });
    expect(HISTORY_LIMIT).toBe(50);
  });

  it('findLatestPerEjercicio uses DISTINCT ON and converts numeric strings', async () => {
    qb.getRawMany.mockResolvedValue([{ ejercicioId: 'e1', cargaKg: '25.00', unidad: 'kg', fechaRegistro: fecha }]);
    const result = await service.findLatestPerEjercicio('u1');
    expect(qb.select).toHaveBeenCalledWith(expect.stringContaining('DISTINCT ON'), 'ejercicioId');
    expect(qb.where).toHaveBeenCalledWith(expect.any(String), { usuarioId: 'u1' });
    expect(qb.addSelect).toHaveBeenCalledWith('rc."unidad"', 'unidad');
    expect(qb.addOrderBy).toHaveBeenCalledWith('rc."fechaRegistro"', 'DESC');
    expect(result).toEqual([{ ejercicioId: 'e1', cargaKg: 25, unidad: 'kg', fechaRegistro: '2026-09-23T12:00:00.000Z' }]);
  });

  describe('findResumen', () => {
    it('maps aggregate rows to numbers and ISO dates', async () => {
      qb.getRawMany.mockResolvedValue([
        {
          ejercicioId: 'e1',
          ejercicioNombre: 'Sentadilla',
          registros: '3',
          primeraCargaKg: '20.00',
          primeraFecha: new Date('2026-09-01T10:00:00.000Z'),
          ultimaCargaKg: '25.50',
          ultimaFecha: fecha,
          unidad: 'lb',
        },
      ]);
      await expect(service.findResumen('u1')).resolves.toEqual([
        {
          ejercicioId: 'e1',
          ejercicioNombre: 'Sentadilla',
          registros: 3,
          primeraCargaKg: 20,
          primeraFecha: '2026-09-01T10:00:00.000Z',
          ultimaCargaKg: 25.5,
          ultimaFecha: '2026-09-23T12:00:00.000Z',
          unidad: 'lb',
        },
      ]);
    });

    it('scopes to the user, joins ejercicio and sorts by latest date', async () => {
      qb.getRawMany.mockResolvedValue([]);
      await expect(service.findResumen('u1')).resolves.toEqual([]);
      expect(qb.innerJoin).toHaveBeenCalledWith('rc.ejercicio', 'e');
      expect(qb.addSelect).toHaveBeenCalledWith('e."nombre"', 'ejercicioNombre');
      expect(qb.where).toHaveBeenCalledWith(expect.any(String), { usuarioId: 'u1' });
      expect(qb.orderBy).toHaveBeenCalledWith('MAX(rc."fechaRegistro")', 'DESC');
    });
  });
});
