import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreatePlanEntrenamientoDto {

    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsNotEmpty()
    descripcion: string;

    @IsNumber()
    @IsNotEmpty()
    duracionDias: number;

    @IsString()
    @IsNotEmpty()
    objetivo: string;

    @IsString()
    @IsOptional()
    usuarioId: string;
}
