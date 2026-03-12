import { PartialType } from '@nestjs/mapped-types';
import { CreateSugerenciaDto } from './create-sugerencia.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateSugerenciaDto extends PartialType(CreateSugerenciaDto) {

    @IsString()
    @IsNotEmpty()
    sugerenciaId: string;
}
