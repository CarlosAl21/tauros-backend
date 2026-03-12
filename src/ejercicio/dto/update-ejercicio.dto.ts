import { PartialType } from '@nestjs/mapped-types';
import { CreateEjercicioDto } from './create-ejercicio.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateEjercicioDto extends PartialType(CreateEjercicioDto) {

    @IsString()
    @IsNotEmpty()
    ejercicioId: string;
}
