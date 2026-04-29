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
      descansoSegundos: createRutinaDiaDto.descansoSegundos ?? 60,
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
    const rutinaDia = await this.rutinaDiaRepository.findOne({
      where: { rutinaDiaId: id },
      relations: ['planEntrenamiento'],
    });

    if (!rutinaDia) {
      throw new Error('RutinaDia not found');
    }

    const { planEntrenamientoId, ...camposActualizables } = updateRutinaDiaDto;

    if (planEntrenamientoId) {
      const planEntrenamiento = await this.planEntrenamientoRepository.findOne({ where: { planEntrenamientoId } });
      if (!planEntrenamiento) {
        throw new Error('PlanEntrenamiento not found');
      }
      rutinaDia.planEntrenamiento = planEntrenamiento;
    }

    Object.assign(rutinaDia, camposActualizables);

    await this.rutinaDiaRepository.save(rutinaDia);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.rutinaDiaRepository.delete({ rutinaDiaId: id });
    return `This action removes a #${id} rutinaDia`;
  }
}
