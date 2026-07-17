import { IsOptional, IsString } from 'class-validator';

export class RefreshTokenDto {
  // Opcional: el móvil lo manda en el body (SecureStore). El frontend web no
  // puede leer su refresh token porque vive en una cookie httpOnly, así que el
  // controller lo toma de la cookie `tauros_refresh_token` cuando no viene acá.
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
