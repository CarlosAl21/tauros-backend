import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePlanEntrenamientoDto } from './dto/create-plan-entrenamiento.dto';
import { UpdatePlanEntrenamientoDto } from './dto/update-plan-entrenamiento.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PlanEntrenamiento } from './entities/plan-entrenamiento.entity';
import { DataSource, Repository } from 'typeorm';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { RutinaDia } from 'src/rutina-dia/entities/rutina-dia.entity';
import { RutinaEjercicio } from 'src/rutina-ejercicio/entities/rutina-ejercicio.entity';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class PlanEntrenamientoService {

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,

    @InjectRepository(PlanEntrenamiento)
    private readonly planEntrenamientoRepository: Repository<PlanEntrenamiento>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    @InjectRepository(RutinaDia)
    private readonly rutinaDiaRepository: Repository<RutinaDia>,

    @InjectRepository(RutinaEjercicio)
    private readonly rutinaEjercicioRepository: Repository<RutinaEjercicio>,
  ) {}

  private buildDayName(dayNumber: number) {
    let value = dayNumber;
    let label = '';

    while (value > 0) {
      value -= 1;
      label = String.fromCharCode(65 + (value % 26)) + label;
      value = Math.floor(value / 26);
    }

    return label;
  }

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

    let savedPlanId = '';

    await this.dataSource.transaction(async (manager) => {
      const planRepository = manager.getRepository(PlanEntrenamiento);
      const rutinaDiaRepository = manager.getRepository(RutinaDia);

      const planEntrenamiento = planRepository.create({
        nombre: createPlanEntrenamientoDto.nombre,
        descripcion: createPlanEntrenamientoDto.descripcion,
        duracionDias,
        objetivo: createPlanEntrenamientoDto.objetivo,
        esPlantilla: true,
        usuario: null,
      });

      const savedPlan = await planRepository.save(planEntrenamiento);

      const rutinaDias = Array.from({ length: duracionDias }, (_, index) => rutinaDiaRepository.create({
        numeroDia: index + 1,
        nombre: this.buildDayName(index + 1),
        descripcion: `Dia ${index + 1}`,
        planEntrenamiento: savedPlan,
      }));

      await rutinaDiaRepository.save(rutinaDias);
      savedPlanId = savedPlan.planEntrenamientoId;
    });

    return this.findOne(savedPlanId);
  }

  async findAll() {
    return this.planEntrenamientoRepository.find({
      relations: [...this.planRelations],
      order: {
        nombre: 'ASC',
        rutinasDia: {
          numeroDia: 'ASC',
          rutinasEjercicio: {
            orden: 'ASC',
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.planEntrenamientoRepository.findOne({
      where: { planEntrenamientoId: id },
      relations: [...this.planRelations],
      order: {
        rutinasDia: {
          numeroDia: 'ASC',
          rutinasEjercicio: {
            orden: 'ASC',
          },
        },
      },
    });
  }

  async update(id: string, updatePlanEntrenamientoDto: UpdatePlanEntrenamientoDto) {
    if (updatePlanEntrenamientoDto.usuarioId) {
      return this.asignarPlan(id, updatePlanEntrenamientoDto.usuarioId);
    }

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
      usuario: null,
    });
    return this.findOne(id);
  }

  async remove(id: string) {
    return this.dataSource.transaction(async (manager) => {
      const planRepository = manager.getRepository(PlanEntrenamiento);
      const rutinaDiaRepository = manager.getRepository(RutinaDia);
      const rutinaEjercicioRepository = manager.getRepository(RutinaEjercicio);

      const planEntrenamiento = await planRepository.findOne({ where: { planEntrenamientoId: id } });
      if (!planEntrenamiento) {
        throw new Error('Plan de entrenamiento not found');
      }

      const rutinaDiaIdsSubquery = rutinaDiaRepository
        .createQueryBuilder('rutinaDia')
        .select('rutinaDia.rutinaDiaId')
        .where('rutinaDia.planEntrenamientoId = :id', { id });

      await rutinaEjercicioRepository
        .createQueryBuilder()
        .delete()
        .from(RutinaEjercicio)
        .where(`rutinaDiaId IN (${rutinaDiaIdsSubquery.getQuery()})`)
        .setParameters(rutinaDiaIdsSubquery.getParameters())
        .execute();

      await rutinaDiaRepository
        .createQueryBuilder()
        .delete()
        .from(RutinaDia)
        .where('planEntrenamientoId = :id', { id })
        .execute();

      await planRepository.delete({ planEntrenamientoId: id });

      return { deleted: true };
    });
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
