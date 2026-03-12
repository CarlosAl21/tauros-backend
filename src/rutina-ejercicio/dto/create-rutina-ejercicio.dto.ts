import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateRutinaEjercicioDto {

    @IsNumber()
    orden: number;

    @IsNumber()
    series: number;

    @IsNumber()
    repeticiones: number;

    @IsString()
    carga: string;

    @IsString()
    notasEspecificas: string;

    @IsString()
    @IsNotEmpty()
    rutinaDiaId: string;

    @IsString()
    @IsNotEmpty()
    ejercicioId: string;



}
