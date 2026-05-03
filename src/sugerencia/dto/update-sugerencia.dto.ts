import { PartialType } from '@nestjs/mapped-types';
import { CreateSugerenciaDto } from './create-sugerencia.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateSugerenciaDto extends PartialType(CreateSugerenciaDto) {
    @IsOptional()
    @IsBoolean()
    solucionada?: boolean;
}
