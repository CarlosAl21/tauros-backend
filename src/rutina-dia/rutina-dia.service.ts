import { Injectable } from '@nestjs/common';
import { CreateRutinaDiaDto } from './dto/create-rutina-dia.dto';
import { UpdateRutinaDiaDto } from './dto/update-rutina-dia.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RutinaDia } from './entities/rutina-dia.entity';
import { Repository } from 'typeorm';
import { PlanEntrenamiento } from 'src/plan-entrenamiento/entities/plan-entrenamiento.entity';

@Injectable()
export class RutinaDiaService {

  constructor(
    @InjectRepository(RutinaDia)
    private readonly rutinaDiaRepository: Repository<RutinaDia>,

    @InjectRepository(PlanEntrenamiento)
    private readonly planEntrenamientoRepository: Repository<PlanEntrenamiento>
  ) {}

  async create(createRutinaDiaDto: CreateRutinaDiaDto) {
    const planEntrenamiento = await this.planEntrenamientoRepository.findOne({ where: { planEntrenamientoId: createRutinaDiaDto.planEntrenamientoId } });
    if (!planEntrenamiento) {
      throw new Error('PlanEntrenamiento not found');
    }
    const rutinaDia = this.rutinaDiaRepository.create({
      numeroDia: createRutinaDiaDto.numeroDia,
      nombre: createRutinaDiaDto.nombre,
      descripcion: createRutinaDiaDto.descripcion,
      planEntrenamiento: planEntrenamiento,
    });
    return this.rutinaDiaRepository.save(rutinaDia);
  }

  async findAll() {
    return this.rutinaDiaRepository.find();
  }

  async findOne(id: string) {
    return this.rutinaDiaRepository.findOne({ where: { rutinaDiaId: id } });
  }

  async update(id: string, updateRutinaDiaDto: UpdateRutinaDiaDto) {
    const planEntrenamiento = await this.planEntrenamientoRepository.findOne({ where: { planEntrenamientoId: updateRutinaDiaDto.planEntrenamientoId } });
    if (!planEntrenamiento) {
      throw new Error('PlanEntrenamiento not found');
    }
    await this.rutinaDiaRepository.update({ rutinaDiaId: id }, { ...updateRutinaDiaDto, planEntrenamiento });
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.rutinaDiaRepository.delete({ rutinaDiaId: id });
    return `This action removes a #${id} rutinaDia`;
  }
}
