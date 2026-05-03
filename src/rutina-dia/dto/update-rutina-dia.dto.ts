import { PartialType } from '@nestjs/mapped-types';
import { CreateRutinaDiaDto } from './create-rutina-dia.dto';

export class UpdateRutinaDiaDto extends PartialType(CreateRutinaDiaDto) {
}
