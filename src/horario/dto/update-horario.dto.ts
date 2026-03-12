import { PartialType } from '@nestjs/mapped-types';
import { CreateHorarioDto } from './create-horario.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateHorarioDto extends PartialType(CreateHorarioDto) {

    @IsString()
    @IsNotEmpty()
    horarioId: string;
}
