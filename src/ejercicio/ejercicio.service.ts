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

    const savedEjercicio = await this.ejercicioRepository.save(ejercicio);
    return this.findOne(savedEjercicio.ejercicioId);
  }

  async findAll() {
    const ejercicios = await this.ejercicioRepository
      .createQueryBuilder('ejercicio')
      .leftJoinAndSelect('ejercicio.categoria', 'categoria')
      .leftJoinAndSelect('ejercicio.tipo', 'tipo')
      .leftJoinAndSelect('ejercicio.maquina', 'maquina')
      .where('ejercicio.isActive IS DISTINCT FROM false')
      .getMany();

    return ejercicios.map((ejercicio) => this.toResponse(ejercicio));
  }

  async findOne(id: string) {
    const ejercicio = await this.ejercicioRepository
      .createQueryBuilder('ejercicio')
      .leftJoinAndSelect('ejercicio.categoria', 'categoria')
      .leftJoinAndSelect('ejercicio.tipo', 'tipo')
      .leftJoinAndSelect('ejercicio.maquina', 'maquina')
      .where('ejercicio.ejercicioId = :id', { id })
      .getOne();

    return ejercicio ? this.toResponse(ejercicio) : null;
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

    const savedEjercicio = await this.ejercicioRepository.save(ejercicio);
    return this.findOne(savedEjercicio.ejercicioId);
  }

  async remove(id: string) {
    const ejercicio = await this.ejercicioRepository.findOne({ where: { ejercicioId: id } });
    if (!ejercicio) {
      throw new Error('Ejercicio not found');
    }

    ejercicio.isActive = false;
    await this.ejercicioRepository.save(ejercicio);
    return { message: 'Ejercicio desactivado' };
  }

  async activate(id: string) {
    const ejercicio = await this.ejercicioRepository.findOne({ where: { ejercicioId: id } });
    if (!ejercicio) {
      throw new Error('Ejercicio not found');
    }

    ejercicio.isActive = true;
    await this.ejercicioRepository.save(ejercicio);
    return { message: 'Ejercicio activado' };
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

  private toResponse(ejercicio: Ejercicio) {
    return {
      ejercicioId: ejercicio.ejercicioId,
      nombre: ejercicio.nombre,
      linkVideo: ejercicio.linkVideo,
      linkAM: ejercicio.linkAM,
      categoria: ejercicio.categoria
        ? {
            categoriaId: ejercicio.categoria.categoriaId,
            nombre: ejercicio.categoria.nombre,
          }
        : null,
      tipo: ejercicio.tipo
        ? {
            tipoId: ejercicio.tipo.tipoId,
            nombre: ejercicio.tipo.nombre,
          }
        : null,
      maquina: ejercicio.maquina
        ? {
            maquinaId: ejercicio.maquina.maquinaId,
            nombre: ejercicio.maquina.nombre,
            numeroMaquina: ejercicio.maquina.numeroMaquina,
            linkFoto: ejercicio.maquina.linkFoto,
          }
        : null,
      isActive: ejercicio.isActive !== false,
    };
  }
}
