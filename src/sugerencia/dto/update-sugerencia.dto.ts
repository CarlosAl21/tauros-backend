import { PartialType } from '@nestjs/mapped-types';
import { CreateSugerenciaDto } from './create-sugerencia.dto';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateSugerenciaDto extends PartialType(CreateSugerenciaDto) {

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    sugerenciaId: string;

    @IsOptional()
    @IsBoolean()
    solucionada?: boolean;
}
