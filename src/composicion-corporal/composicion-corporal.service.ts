import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateComposicionCorporalDto } from './dto/create-composicion-corporal.dto';
import { UpdateComposicionCorporalDto } from './dto/update-composicion-corporal.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComposicionCorporal } from './entities/composicion-corporal.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';

@Injectable()
export class ComposicionCorporalService {

  constructor(
    @InjectRepository(ComposicionCorporal)
    private readonly composicionCorporalRepository: Repository<ComposicionCorporal>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async create(createComposicionCorporalDto: CreateComposicionCorporalDto) {
    const usuario = await this.usuarioRepository.findOne({ where: { userId: createComposicionCorporalDto.usuarioId } });
    if (!usuario) {
      throw new Error('Usuario not found');
    }
    const composicionCorporal = this.composicionCorporalRepository.create({
      peso: createComposicionCorporalDto.peso,
      talla: createComposicionCorporalDto.talla,
      grasaCorporal: createComposicionCorporalDto.grasaCorporal,
      edadCorporal: createComposicionCorporalDto.edadCorporal,
      grasaVisceral: createComposicionCorporalDto.grasaVisceral,
      usuario: usuario,
    });
    const saved = await this.composicionCorporalRepository.save(composicionCorporal);
    return this.composicionCorporalRepository.findOne({
      where: { composicionCorporalId: saved.composicionCorporalId },
      relations: ['usuario'],
    });
  }

  /**
   * Returns body composition records. When `usuarioId` is provided, only that
   * user's records are returned (used to scope USER role requests).
   */
  async findAll(usuarioId?: string) {
    return this.composicionCorporalRepository.find({
      where: usuarioId ? { usuario: { userId: usuarioId } } : undefined,
      relations: ['usuario'],
    });
  }

  /**
   * Returns a single record. When `usuarioId` is provided and the record does
   * not belong to that user, a 404 is thrown so record existence is not leaked.
   */
  async findOne(id: string, usuarioId?: string) {
    const composicion = await this.composicionCorporalRepository.findOne({
      where: { composicionCorporalId: id },
      relations: ['usuario'],
    });
    if (usuarioId && composicion?.usuario?.userId !== usuarioId) {
      throw new NotFoundException('Composicion corporal no encontrada');
    }
    return composicion;
  }

  /**
   * Latest record of the given user, ordered by fechaRegistro DESC with the
   * primary key as tie-breaker. Always returns the same shape; both fields are
   * null when the user has no records.
   */
  async findLatestByUsuario(usuarioId: string): Promise<{ peso: number | null; fechaRegistro: string | null }> {
    const latest = await this.composicionCorporalRepository.findOne({
      where: { usuario: { userId: usuarioId } },
      order: { fechaRegistro: 'DESC', composicionCorporalId: 'DESC' },
    });
    if (!latest) {
      return { peso: null, fechaRegistro: null };
    }
    // Numeric/decimal columns may come back from the driver as strings.
    const peso = latest.peso === null || latest.peso === undefined ? null : Number(latest.peso);
    const fecha = latest.fechaRegistro ? new Date(latest.fechaRegistro) : null;
    return {
      peso: peso !== null && Number.isFinite(peso) ? peso : null,
      fechaRegistro: fecha && !Number.isNaN(fecha.getTime()) ? fecha.toISOString() : null,
    };
  }

  async update(id: string, updateComposicionCorporalDto: UpdateComposicionCorporalDto) {
    const composicionActual = await this.composicionCorporalRepository.findOne({
      where: { composicionCorporalId: id },
      relations: ['usuario'],
    });
    if (!composicionActual) {
      throw new Error('ComposicionCorporal not found');
    }

    const nuevaComposicion = this.composicionCorporalRepository.create({
      peso: updateComposicionCorporalDto.peso ?? composicionActual.peso,
      talla: updateComposicionCorporalDto.talla ?? composicionActual.talla,
      grasaCorporal: updateComposicionCorporalDto.grasaCorporal ?? composicionActual.grasaCorporal,
      edadCorporal: updateComposicionCorporalDto.edadCorporal ?? composicionActual.edadCorporal,
      grasaVisceral: updateComposicionCorporalDto.grasaVisceral ?? composicionActual.grasaVisceral,
      usuario: composicionActual.usuario,
    });

    const saved = await this.composicionCorporalRepository.save(nuevaComposicion);
    return this.composicionCorporalRepository.findOne({
      where: { composicionCorporalId: saved.composicionCorporalId },
      relations: ['usuario'],
    });
  }

  async remove(id: string) {
    const composicion = await this.composicionCorporalRepository.findOne({ where: { composicionCorporalId: id } });
    if (!composicion) {
      throw new Error('ComposicionCorporal not found');
    }
    return this.composicionCorporalRepository.remove(composicion);
  }
  
}
