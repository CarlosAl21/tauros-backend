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

  private normalizeTime(value?: string) {
    const raw = String(value || '').trim();
    if (!raw) {
      return '';
    }

    if (raw.toLowerCase() === 'cerrado') {
      return 'Cerrado';
    }

    const parts = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (!parts) {
      return raw;
    }

    const hours = parts[1].padStart(2, '0');
    const minutes = parts[2];
    return `${hours}:${minutes}`;
  }

  private formatHorario(horario: Horario | null) {
    if (!horario) {
      return null;
    }

    return {
      ...horario,
      apertura: this.normalizeTime(horario.apertura),
      cierre: this.normalizeTime(horario.cierre),
      diasSemanales: this.normalizeDay(horario.diasSemanales),
    } as Horario;
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

        const apertura = this.normalizeTime(item.apertura || createHorarioDto.apertura);
        const cierre = this.normalizeTime(item.cierre || createHorarioDto.cierre);

        if (!apertura || !cierre) {
          continue;
        }

        const existing = await this.horarioRepository.findOne({ where: { diasSemanales: dia } });
        if (existing) {
          existing.apertura = apertura;
          existing.cierre = cierre;
          saved.push(this.formatHorario(await this.horarioRepository.save(existing)) as Horario);
          continue;
        }

        const created = this.horarioRepository.create({
          diasSemanales: dia,
          apertura,
          cierre,
        });
        saved.push(this.formatHorario(await this.horarioRepository.save(created)) as Horario);
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

        const apertura = this.normalizeTime(createHorarioDto.apertura);
        const cierre = this.normalizeTime(createHorarioDto.cierre);

        const existing = await this.horarioRepository.findOne({ where: { diasSemanales: dia } });
        if (existing) {
          existing.apertura = apertura;
          existing.cierre = cierre;
          saved.push(this.formatHorario(await this.horarioRepository.save(existing)) as Horario);
          continue;
        }

        const created = this.horarioRepository.create({
          diasSemanales: dia,
          apertura,
          cierre,
        });
        saved.push(this.formatHorario(await this.horarioRepository.save(created)) as Horario);
      }

      return saved.sort((a, b) => this.dayOrder(a.diasSemanales) - this.dayOrder(b.diasSemanales));
    }

    const horario = this.horarioRepository.create({
      apertura: this.normalizeTime(createHorarioDto.apertura),
      cierre: this.normalizeTime(createHorarioDto.cierre),
      diasSemanales: this.normalizeDay(createHorarioDto.diasSemanales),
    });
    return this.formatHorario(await this.horarioRepository.save(horario));
  }

  async findAll() {
    const horarios = await this.horarioRepository.find();
    return horarios
      .sort((a, b) => this.dayOrder(a.diasSemanales) - this.dayOrder(b.diasSemanales))
      .map((item) => this.formatHorario(item));
  }

  async findOne(id: string) {
    const horario = await this.horarioRepository.findOne({ where: { horarioId: id } });
    return this.formatHorario(horario);
  }

  async update(id: string, updateHorarioDto: UpdateHorarioDto) {
    const { horarioId: _horarioId, ...rest } = updateHorarioDto as UpdateHorarioDto & { horarioId?: string };
    const normalized = {
      ...rest,
      apertura: rest.apertura !== undefined ? this.normalizeTime(rest.apertura) : undefined,
      cierre: rest.cierre !== undefined ? this.normalizeTime(rest.cierre) : undefined,
      diasSemanales: rest.diasSemanales !== undefined ? this.normalizeDay(rest.diasSemanales) : undefined,
    };

    await this.horarioRepository.update(id, normalized);
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
