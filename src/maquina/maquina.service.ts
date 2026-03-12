import { Injectable } from '@nestjs/common';
import { CreateMaquinaDto } from './dto/create-maquina.dto';
import { UpdateMaquinaDto } from './dto/update-maquina.dto';

@Injectable()
export class MaquinaService {
  create(createMaquinaDto: CreateMaquinaDto) {
    return 'This action adds a new maquina';
  }

  findAll() {
    return `This action returns all maquina`;
  }

  findOne(id: number) {
    return `This action returns a #${id} maquina`;
  }

  update(id: number, updateMaquinaDto: UpdateMaquinaDto) {
    return `This action updates a #${id} maquina`;
  }

  remove(id: number) {
    return `This action removes a #${id} maquina`;
  }
}
