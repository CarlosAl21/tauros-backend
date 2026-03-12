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

  async create(createHorarioDto: CreateHorarioDto) {
    const horario = this.horarioRepository.create(createHorarioDto);
    return this.horarioRepository.save(horario);
  }

  async findAll() {
    return this.horarioRepository.find();
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
