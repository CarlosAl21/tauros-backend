import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateEjercicioDto } from './dto/create-ejercicio.dto';
import { UpdateEjercicioDto } from './dto/update-ejercicio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ejercicio } from './entities/ejercicio.entity';
import { Categoria } from 'src/categoria/entities/categoria.entity';
import { Tipo } from 'src/tipo/entities/tipo.entity';
import { Maquina } from 'src/maquina/entities/maquina.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

type EjercicioFiles = {
  linkVideo?: Express.Multer.File[];
  linkAM?: Express.Multer.File[];
};

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

    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    createEjercicioDto: CreateEjercicioDto,
    files?: EjercicioFiles,
  ) {
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

    const linkVideo = await this.resolveMediaLink({
      currentValue: createEjercicioDto.linkVideo,
      file: files?.linkVideo?.[0],
      folder: 'tauros/ejercicios/video',
      required: true,
    });

    const linkAM = await this.resolveMediaLink({
      currentValue: createEjercicioDto.linkAM,
      file: files?.linkAM?.[0],
      folder: 'tauros/ejercicios/archivo',
      required: true,
    });

    const ejercicio = this.ejercicioRepository.create({
      nombre: createEjercicioDto.nombre,
      linkVideo,
      linkAM,
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

  async update(
    id: string,
    updateEjercicioDto: UpdateEjercicioDto,
    files?: EjercicioFiles,
  ) {
    const ejercicio = await this.ejercicioRepository.findOne({
      where: { ejercicioId: id },
    });
    if (!ejercicio) {
      throw new Error('Ejercicio not found');
    }

    const { categoriaId, tipoId, maquinaId } = updateEjercicioDto;
    const linkVideoEntrada = updateEjercicioDto.linkVideo;
    const linkAMEntrada = updateEjercicioDto.linkAM;

    const linkVideoActual = await this.resolveMediaLink({
      currentValue: ejercicio.linkVideo,
      providedValue: linkVideoEntrada,
      file: files?.linkVideo?.[0],
      folder: 'tauros/ejercicios/video',
    });

    const linkAMActual = await this.resolveMediaLink({
      currentValue: ejercicio.linkAM,
      providedValue: linkAMEntrada,
      file: files?.linkAM?.[0],
      folder: 'tauros/ejercicios/archivo',
    });

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

    const camposActualizables = { ...updateEjercicioDto } as Record<string, unknown>;
    delete camposActualizables.categoriaId;
    delete camposActualizables.tipoId;
    delete camposActualizables.maquinaId;
    delete camposActualizables.ejercicioId;
    delete camposActualizables.linkVideo;
    delete camposActualizables.linkAM;

    Object.assign(ejercicio, camposActualizables);
    ejercicio.linkVideo = linkVideoActual;
    ejercicio.linkAM = linkAMActual;

    return this.ejercicioRepository.save(ejercicio);
  }

  async remove(id: string) {
    await this.ejercicioRepository.delete(id);
    return { message: 'Ejercicio removed successfully' };
  }

  private async resolveMediaLink(options: {
    currentValue?: string;
    providedValue?: string;
    file?: Express.Multer.File;
    folder: string;
    required?: boolean;
  }) {
    if (options.file) {
      return this.cloudinaryService.uploadFile(options.file, options.folder);
    }

    if (options.providedValue) {
      return options.providedValue;
    }

    if (options.currentValue) {
      return options.currentValue;
    }

    if (options.required) {
      throw new BadRequestException('Debes enviar un archivo o un enlace válido');
    }

    return options.currentValue;
  }
}
