import { Injectable } from '@nestjs/common';
import { CreateSugerenciaDto } from './dto/create-sugerencia.dto';
import { UpdateSugerenciaDto } from './dto/update-sugerencia.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Sugerencia } from './entities/sugerencia.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SugerenciaService {

  constructor(
    @InjectRepository(Sugerencia) 
    private readonly sugerenciaRepository: Repository<Sugerencia>,
  ) {}

  async create(createSugerenciaDto: CreateSugerenciaDto) {
    const sugerencia = this.sugerenciaRepository.create(createSugerenciaDto);
    return this.sugerenciaRepository.save(sugerencia);
  }

  async findAll() {
    return this.sugerenciaRepository.find();
  }

  async findOne(id: string) {
    return this.sugerenciaRepository.findOne({ where: { sugerenciaId: id } });
  }

  async update(id: string, updateSugerenciaDto: UpdateSugerenciaDto) {
    await this.sugerenciaRepository.update({ sugerenciaId: id }, updateSugerenciaDto);
    return this.findOne(id);  
  }

  async remove(id: string) {
    await this.sugerenciaRepository.delete({ sugerenciaId: id });
    return `This action removes a #${id} sugerencia`;
  }
}
