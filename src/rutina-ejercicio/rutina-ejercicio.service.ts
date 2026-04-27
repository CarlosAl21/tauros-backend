import { Injectable } from '@nestjs/common';
import { CreateRutinaEjercicioDto } from './dto/create-rutina-ejercicio.dto';
import { UpdateRutinaEjercicioDto } from './dto/update-rutina-ejercicio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RutinaEjercicio } from './entities/rutina-ejercicio.entity';
import { Repository } from 'typeorm';
import { RutinaDia } from 'src/rutina-dia/entities/rutina-dia.entity';
import { Ejercicio } from 'src/ejercicio/entities/ejercicio.entity';

@Injectable()
export class RutinaEjercicioService {
  
  constructor(
    @InjectRepository(RutinaEjercicio)
    private readonly rutinaEjercicioRepository: Repository<RutinaEjercicio>,

    @InjectRepository(RutinaDia)
    private readonly rutinaDiaRepository: Repository<RutinaDia>,

    @InjectRepository(Ejercicio)
    private readonly ejercicioRepository: Repository<Ejercicio>,
  ) {}

  async create(createRutinaEjercicioDto: CreateRutinaEjercicioDto) {
    const rutionaDia = await this.rutinaDiaRepository.findOne({ where: { rutinaDiaId: createRutinaEjercicioDto.rutinaDiaId } });
    const ejercicio = await this.ejercicioRepository.findOne({ where: { ejercicioId: createRutinaEjercicioDto.ejercicioId } });

    if (!rutionaDia) {
      throw new Error('RutinaDia not found');
    }
    if (!ejercicio) {
      throw new Error('Ejercicio not found');
    }
    
    const rutinaEjercicio = this.rutinaEjercicioRepository.create({
      orden: createRutinaEjercicioDto.orden,
      series: createRutinaEjercicioDto.series,
      repeticiones: createRutinaEjercicioDto.repeticiones,
      carga: createRutinaEjercicioDto.carga,
      notasEspecificas: createRutinaEjercicioDto.notasEspecificas,
      rutinaDia: rutionaDia,
      ejercicio: ejercicio,
    });
    return this.rutinaEjercicioRepository.save(rutinaEjercicio);

  }

  async findAll() {
    return this.rutinaEjercicioRepository.find();
  }

  async findOne(id: string) {
    return this.rutinaEjercicioRepository.findOne({ where: { rutinaEjercicioId: id } });
  }

  async update(id: string, updateRutinaEjercicioDto: UpdateRutinaEjercicioDto) {
    const rutinaEjercicio = await this.rutinaEjercicioRepository.findOne({ where: { rutinaEjercicioId: id } });
    if (!rutinaEjercicio) {
      throw new Error('RutinaEjercicio not found');
    }

    const { rutinaDiaId, ejercicioId, ...campos } = updateRutinaEjercicioDto;

    if (rutinaDiaId) {
      const rutinaDia = await this.rutinaDiaRepository.findOne({ where: { rutinaDiaId } });
      if (!rutinaDia) {
        throw new Error('RutinaDia not found');
      }
      rutinaEjercicio.rutinaDia = rutinaDia;
    }

    if (ejercicioId) {
      const ejercicio = await this.ejercicioRepository.findOne({ where: { ejercicioId } });
      if (!ejercicio) {
        throw new Error('Ejercicio not found');
      }
      rutinaEjercicio.ejercicio = ejercicio;
    }

    Object.assign(rutinaEjercicio, campos);

    return this.rutinaEjercicioRepository.save(rutinaEjercicio);
  }

  async remove(id: string) {
    return this.rutinaEjercicioRepository.delete(id);
  }

  async marcarCompletada(id: string) {
    const rutinaEjercicio = await this.rutinaEjercicioRepository.findOne({ where: { rutinaEjercicioId: id } });
    if (!rutinaEjercicio) {
      throw new Error('RutinaEjercicio not found');
    }

    rutinaEjercicio.completada = !rutinaEjercicio.completada;
    rutinaEjercicio.fechaCompletada = rutinaEjercicio.completada ? new Date() : null;

    return this.rutinaEjercicioRepository.save(rutinaEjercicio);
  }
}
