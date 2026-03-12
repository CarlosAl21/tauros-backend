import { Injectable } from '@nestjs/common';
import { CreateMaquinaDto } from './dto/create-maquina.dto';
import { UpdateMaquinaDto } from './dto/update-maquina.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Maquina } from './entities/maquina.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MaquinaService {

  constructor(
    @InjectRepository(Maquina)
    private readonly maquinaRepository: Repository<Maquina>,
  ) {}

  async create(createMaquinaDto: CreateMaquinaDto) {
    const maquina = this.maquinaRepository.create(createMaquinaDto);
    return this.maquinaRepository.save(maquina);
  }

  async findAll() {
    return this.maquinaRepository.find();
  }

  async findOne(id: string) {
    return this.maquinaRepository.findOne({ where: { maquinaId: id} });
  } 

  async update(id: string, updateMaquinaDto: UpdateMaquinaDto) {
    await this.maquinaRepository.update({ maquinaId: id }, updateMaquinaDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.maquinaRepository.delete({ maquinaId: id });
    return `This action removes a #${id} maquina`;
  }
}
