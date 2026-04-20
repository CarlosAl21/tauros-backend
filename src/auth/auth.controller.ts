import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

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
    return {
      userId: req.user.userId,
      username: req.user.username,
      rol: req.user.rol,
    };
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
}
