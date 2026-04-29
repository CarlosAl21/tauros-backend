import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateRutinaDiaDto {

    @IsNumber()
    @IsNotEmpty()
    numeroDia: number;

    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsNotEmpty()
    descripcion: string;

    @IsString()
    @IsNotEmpty()
    planEntrenamientoId: string;

    @IsOptional()
    @IsNumber()
    descansoSegundos?: number;
}
