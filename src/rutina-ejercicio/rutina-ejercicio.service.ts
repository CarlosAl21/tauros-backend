import { Injectable } from '@nestjs/common';
import { CreateRutinaEjercicioDto } from './dto/create-rutina-ejercicio.dto';
import { UpdateRutinaEjercicioDto } from './dto/update-rutina-ejercicio.dto';

@Injectable()
export class RutinaEjercicioService {
  create(createRutinaEjercicioDto: CreateRutinaEjercicioDto) {
    return 'This action adds a new rutinaEjercicio';
  }

  findAll() {
    return `This action returns all rutinaEjercicio`;
  }

  findOne(id: number) {
    return `This action returns a #${id} rutinaEjercicio`;
  }

  update(id: number, updateRutinaEjercicioDto: UpdateRutinaEjercicioDto) {
    return `This action updates a #${id} rutinaEjercicio`;
  }

  remove(id: number) {
    return `This action removes a #${id} rutinaEjercicio`;
  }
}
