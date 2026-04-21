import { Injectable } from '@nestjs/common';
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

  async findAll() {
    return this.composicionCorporalRepository.find({ relations: ['usuario'] });
  }

  async findOne(id: string) {
    return this.composicionCorporalRepository.findOne({
      where: { composicionCorporalId:id },
      relations: ['usuario'],
    });
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
