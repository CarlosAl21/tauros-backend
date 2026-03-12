import { PartialType } from '@nestjs/mapped-types';
import { CreateSuscripcionUsuarioDto } from './create-suscripcion-usuario.dto';

export class UpdateSuscripcionUsuarioDto extends PartialType(CreateSuscripcionUsuarioDto) {}
