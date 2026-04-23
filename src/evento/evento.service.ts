import { Injectable } from '@nestjs/common';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Evento } from './entities/evento.entity';
import { Repository } from 'typeorm';
import { Usuario } from 'src/usuario/entities/usuario.entity';

@Injectable()
export class EventoService {
  constructor(
    @InjectRepository(Evento)
    private readonly eventoRepository: Repository<Evento>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  private sanitizeEvento(evento: Evento | null) {
    if (!evento) {
      return null;
    }

    const participantes = Array.isArray(evento.participantes)
      ? evento.participantes.map((usuario) => ({
          userId: usuario.userId,
          cedula: usuario.cedula,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          correo: usuario.correo,
          telefono: usuario.telefono,
          rol: usuario.rol,
          isActive: usuario.isActive,
        }))
      : [];

    return {
      ...evento,
      participantes,
      numParticipantes: participantes.length,
    };
  }

  private async deactivateExpiredEvents() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    await this.eventoRepository
      .createQueryBuilder()
      .update(Evento)
      .set({ activo: false })
      .where('activo = :activo', { activo: true })
      .andWhere('fechaHora < :startOfToday', { startOfToday })
      .execute();
  }

  async create(createEventoDto: CreateEventoDto) {
    const evento = this.eventoRepository.create({
      nombre: createEventoDto.nombre,
      fechaHora: new Date(createEventoDto.fechaHora),
      lugar: createEventoDto.lugar,
      descripcion: createEventoDto.descripcion,
      participantes: [],
    });

    await this.eventoRepository.save(evento);
    return this.findOne(evento.eventoId);
  }

  async findAll() {
    await this.deactivateExpiredEvents();
    const eventos = await this.eventoRepository.find({
      relations: ['participantes'],
      order: {
        fechaHora: 'ASC',
      },
    });

    return eventos.map((evento) => this.sanitizeEvento(evento));
  }

  async findActivos() {
    await this.deactivateExpiredEvents();
    const eventos = await this.eventoRepository.find({
      where: { activo: true },
      relations: ['participantes'],
      order: {
        fechaHora: 'ASC',
      },
    });

    return eventos.map((evento) => this.sanitizeEvento(evento));
  }

  async findOne(id: string) {
    await this.deactivateExpiredEvents();
    const evento = await this.eventoRepository.findOne({
      where: { eventoId: id},
      relations: ['participantes'],
    });

    return this.sanitizeEvento(evento);
  }

  async update(id: string, updateEventoDto: UpdateEventoDto) {
    await this.eventoRepository.update(id, updateEventoDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const evento = await this.eventoRepository.findOne({ where: { eventoId: id } });
    if (!evento) {
      throw new Error('Evento not found');
    }
    evento.activo = false; // marcar como inactivo en lugar de eliminar
    await this.eventoRepository.save(evento);
    return this.findOne(id);
  }

  async registrarParticipante(eventoId: string, usuarioId: string) {
    await this.deactivateExpiredEvents();

    const evento = await this.eventoRepository.findOne({
      where: { eventoId, activo: true },
      relations: ['participantes'],
    });
    if (!evento) {
      throw new Error('Evento not found');
    }

    const usuario = await this.usuarioRepository.findOne({ where: { userId: usuarioId, isActive: true } });
    if (!usuario) {
      throw new Error('Usuario not found');
    }

    if (!evento.participantes) {
      evento.participantes = [];
    }

    const yaRegistrado = evento.participantes.some((participante) => participante.userId === usuarioId);
    if (yaRegistrado) {
      throw new Error('Usuario already registered in evento');
    }

    evento.participantes.push(usuario);
    evento.numParticipantes = evento.participantes.length;
    await this.eventoRepository.save(evento);

    return this.findOne(eventoId);
  }

  
}
