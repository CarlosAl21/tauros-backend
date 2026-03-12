import { Injectable } from '@nestjs/common';
import { CreateComposicionCorporalDto } from './dto/create-composicion-corporal.dto';
import { UpdateComposicionCorporalDto } from './dto/update-composicion-corporal.dto';

@Injectable()
export class ComposicionCorporalService {
  create(createComposicionCorporalDto: CreateComposicionCorporalDto) {
    return 'This action adds a new composicionCorporal';
  }

  findAll() {
    return `This action returns all composicionCorporal`;
  }

  findOne(id: number) {
    return `This action returns a #${id} composicionCorporal`;
  }

  update(id: number, updateComposicionCorporalDto: UpdateComposicionCorporalDto) {
    return `This action updates a #${id} composicionCorporal`;
  }

  remove(id: number) {
    return `This action removes a #${id} composicionCorporal`;
  }
}
