import { IsEmail, IsOptional, IsString } from 'class-validator';
import { IsAlphaSpace } from '../validators/ecuador-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @IsAlphaSpace({ message: 'Nombre sólo debe contener letras y espacios' })
  nombre?: string;

  @IsOptional()
  @IsString()
  @IsAlphaSpace({ message: 'Apellido sólo debe contener letras y espacios' })
  apellido?: string;

  @IsOptional()
  @IsEmail()
  correo?: string;
}
