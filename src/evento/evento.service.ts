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

  async create(createEventoDto: CreateEventoDto) {
    const evento = this.eventoRepository.create({
      nombre: createEventoDto.nombre,
      fechaHora: new Date(createEventoDto.fechaHora),
      lugar: createEventoDto.lugar,
      descripcion: createEventoDto.descripcion,
      participantes: [],
    });

    return this.eventoRepository.save(evento);
  }

  async findAll() {
    return this.eventoRepository.find();
  }

  async findActivos() {
    return this.eventoRepository.find({ where: { activo: true } });
  }

  async findOne(id: string) {
    return this.eventoRepository.findOne({
      where: { eventoId: id},
      relations: ['participantes'],
    });
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
    return this.eventoRepository.save(evento);
  }

  async registrarParticipante(eventoId: string, usuarioId: string) {
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
