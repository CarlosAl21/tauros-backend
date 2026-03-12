import { PartialType } from '@nestjs/mapped-types';
import { CreateSugerenciaDto } from './create-sugerencia.dto';

export class UpdateSugerenciaDto extends PartialType(CreateSugerenciaDto) {}
