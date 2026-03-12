import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateMaquinaDto {

    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsNotEmpty()
    linkFoto: string;

    @IsNumber()
    @IsNotEmpty()
    numeroMaquina: number;
    
}
