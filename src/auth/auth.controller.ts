import { Controller, Post, Body, Get, UseGuards, Request, Patch } from '@nestjs/common';
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

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesion y obtener JWT' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
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
  @ApiOperation({ summary: 'Intercambiar refresh token por access token' })
  async refresh(@Body() body: RefreshTokenDto) {
    const result = await this.authService.rotateRefreshToken(body.refreshToken);
    return {
      access_token: result.accessToken,
      refresh_token: result.refreshToken,
    };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Revocar refresh token (logout)' })
  async logout(@Body() body: RevokeTokenDto) {
    return this.authService.revokeRefreshToken(body.refreshToken);
  }

  @Post('2fa/enable')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Solicitar código para activar 2FA por correo' })
  @UseGuards(JwtAuthGuard)
  async enableTwoFactor(@Request() req) {
    return this.authService.enableTwoFactor(req.user.userId);
  }

  @Post('2fa/send')
  @ApiOperation({ summary: 'Reenviar código 2FA' })
  async resendTwoFactor(@Body() body: TwoFactorSendDto) {
    return this.authService.resendTwoFactorCode(body);
  }

  @Post('2fa/verify')
  @ApiOperation({ summary: 'Verificar código 2FA para login o activación' })
  async verifyTwoFactor(@Body() body: TwoFactorVerifyDto) {
    return this.authService.verifyTwoFactor(body);
  }
}
