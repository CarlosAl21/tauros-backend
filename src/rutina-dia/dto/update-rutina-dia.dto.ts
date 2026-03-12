import { PartialType } from '@nestjs/mapped-types';
import { CreateRutinaDiaDto } from './create-rutina-dia.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateRutinaDiaDto extends PartialType(CreateRutinaDiaDto) {

    @IsString()
    @IsNotEmpty()
    planEntrenamientoId: string;
}
