import { Injectable } from '@nestjs/common';
import { CreateSuscripcionUsuarioDto } from './dto/create-suscripcion-usuario.dto';
import { UpdateSuscripcionUsuarioDto } from './dto/update-suscripcion-usuario.dto';

@Injectable()
export class SuscripcionUsuarioService {
  create(createSuscripcionUsuarioDto: CreateSuscripcionUsuarioDto) {
    return 'This action adds a new suscripcionUsuario';
  }

  findAll() {
    return `This action returns all suscripcionUsuario`;
  }

  findOne(id: number) {
    return `This action returns a #${id} suscripcionUsuario`;
  }

  update(id: number, updateSuscripcionUsuarioDto: UpdateSuscripcionUsuarioDto) {
    return `This action updates a #${id} suscripcionUsuario`;
  }

  remove(id: number) {
    return `This action removes a #${id} suscripcionUsuario`;
  }
}
