import { Injectable } from '@nestjs/common';
import { CreateRutinaDiaDto } from './dto/create-rutina-dia.dto';
import { UpdateRutinaDiaDto } from './dto/update-rutina-dia.dto';

@Injectable()
export class RutinaDiaService {
  create(createRutinaDiaDto: CreateRutinaDiaDto) {
    return 'This action adds a new rutinaDia';
  }

  findAll() {
    return `This action returns all rutinaDia`;
  }

  findOne(id: number) {
    return `This action returns a #${id} rutinaDia`;
  }

  update(id: number, updateRutinaDiaDto: UpdateRutinaDiaDto) {
    return `This action updates a #${id} rutinaDia`;
  }

  remove(id: number) {
    return `This action removes a #${id} rutinaDia`;
  }
}
