import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, Min, IsString } from 'class-validator';

export class CreatePlanEntrenamientoDto {

    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsNotEmpty()
    descripcion: string;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    duracionDias: number;

    @IsString()
    @IsNotEmpty()
    objetivo: string;

    @IsString()
    @IsOptional()
    usuarioId: string;
}
