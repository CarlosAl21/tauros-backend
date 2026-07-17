import { Controller, Post, Body, Get, UseGuards, Request, Patch, Delete, HttpCode, HttpStatus, Res, Req, BadRequestException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Response, Request as ExpressRequest } from 'express';
import * as crypto from 'crypto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RevokeTokenDto } from './dto/revoke-token.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { TwoFactorSendDto } from './dto/two-factor-send.dto';
import { TwoFactorVerifyDto } from './dto/two-factor-verify.dto';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  CSRF_COOKIE,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  csrfCookieOptions,
  forClearing,
} from './auth.cookies';

// Login/registro/refresh son blanco típico de fuerza bruta: límite más estricto
// que el global (100 req / 60s) definido en AppModule.
const AUTH_THROTTLE = { default: { limit: 10, ttl: 60000 } };

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Setea las 3 cookies de auth para el frontend web (httpOnly access/refresh +
   * csrf legible por JS). El móvil ignora estas cookies por completo y sigue
   * usando el `access_token`/`refresh_token` del body con SecureStore.
   */
  private setAuthCookies(response: Response, accessToken: string, refreshToken: string) {
    const csrfToken = crypto.randomBytes(32).toString('hex');
    response.cookie(ACCESS_TOKEN_COOKIE, accessToken, accessTokenCookieOptions());
    response.cookie(REFRESH_TOKEN_COOKIE, refreshToken, refreshTokenCookieOptions());
    response.cookie(CSRF_COOKIE, csrfToken, csrfCookieOptions());
  }

  private clearAuthCookies(response: Response) {
    response.clearCookie(ACCESS_TOKEN_COOKIE, forClearing(accessTokenCookieOptions()));
    response.clearCookie(REFRESH_TOKEN_COOKIE, forClearing(refreshTokenCookieOptions()));
    response.clearCookie(CSRF_COOKIE, forClearing(csrfCookieOptions()));
  }

  @Post('register')
  @Throttle(AUTH_THROTTLE)
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.register(registerDto);
    this.setAuthCookies(response, result.access_token, result.refresh_token);
    return result;
  }

  @Post('login')
  @Throttle(AUTH_THROTTLE)
  @ApiOperation({ summary: 'Iniciar sesion y obtener JWT' })
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.login(loginDto);
    if ('access_token' in result) {
      this.setAuthCookies(response, result.access_token, result.refresh_token);
    }
    return result;
  }

  @Get('profile')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.userId);
  }

  @Patch('profile')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Actualizar datos del usuario autenticado' })
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.authService.updateProfile(req.user.userId, updateProfileDto);
  }

  @Delete('account')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Eliminar (anonimizar) la cuenta del usuario autenticado' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAccount(@Request() req) {
    await this.authService.deleteOwnAccount(req.user.userId);
  }

  @Patch('change-password')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Cambiar contraseña del usuario autenticado' })
  @UseGuards(JwtAuthGuard)
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.userId, changePasswordDto);
  }

  @Get('validate')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Validar token JWT actual' })
  @UseGuards(JwtAuthGuard)
  async validateToken(@Request() req) {
    return {
      valid: true,
      user: req.user,
    };
  }

  @Post('refresh')
  @Throttle(AUTH_THROTTLE)
  @ApiOperation({ summary: 'Intercambiar refresh token por access token' })
  async refresh(
    @Body() body: RefreshTokenDto,
    @Req() request: ExpressRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    // El móvil manda el refresh token en el body (SecureStore). El frontend web
    // no puede leerlo en JS porque vive en la cookie httpOnly `tauros_refresh_token`,
    // así que caemos a la cookie cuando el body no lo trae.
    const refreshToken = body.refreshToken ?? request.cookies?.[REFRESH_TOKEN_COOKIE];
    if (!refreshToken) {
      throw new BadRequestException('Refresh token no encontrado');
    }

    const result = await this.authService.rotateRefreshToken(refreshToken);
    this.setAuthCookies(response, result.accessToken, result.refreshToken);

    return {
      access_token: result.accessToken,
      refresh_token: result.refreshToken,
    };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Revocar refresh token (logout)' })
  async logout(
    @Body() body: RevokeTokenDto,
    @Req() request: ExpressRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = body.refreshToken ?? request.cookies?.[REFRESH_TOKEN_COOKIE];

    this.clearAuthCookies(response);

    if (!refreshToken) {
      return { revoked: true };
    }

    return this.authService.revokeRefreshToken(refreshToken);
  }

  @Post('2fa/enable')
  @Throttle(AUTH_THROTTLE)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Solicitar código para activar 2FA por correo' })
  @UseGuards(JwtAuthGuard)
  async enableTwoFactor(@Request() req) {
    return this.authService.enableTwoFactor(req.user.userId);
  }

  @Post('2fa/send')
  @Throttle(AUTH_THROTTLE)
  @ApiOperation({ summary: 'Reenviar código 2FA' })
  async resendTwoFactor(@Body() body: TwoFactorSendDto) {
    return this.authService.resendTwoFactorCode(body);
  }

  @Post('2fa/verify')
  @Throttle(AUTH_THROTTLE)
  @ApiOperation({ summary: 'Verificar código 2FA para login o activación' })
  async verifyTwoFactor(@Body() body: TwoFactorVerifyDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.verifyTwoFactor(body);
    if ('access_token' in result) {
      this.setAuthCookies(response, result.access_token, result.refresh_token);
    }
    return result;
  }
}
