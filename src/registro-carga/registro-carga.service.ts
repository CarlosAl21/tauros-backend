import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ejercicio } from 'src/ejercicio/entities/ejercicio.entity';
import { RutinaEjercicio } from 'src/rutina-ejercicio/entities/rutina-ejercicio.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { CreateRegistroCargaDto } from './dto/create-registro-carga.dto';
import { RegistroCarga, UnidadCarga } from './entities/registro-carga.entity';

export interface RegistroCargaResponse {
  registroCargaId: string;
  ejercicioId: string;
  rutinaEjercicioId: string | null;
  cargaKg: number;
  unidad: UnidadCarga;
  fechaRegistro: string;
}

export interface UltimaCargaResponse {
  ejercicioId: string;
  cargaKg: number;
  unidad: UnidadCarga;
  fechaRegistro: string;
}

export interface ResumenCargaResponse {
  ejercicioId: string;
  ejercicioNombre: string;
  registros: number;
  primeraCargaKg: number;
  primeraFecha: string;
  ultimaCargaKg: number;
  ultimaFecha: string;
  unidad: UnidadCarga;
}

export const HISTORY_LIMIT = 50;

@Injectable()
export class RegistroCargaService {
  constructor(
    @InjectRepository(RegistroCarga)
    private readonly registroCargaRepository: Repository<RegistroCarga>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Ejercicio)
    private readonly ejercicioRepository: Repository<Ejercicio>,
    @InjectRepository(RutinaEjercicio)
    private readonly rutinaEjercicioRepository: Repository<RutinaEjercicio>,
  ) {}

  async create(usuarioId: string, dto: CreateRegistroCargaDto): Promise<RegistroCargaResponse> {
    const usuario = await this.usuarioRepository.findOne({ where: { userId: usuarioId } });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const ejercicio = await this.ejercicioRepository.findOne({ where: { ejercicioId: dto.ejercicioId } });
    if (!ejercicio) {
      throw new NotFoundException('Ejercicio no encontrado');
    }

    let rutinaEjercicio: RutinaEjercicio | null = null;
    if (dto.rutinaEjercicioId) {
      // Only accept routine exercises that belong to the requesting user's plan.
      rutinaEjercicio = await this.rutinaEjercicioRepository.findOne({
        where: {
          rutinaEjercicioId: dto.rutinaEjercicioId,
          rutinaDia: { planEntrenamiento: { usuario: { userId: usuarioId } } },
        },
        relations: ['ejercicio'],
      });
      if (!rutinaEjercicio) {
        throw new NotFoundException('Rutina ejercicio no encontrada');
      }
      if (rutinaEjercicio.ejercicio && rutinaEjercicio.ejercicio.ejercicioId !== dto.ejercicioId) {
        throw new BadRequestException('La rutina ejercicio no corresponde al ejercicio indicado');
      }
    }

    const saved = await this.registroCargaRepository.save(
      this.registroCargaRepository.create({
        usuario,
        ejercicio,
        rutinaEjercicio,
        cargaKg: dto.cargaKg,
        unidad: dto.unidad ?? 'kg',
      }),
    );

    const created = await this.registroCargaRepository.findOne({
      where: { registroCargaId: saved.registroCargaId },
    });
    return this.toResponse(created);
  }

  async findHistory(usuarioId: string, ejercicioId: string): Promise<RegistroCargaResponse[]> {
    const registros = await this.registroCargaRepository.find({
      where: { usuario: { userId: usuarioId }, ejercicio: { ejercicioId } },
      order: { fechaRegistro: 'DESC', registroCargaId: 'DESC' },
      take: HISTORY_LIMIT,
    });
    return registros.map((registro) => this.toResponse(registro));
  }

  /** Latest record per exercise for the given user (Postgres DISTINCT ON). */
  async findLatestPerEjercicio(usuarioId: string): Promise<UltimaCargaResponse[]> {
    const rows: Array<{ ejercicioId: string; cargaKg: string | number; unidad: UnidadCarga; fechaRegistro: Date | string }> =
      await this.registroCargaRepository
        .createQueryBuilder('rc')
        .select('DISTINCT ON (rc."ejercicioId") rc."ejercicioId"', 'ejercicioId')
        .addSelect('rc."cargaKg"', 'cargaKg')
        .addSelect('rc."unidad"', 'unidad')
        .addSelect('rc."fechaRegistro"', 'fechaRegistro')
        .where('rc."usuarioId" = :usuarioId', { usuarioId })
        .orderBy('rc."ejercicioId"')
        .addOrderBy('rc."fechaRegistro"', 'DESC')
        .addOrderBy('rc."registroCargaId"', 'DESC')
        .getRawMany();

    return rows.map((row) => ({
      ejercicioId: row.ejercicioId,
      cargaKg: Number(row.cargaKg),
      unidad: row.unidad,
      fechaRegistro: new Date(row.fechaRegistro).toISOString(),
    }));
  }

  /**
   * Per-exercise progress overview for a user (one query): record count, first
   * and latest load, and the unit of the latest record. Sorted by latest date.
   */
  async findResumen(usuarioId: string): Promise<ResumenCargaResponse[]> {
    const asc = 'rc."fechaRegistro" ASC, rc."registroCargaId" ASC';
    const desc = 'rc."fechaRegistro" DESC, rc."registroCargaId" DESC';
    const rows: Array<{
      ejercicioId: string;
      ejercicioNombre: string;
      registros: string | number;
      primeraCargaKg: string | number;
      primeraFecha: Date | string;
      ultimaCargaKg: string | number;
      ultimaFecha: Date | string;
      unidad: UnidadCarga;
    }> = await this.registroCargaRepository
      .createQueryBuilder('rc')
      .innerJoin('rc.ejercicio', 'e')
      .select('rc."ejercicioId"', 'ejercicioId')
      .addSelect('e."nombre"', 'ejercicioNombre')
      .addSelect('COUNT(*)', 'registros')
      .addSelect(`(ARRAY_AGG(rc."cargaKg" ORDER BY ${asc}))[1]`, 'primeraCargaKg')
      .addSelect('MIN(rc."fechaRegistro")', 'primeraFecha')
      .addSelect(`(ARRAY_AGG(rc."cargaKg" ORDER BY ${desc}))[1]`, 'ultimaCargaKg')
      .addSelect('MAX(rc."fechaRegistro")', 'ultimaFecha')
      .addSelect(`(ARRAY_AGG(rc."unidad" ORDER BY ${desc}))[1]`, 'unidad')
      .where('rc."usuarioId" = :usuarioId', { usuarioId })
      .groupBy('rc."ejercicioId"')
      .addGroupBy('e."nombre"')
      .orderBy('MAX(rc."fechaRegistro")', 'DESC')
      .addOrderBy('rc."ejercicioId"', 'ASC')
      .getRawMany();

    return rows.map((row) => ({
      ejercicioId: row.ejercicioId,
      ejercicioNombre: row.ejercicioNombre,
      registros: Number(row.registros),
      primeraCargaKg: Number(row.primeraCargaKg),
      primeraFecha: new Date(row.primeraFecha).toISOString(),
      ultimaCargaKg: Number(row.ultimaCargaKg),
      ultimaFecha: new Date(row.ultimaFecha).toISOString(),
      unidad: row.unidad,
    }));
  }

  private toResponse(registro: RegistroCarga): RegistroCargaResponse {
    return {
      registroCargaId: registro.registroCargaId,
      ejercicioId: registro.ejercicioId,
      rutinaEjercicioId: registro.rutinaEjercicioId ?? null,
      cargaKg: Number(registro.cargaKg),
      unidad: registro.unidad,
      fechaRegistro: new Date(registro.fechaRegistro).toISOString(),
    };
  }
}
