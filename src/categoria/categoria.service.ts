import { Injectable } from '@nestjs/common';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Categoria } from './entities/categoria.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriaService {

  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
  ) {}

  async create(createCategoriaDto: CreateCategoriaDto) {
    await this.categoriaRepository.create(createCategoriaDto);
    return this.categoriaRepository.save(createCategoriaDto);
  }

  async findAll() {
    return await this.categoriaRepository.find();
  }

  async findOne(id: string) {
    return await this.categoriaRepository.findOneBy({ categoriaId: id });
  }

  async update(id: string, updateCategoriaDto: UpdateCategoriaDto) {
    await this.categoriaRepository.update({ categoriaId: id }, updateCategoriaDto);
    return this.categoriaRepository.findOneBy({ categoriaId: id });
  }

  async remove(id: string) {
    return await this.categoriaRepository.delete({ categoriaId: id });
  }
}
