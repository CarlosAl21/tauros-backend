import { IsNotEmpty, IsString } from "class-validator";

export class CreateUsuarioDto {

    @IsString()
    @IsNotEmpty()
    cedula: string;

    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsNotEmpty()
    apellido: string;

    @IsString()
    @IsNotEmpty()
    fechaNacimiento: string;

    @IsString()
    @IsNotEmpty()
    correo: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    telefono: string;
}
