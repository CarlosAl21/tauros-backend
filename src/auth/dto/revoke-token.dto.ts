import { IsOptional, IsString } from 'class-validator';

export class RevokeTokenDto {
  // Opcional: ver comentario en RefreshTokenDto. El frontend web no tiene acceso
  // en JS a su refresh token (cookie httpOnly), así que el controller cae a la
  // cookie `tauros_refresh_token` cuando el body no la trae.
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
