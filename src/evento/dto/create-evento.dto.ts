import { IsDateString, IsNotEmpty, IsString } from "class-validator";

export class CreateEventoDto {

    @IsString()
    @IsNotEmpty()
    nombre: string;
    
    @IsDateString()
    @IsNotEmpty()
    fechaHora: string;

    @IsString()
    @IsNotEmpty()
    lugar: string;

    @IsString()
    @IsNotEmpty()
    descripcion: string;

}
