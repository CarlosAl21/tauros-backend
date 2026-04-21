import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Rol } from '../entities/usuario.entity';

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

    @IsOptional()
    @IsEnum(Rol)
    rol?: Rol;
}
