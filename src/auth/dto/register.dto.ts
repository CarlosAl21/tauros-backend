import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsDateString } from 'class-validator';
import { IsEcuadorianId, IsAlphaSpace, IsEcuadorPhone } from '../validators/ecuador-validator';

export class RegisterDto {
  // Opcional: guideline 5.1.1(v) de Apple prohibe exigir datos no esenciales
  // para el registro. Si el admin del gym necesita cedula/telefono/fecha de
  // nacimiento para asignar rutinas, los completa despues desde el panel web.
  @IsOptional()
  @IsString()
  @IsEcuadorianId({ message: 'Cédula/RUC inválida' })
  cedula?: string;

  @IsString()
  @IsNotEmpty()
  @IsAlphaSpace({ message: 'Nombre sólo debe contener letras y espacios' })
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @IsAlphaSpace({ message: 'Apellido sólo debe contener letras y espacios' })
  apellido: string;

  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @IsEmail()
  @IsNotEmpty()
  correo: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  @IsEcuadorPhone({ message: 'Teléfono inválido' })
  telefono?: string;
}
