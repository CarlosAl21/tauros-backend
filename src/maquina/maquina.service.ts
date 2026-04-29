import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMaquinaDto } from './dto/create-maquina.dto';
import { UpdateMaquinaDto } from './dto/update-maquina.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Maquina } from './entities/maquina.entity';
import { Repository } from 'typeorm';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import 'multer';

@Injectable()
export class MaquinaService {

  constructor(
    @InjectRepository(Maquina)
    private readonly maquinaRepository: Repository<Maquina>,

    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createMaquinaDto: CreateMaquinaDto, file?: Express.Multer.File) {
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
    const maquinas = await this.maquinaRepository.createQueryBuilder('maquina')
      .where('maquina.isActive IS DISTINCT FROM false')
      .getMany();

    return maquinas.map((m) => ({
      maquinaId: m.maquinaId,
      nombre: m.nombre,
      linkFoto: m.linkFoto,
      numeroMaquina: m.numeroMaquina,
      isActive: m.isActive !== false,
    }));
  }

  async findOne(id: string) {
    return this.maquinaRepository.findOne({ where: { maquinaId: id} });
  } 

  async update(
    id: string,
    updateMaquinaDto: UpdateMaquinaDto,
    file?: Express.Multer.File,
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
    const maquina = await this.maquinaRepository.findOne({ where: { maquinaId: id } });
    if (!maquina) {
      throw new Error('Maquina not found');
    }

    maquina.isActive = false;
    await this.maquinaRepository.save(maquina);
    return `Maquina desactivada`;
  }

  async activate(id: string) {
    const maquina = await this.maquinaRepository.findOne({ where: { maquinaId: id } });
    if (!maquina) {
      throw new Error('Maquina not found');
    }

    maquina.isActive = true;
    await this.maquinaRepository.save(maquina);
    return `Maquina activada`;
  }

  private async resolveLinkFoto(options: {
    currentValue?: string;
    providedValue?: string;
    file?: Express.Multer.File;
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
