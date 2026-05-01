import { IsNotEmpty, IsNumber, IsString, IsOptional, IsArray } from "class-validator";

export class CreateRutinaEjercicioDto {

    @IsNumber()
    orden: number;

    @IsNumber()
    series: number;

    @IsOptional()
    @IsNumber()
    repeticiones?: number;

    @IsOptional()
    @IsNumber()
    tiempoSegundos?: number;

    @IsString()
    carga: string;

    @IsString()
    notasEspecificas: string;

    @IsOptional()
    @IsNumber()
    descansoSegundos?: number;

    @IsString()
    @IsNotEmpty()
    rutinaDiaId: string;

    @IsString()
    @IsNotEmpty()
    ejercicioId: string;

    @IsOptional()
    @IsArray()
    calentamientos?: CreateCalentamientoDto[];
}

export class CreateCalentamientoDto {

    @IsNumber()
    orden: number;

    @IsOptional()
    @IsNumber()
    duracionSegundos?: number;

    @IsOptional()
    @IsNumber()
    repeticiones?: number;

    @IsOptional()
    @IsString()
    intensidad?: string;
}
