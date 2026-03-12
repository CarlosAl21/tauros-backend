import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoDto } from './create-tipo.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateTipoDto extends PartialType(CreateTipoDto) {
    @IsString()
    @IsNotEmpty()
    tipoId: string;
}
