import { PartialType } from '@nestjs/mapped-types';
import { CreateMaquinaDto } from './create-maquina.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateMaquinaDto extends PartialType(CreateMaquinaDto) {

    @IsString()
    @IsNotEmpty()
    maquinaId: string;
}
