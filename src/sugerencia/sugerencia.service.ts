import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Sugerencia, tipoEntidad } from './entities/sugerencia.entity';
import { In, Repository } from 'typeorm';
import { Evento } from 'src/evento/entities/evento.entity';
import { Ejercicio } from 'src/ejercicio/entities/ejercicio.entity';
import { RutinaDia } from 'src/rutina-dia/entities/rutina-dia.entity';
import { CreateSugerenciaDto } from './dto/create-sugerencia.dto';
import { UpdateSugerenciaDto } from './dto/update-sugerencia.dto';

@Injectable()
export class SugerenciaService {

  constructor(
    @InjectRepository(Sugerencia) 
    private readonly sugerenciaRepository: Repository<Sugerencia>,
    @InjectRepository(Evento)
    private readonly eventoRepository: Repository<Evento>,
    @InjectRepository(Ejercicio)
    private readonly ejercicioRepository: Repository<Ejercicio>,
    @InjectRepository(RutinaDia)
    private readonly rutinaDiaRepository: Repository<RutinaDia>,
  ) {}

  async create(createSugerenciaDto: CreateSugerenciaDto) {
    const tipoEntidadNormalizado = this.normalizarTipo(createSugerenciaDto.tipoEntidad) as tipoEntidad;

    await this.sugerenciaRepository.save(this.sugerenciaRepository.create({
      contenido: createSugerenciaDto.contenido.trim(),
      tipoEntidad: tipoEntidadNormalizado,
      entidadId: createSugerenciaDto.entidadId,
    }));

    return this.findAll(tipoEntidadNormalizado);
  }

  async updateEstado(sugerenciaId: string, updateSugerenciaDto: UpdateSugerenciaDto) {
    const sugerencia = await this.sugerenciaRepository.findOne({ where: { sugerenciaId } });
    if (!sugerencia) {
      throw new BadRequestException('Sugerencia no encontrada');
    }

    sugerencia.solucionada = Boolean(updateSugerenciaDto.solucionada);
    await this.sugerenciaRepository.save(sugerencia);

    return this.findAll(undefined, undefined);
  }

  async findAll(tipo?: string, solucionada?: string) {
    const tipoNormalizado = this.normalizarTipo(tipo);
    const estadoSolucionada = this.normalizarEstadoSolucionada(solucionada);

    const sugerencias = await this.sugerenciaRepository.find({
      where: {
        ...(tipoNormalizado ? { tipoEntidad: tipoNormalizado } : {}),
        ...(estadoSolucionada === undefined ? {} : { solucionada: estadoSolucionada }),
      },
    });

    if (sugerencias.length === 0) {
      return [];
    }

    const idsEvento = [...new Set(sugerencias
      .filter((s) => s.tipoEntidad === tipoEntidad.EVENTO)
      .map((s) => s.entidadId))];
    const idsRutina = [...new Set(sugerencias
      .filter((s) => s.tipoEntidad === tipoEntidad.RUTINA)
      .map((s) => s.entidadId))];
    const idsEjercicio = [...new Set(sugerencias
      .filter((s) => s.tipoEntidad === tipoEntidad.EJERCICIO)
      .map((s) => s.entidadId))];

    const [eventos, rutinas, ejercicios] = await Promise.all([
      idsEvento.length
        ? this.eventoRepository.find({ where: { eventoId: In(idsEvento) }, select: ['eventoId', 'nombre'] })
        : Promise.resolve([]),
      idsRutina.length
        ? this.rutinaDiaRepository.find({ where: { rutinaDiaId: In(idsRutina) }, select: ['rutinaDiaId', 'nombre'] })
        : Promise.resolve([]),
      idsEjercicio.length
        ? this.ejercicioRepository.find({ where: { ejercicioId: In(idsEjercicio) }, select: ['ejercicioId', 'nombre'] })
        : Promise.resolve([]),
    ]);

    const eventosPorId = new Map(eventos.map((evento) => [evento.eventoId, evento.nombre]));
    const rutinasPorId = new Map(rutinas.map((rutina) => [rutina.rutinaDiaId, rutina.nombre]));
    const ejerciciosPorId = new Map(ejercicios.map((ejercicio) => [ejercicio.ejercicioId, ejercicio.nombre]));

    return sugerencias.map((sugerencia) => ({
      sugerenciaId: sugerencia.sugerenciaId,
      tipo: sugerencia.tipoEntidad,
      actividad: this.obtenerNombreActividad(sugerencia, eventosPorId, rutinasPorId, ejerciciosPorId),
      contenido: sugerencia.contenido,
      solucionada: sugerencia.solucionada,
    }));
  }

  private normalizarTipo(tipo?: string): tipoEntidad | undefined {
    if (!tipo) {
      return undefined;
    }

    const tipoNormalizado = tipo.trim().toUpperCase() as tipoEntidad;

    if (!Object.values(tipoEntidad).includes(tipoNormalizado)) {
      throw new BadRequestException('El tipo debe ser EVENTO, RUTINA o EJERCICIO');
    }

    return tipoNormalizado;
  }

  private normalizarEstadoSolucionada(solucionada?: string): boolean | undefined {
    if (solucionada === undefined || solucionada === null || solucionada === '') {
      return undefined;
    }

    const valor = String(solucionada).trim().toLowerCase();
    if (valor === 'true') {
      return true;
    }

    if (valor === 'false') {
      return false;
    }

    throw new BadRequestException('El parámetro solucionada debe ser true o false');
  }

  private obtenerNombreActividad(
    sugerencia: Sugerencia,
    eventosPorId: Map<string, string>,
    rutinasPorId: Map<string, string>,
    ejerciciosPorId: Map<string, string>,
  ): string {
    if (sugerencia.tipoEntidad === tipoEntidad.EVENTO) {
      return eventosPorId.get(sugerencia.entidadId) ?? 'Actividad no encontrada';
    }

    if (sugerencia.tipoEntidad === tipoEntidad.RUTINA) {
      return rutinasPorId.get(sugerencia.entidadId) ?? 'Actividad no encontrada';
    }

    return ejerciciosPorId.get(sugerencia.entidadId) ?? 'Actividad no encontrada';
  }
}
