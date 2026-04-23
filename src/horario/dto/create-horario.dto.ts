import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from 'class-transformer';

class HorarioPorDiaDto {
    @IsString()
    @IsNotEmpty()
    diaSemana: string;

    @IsString()
    @IsNotEmpty()
    apertura: string;

    @IsString()
    @IsNotEmpty()
    cierre: string;
}

export class CreateHorarioDto {
    
    @IsOptional()
    @IsString()
    apertura: string;

    @IsOptional()
    @IsString()
    cierre: string;

    @IsOptional()
    @IsString()
    diasSemanales: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    diasSeleccionados?: string[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => HorarioPorDiaDto)
    horariosPorDia?: HorarioPorDiaDto[];
}
