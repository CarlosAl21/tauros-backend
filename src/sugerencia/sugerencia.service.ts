import { Injectable } from '@nestjs/common';
import { CreateSugerenciaDto } from './dto/create-sugerencia.dto';
import { UpdateSugerenciaDto } from './dto/update-sugerencia.dto';

@Injectable()
export class SugerenciaService {
  create(createSugerenciaDto: CreateSugerenciaDto) {
    return 'This action adds a new sugerencia';
  }

  findAll() {
    return `This action returns all sugerencia`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sugerencia`;
  }

  update(id: number, updateSugerenciaDto: UpdateSugerenciaDto) {
    return `This action updates a #${id} sugerencia`;
  }

  remove(id: number) {
    return `This action removes a #${id} sugerencia`;
  }
}
