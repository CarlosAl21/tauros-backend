import { IsEmail, IsNotEmpty, IsString, MinLength, IsDateString } from 'class-validator';
import { IsEcuadorianId, IsAlphaSpace, IsEcuadorPhone } from '../validators/ecuador-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @IsEcuadorianId({ message: 'Cédula/RUC inválida' })
  cedula: string;

  @IsString()
  @IsNotEmpty()
  @IsAlphaSpace({ message: 'Nombre sólo debe contener letras y espacios' })
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @IsAlphaSpace({ message: 'Apellido sólo debe contener letras y espacios' })
  apellido: string;

  @IsDateString()
  @IsNotEmpty()
  fechaNacimiento: string;

  @IsEmail()
  @IsNotEmpty()
  correo: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  @IsEcuadorPhone({ message: 'Teléfono inválido' })
  telefono: string;
}
