import { Injectable } from '@nestjs/common';
import { CreateEjercicioDto } from './dto/create-ejercicio.dto';
import { UpdateEjercicioDto } from './dto/update-ejercicio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ejercicio } from './entities/ejercicio.entity';
import { Categoria } from 'src/categoria/entities/categoria.entity';
import { Tipo } from 'src/tipo/entities/tipo.entity';
import { Maquina } from 'src/maquina/entities/maquina.entity';

@Injectable()
export class EjercicioService {
  constructor(
    @InjectRepository(Ejercicio)
    private readonly ejercicioRepository: Repository<Ejercicio>,

    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,

    @InjectRepository(Tipo)
    private readonly tipoRepository: Repository<Tipo>,

    @InjectRepository(Maquina)
    private readonly maquinaRepository: Repository<Maquina>,
  ) {}

  async create(createEjercicioDto: CreateEjercicioDto) {
    const categoria = await this.categoriaRepository.findOne({
      where: { categoriaId: createEjercicioDto.categoriaId },
    });
    const tipo = await this.tipoRepository.findOne({
      where: { tipoId: createEjercicioDto.tipoId },
    });
    let maquina: Maquina | null = null;

    if (createEjercicioDto.maquinaId) {
      maquina = await this.maquinaRepository.findOne({
        where: { maquinaId: createEjercicioDto.maquinaId },
      });
      if (!maquina) {
        throw new Error('Maquina not found');
      }
    }
    if (!categoria) {
      throw new Error('Categoria not found');
    }
    if (!tipo) {
      throw new Error('Tipo not found');
    }

    const ejercicio = this.ejercicioRepository.create({
      ...createEjercicioDto,
      categoria,
      tipo,
      maquina,
    });

    return this.ejercicioRepository.save(ejercicio);
  }

  async findAll() {
    return this.ejercicioRepository.find();
  }

  async findOne(id: string) {
    return this.ejercicioRepository.findOne({ where: { ejercicioId: id } });
  }

  async update(id: string, updateEjercicioDto: UpdateEjercicioDto) {
    const ejercicio = await this.ejercicioRepository.findOne({
      where: { ejercicioId: id },
    });
    if (!ejercicio) {
      throw new Error('Ejercicio not found');
    }

    const { categoriaId, tipoId, maquinaId, ejercicioId, ...campos } =
      updateEjercicioDto;

    if (categoriaId) {
      const categoria = await this.categoriaRepository.findOne({
        where: { categoriaId },
      });
      if (!categoria) {
        throw new Error('Categoria not found');
      }
      ejercicio.categoria = categoria;
    }

    if (tipoId) {
      const tipo = await this.tipoRepository.findOne({ where: { tipoId } });
      if (!tipo) {
        throw new Error('Tipo not found');
      }
      ejercicio.tipo = tipo;
    }

    if (maquinaId !== undefined) {
      if (maquinaId === null) {
        ejercicio.maquina = null;
      } else {
        const maquina = await this.maquinaRepository.findOne({
          where: { maquinaId },
        });
        if (!maquina) {
          throw new Error('Maquina not found');
        }
        ejercicio.maquina = maquina;
      }
    }

    Object.assign(ejercicio, campos);

    return this.ejercicioRepository.save(ejercicio);
  }

  async remove(id: string) {
    await this.ejercicioRepository.delete(id);
    return { message: 'Ejercicio removed successfully' };
  }
}
