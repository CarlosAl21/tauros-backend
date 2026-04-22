import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePlanEntrenamientoDto } from './dto/create-plan-entrenamiento.dto';
import { UpdatePlanEntrenamientoDto } from './dto/update-plan-entrenamiento.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PlanEntrenamiento } from './entities/plan-entrenamiento.entity';
import { Repository } from 'typeorm';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { RutinaDia } from 'src/rutina-dia/entities/rutina-dia.entity';
import { RutinaEjercicio } from 'src/rutina-ejercicio/entities/rutina-ejercicio.entity';

@Injectable()
export class PlanEntrenamientoService {

  constructor(
    @InjectRepository(PlanEntrenamiento)
    private readonly planEntrenamientoRepository: Repository<PlanEntrenamiento>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    @InjectRepository(RutinaDia)
    private readonly rutinaDiaRepository: Repository<RutinaDia>,

    @InjectRepository(RutinaEjercicio)
    private readonly rutinaEjercicioRepository: Repository<RutinaEjercicio>,
  ) {}

  private readonly planRelations = [
    'usuario',
    'rutinasDia',
    'rutinasDia.rutinasEjercicio',
    'rutinasDia.rutinasEjercicio.ejercicio',
  ] as const;

  async create(createPlanEntrenamientoDto: CreatePlanEntrenamientoDto) {
    const duracionDias = Number(createPlanEntrenamientoDto.duracionDias);
    if (!Number.isInteger(duracionDias) || duracionDias < 1) {
      throw new BadRequestException('duracionDias debe ser un numero entero mayor a cero');
    }

    const planEntrenamiento = this.planEntrenamientoRepository.create({
      nombre: createPlanEntrenamientoDto.nombre,
      descripcion: createPlanEntrenamientoDto.descripcion,
      duracionDias,
      objetivo: createPlanEntrenamientoDto.objetivo,
      usuario: createPlanEntrenamientoDto.usuarioId ? await this.usuarioRepository.findOne({ where: { userId: createPlanEntrenamientoDto.usuarioId } }) : null,
    });

    const savedPlan = await this.planEntrenamientoRepository.save(planEntrenamiento);
    return this.findOne(savedPlan.planEntrenamientoId);
  }

  async findAll() {
    return this.planEntrenamientoRepository.find({
      relations: [...this.planRelations],
      order: {
        nombre: 'ASC',
      },
    });
  }

  async findOne(id: string) {
    return this.planEntrenamientoRepository.findOne({
      where: { planEntrenamientoId: id },
      relations: [...this.planRelations],
    });
  }

  async update(id: string, updatePlanEntrenamientoDto: UpdatePlanEntrenamientoDto) {
    const duracionDias = updatePlanEntrenamientoDto.duracionDias === undefined
      ? undefined
      : Number(updatePlanEntrenamientoDto.duracionDias);

    if (duracionDias !== undefined && (!Number.isInteger(duracionDias) || duracionDias < 1)) {
      throw new BadRequestException('duracionDias debe ser un numero entero mayor a cero');
    }

    await this.planEntrenamientoRepository.update(id, {
      nombre: updatePlanEntrenamientoDto.nombre,
      descripcion: updatePlanEntrenamientoDto.descripcion,
      ...(duracionDias !== undefined ? { duracionDias } : {}),
      objetivo: updatePlanEntrenamientoDto.objetivo,
      usuario: updatePlanEntrenamientoDto.usuarioId ? await this.usuarioRepository.findOne({ where: { userId: updatePlanEntrenamientoDto.usuarioId } }) : null,
    });
    return this.findOne(id);
  }

  async remove(id: string) {
    const planEntrenamiento = await this.planEntrenamientoRepository.findOne({ where: { planEntrenamientoId: id } });
    if (!planEntrenamiento) {
      throw new Error('Plan de entrenamiento not found');
    }
    return this.planEntrenamientoRepository.remove(planEntrenamiento);
  }

  async asignarPlan(planEntrenamientoId: string, usuarioId: string) {
    const planEntrenamiento = await this.planEntrenamientoRepository.findOne({
      where: { planEntrenamientoId },
      relations: ['rutinasDia', 'rutinasDia.rutinasEjercicio', 'rutinasDia.rutinasEjercicio.ejercicio'],
    });
    const usuario = await this.usuarioRepository.findOne({ where: { userId: usuarioId } });

    if (!planEntrenamiento) {
      throw new Error('Plan de entrenamiento not found');
    }
    if (!usuario) {
      throw new Error('Usuario not found');
    }

    const copiaPlan = this.planEntrenamientoRepository.create({
      nombre: planEntrenamiento.nombre,
      descripcion: planEntrenamiento.descripcion,
      duracionDias: planEntrenamiento.duracionDias,
      objetivo: planEntrenamiento.objetivo,
      esPlantilla: false,
      usuario: usuario,
    });
    const planGuardado = await this.planEntrenamientoRepository.save(copiaPlan);

    for (const dia of planEntrenamiento.rutinasDia) {
      const copiaDia = this.rutinaDiaRepository.create({
        numeroDia: dia.numeroDia,
        nombre: dia.nombre,
        descripcion: dia.descripcion,
        planEntrenamiento: planGuardado,
      });
      const diaGuardado = await this.rutinaDiaRepository.save(copiaDia);

      for (const ejercicio of dia.rutinasEjercicio) {
        const copiaEjercicio = this.rutinaEjercicioRepository.create({
          orden: ejercicio.orden,
          series: ejercicio.series,
          repeticiones: ejercicio.repeticiones,
          carga: ejercicio.carga,
          notasEspecificas: ejercicio.notasEspecificas,
          rutinaDia: diaGuardado,
          ejercicio: ejercicio.ejercicio,
        });
        await this.rutinaEjercicioRepository.save(copiaEjercicio);
      }
    }

    return this.planEntrenamientoRepository.findOne({
      where: { planEntrenamientoId: planGuardado.planEntrenamientoId },
      relations: [...this.planRelations],
    });
  }

}
