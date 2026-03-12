import { PartialType } from '@nestjs/mapped-types';
import { CreateRutinaEjercicioDto } from './create-rutina-ejercicio.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateRutinaEjercicioDto extends PartialType(CreateRutinaEjercicioDto) {

    @IsString()
    @IsNotEmpty()
    rutinaEjercicioId: string;
}
