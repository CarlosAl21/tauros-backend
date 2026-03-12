import { Injectable } from '@nestjs/common';
import { CreateTipoDto } from './dto/create-tipo.dto';
import { UpdateTipoDto } from './dto/update-tipo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tipo } from './entities/tipo.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TipoService {
  constructor(
    @InjectRepository(Tipo) 
    private readonly tipoRepository: Repository<Tipo>,
  ) {}
  
  async create(createTipoDto: CreateTipoDto) {
    const tipo = this.tipoRepository.create(createTipoDto);
    return this.tipoRepository.save(tipo);
  }

  async findAll() {
    return this.tipoRepository.find();
  }

  async findOne(id: string) {
    return this.tipoRepository.findOneBy({ tipoId: id });
  }

  async update(id: string, updateTipoDto: UpdateTipoDto) {
    await this.tipoRepository.update(id, updateTipoDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const tipo = await this.tipoRepository.findOneBy({ tipoId: id });
    return this.tipoRepository.remove(tipo);
  }
}
