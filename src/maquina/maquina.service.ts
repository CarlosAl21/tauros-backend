import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMaquinaDto } from './dto/create-maquina.dto';
import { UpdateMaquinaDto } from './dto/update-maquina.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Maquina } from './entities/maquina.entity';
import { Repository } from 'typeorm';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

type MulterFile = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  destination?: string;
  filename?: string;
  path?: string;
};

@Injectable()
export class MaquinaService {

  constructor(
    @InjectRepository(Maquina)
    private readonly maquinaRepository: Repository<Maquina>,

    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createMaquinaDto: CreateMaquinaDto, file?: MulterFile) {
    const linkFoto = await this.resolveLinkFoto({
      currentValue: createMaquinaDto.linkFoto,
      file,
      required: true,
    });

    const maquina = this.maquinaRepository.create({
      nombre: createMaquinaDto.nombre,
      numeroMaquina: createMaquinaDto.numeroMaquina,
      linkFoto,
    });
    maquina.linkFoto = linkFoto;
    return this.maquinaRepository.save(maquina);
  }

  async findAll() {
    return this.maquinaRepository.find();
  }

  async findOne(id: string) {
    return this.maquinaRepository.findOne({ where: { maquinaId: id} });
  } 

  async update(
    id: string,
    updateMaquinaDto: UpdateMaquinaDto,
    file?: MulterFile,
  ) {
    const maquina = await this.maquinaRepository.findOne({
      where: { maquinaId: id },
    });

    if (!maquina) {
      throw new Error('Maquina not found');
    }

    const linkFoto = await this.resolveLinkFoto({
      currentValue: maquina.linkFoto,
      providedValue: updateMaquinaDto.linkFoto,
      file,
    });

    const camposActualizables = { ...updateMaquinaDto } as Record<string, unknown>;
    delete camposActualizables.maquinaId;
    delete camposActualizables.linkFoto;

    Object.assign(maquina, camposActualizables);
    maquina.linkFoto = linkFoto;

    await this.maquinaRepository.save(maquina);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.maquinaRepository.delete({ maquinaId: id });
    return `This action removes a #${id} maquina`;
  }

  private async resolveLinkFoto(options: {
    currentValue?: string;
    providedValue?: string;
    file?: MulterFile;
    required?: boolean;
  }) {
    if (options.file) {
      return this.cloudinaryService.uploadFile(options.file, 'tauros/maquinas');
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
