import { Injectable } from '@nestjs/common';
import { CreateHorarioDto } from './dto/create-horario.dto';
import { UpdateHorarioDto } from './dto/update-horario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Horario } from './entities/horario.entity';

@Injectable()
export class HorarioService {

  constructor(
    @InjectRepository(Horario)
    private readonly horarioRepository: Repository<Horario>,
  ) {}

  private normalizeDay(day: string) {
    const value = String(day || '').trim();
    if (!value) {
      return '';
    }

    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }

  private dayOrder(day: string) {
    const order = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
    const index = order.indexOf(this.normalizeDay(day));
    return index >= 0 ? index : 999;
  }

  async create(createHorarioDto: CreateHorarioDto) {
    const horariosPorDia = Array.isArray(createHorarioDto.horariosPorDia)
      ? createHorarioDto.horariosPorDia
      : [];

    if (horariosPorDia.length) {
      const saved: Horario[] = [];

      for (const item of horariosPorDia) {
        const dia = this.normalizeDay(item.diaSemana);
        if (!dia) {
          continue;
        }

        const apertura = item.apertura || createHorarioDto.apertura;
        const cierre = item.cierre || createHorarioDto.cierre;

        if (!apertura || !cierre) {
          continue;
        }

        const existing = await this.horarioRepository.findOne({ where: { diasSemanales: dia } });
        if (existing) {
          existing.apertura = apertura;
          existing.cierre = cierre;
          saved.push(await this.horarioRepository.save(existing));
          continue;
        }

        const created = this.horarioRepository.create({
          diasSemanales: dia,
          apertura,
          cierre,
        });
        saved.push(await this.horarioRepository.save(created));
      }

      return saved.sort((a, b) => this.dayOrder(a.diasSemanales) - this.dayOrder(b.diasSemanales));
    }

    const diasSeleccionados = Array.isArray(createHorarioDto.diasSeleccionados)
      ? createHorarioDto.diasSeleccionados
      : [];

    if (diasSeleccionados.length) {
      const saved: Horario[] = [];
      for (const diaRaw of diasSeleccionados) {
        const dia = this.normalizeDay(diaRaw);
        if (!dia || !createHorarioDto.apertura || !createHorarioDto.cierre) {
          continue;
        }

        const existing = await this.horarioRepository.findOne({ where: { diasSemanales: dia } });
        if (existing) {
          existing.apertura = createHorarioDto.apertura;
          existing.cierre = createHorarioDto.cierre;
          saved.push(await this.horarioRepository.save(existing));
          continue;
        }

        const created = this.horarioRepository.create({
          diasSemanales: dia,
          apertura: createHorarioDto.apertura,
          cierre: createHorarioDto.cierre,
        });
        saved.push(await this.horarioRepository.save(created));
      }

      return saved.sort((a, b) => this.dayOrder(a.diasSemanales) - this.dayOrder(b.diasSemanales));
    }

    const horario = this.horarioRepository.create({
      apertura: createHorarioDto.apertura,
      cierre: createHorarioDto.cierre,
      diasSemanales: this.normalizeDay(createHorarioDto.diasSemanales),
    });
    return this.horarioRepository.save(horario);
  }

  async findAll() {
    const horarios = await this.horarioRepository.find();
    return horarios.sort((a, b) => this.dayOrder(a.diasSemanales) - this.dayOrder(b.diasSemanales));
  }

  async findOne(id: string) {
    return this.horarioRepository.findOne({ where: { horarioId: id } });
  }

  async update(id: string, updateHorarioDto: UpdateHorarioDto) {
    await this.horarioRepository.update(id, updateHorarioDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const horario = await this.horarioRepository.findOne({ where: { horarioId: id } });
    if (!horario) {
      throw new Error('Horario not found');
    }
    return this.horarioRepository.remove(horario);
  }
}
