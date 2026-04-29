import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../usuario/entities/usuario.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Verificar si el usuario ya existe
    const existingUserByEmail = await this.usuarioRepository.findOne({
      where: { correo: registerDto.correo },
    });

    if (existingUserByEmail) {
      throw new ConflictException('El correo ya está registrado');
    }

    const existingUserByCedula = await this.usuarioRepository.findOne({
      where: { cedula: registerDto.cedula },
    });

    if (existingUserByCedula) {
      throw new ConflictException('La cédula ya está registrada');
    }

    // Crear nuevo usuario
    const usuario = this.usuarioRepository.create({
      ...registerDto,
      fechaNacimiento: new Date(registerDto.fechaNacimiento),
    });

    await this.usuarioRepository.save(usuario);

    // Generar token
    const payload = {
      sub: usuario.userId,
      email: usuario.correo,
      rol: usuario.rol,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        userId: usuario.userId,
        correo: usuario.correo,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: usuario.rol,
      },
    };
  }

  async login(loginDto: LoginDto) {
    // Buscar usuario por correo
    const usuario = await this.usuarioRepository.findOne({
      where: { correo: loginDto.correo },
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await usuario.comparePassword(loginDto.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar token
    const payload = {
      sub: usuario.userId,
      email: usuario.correo,
      rol: usuario.rol,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        userId: usuario.userId,
        correo: usuario.correo,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: usuario.rol,
      },
    };
  }

  async validateUser(userId: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: { userId },
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return usuario;
  }

  async getProfile(userId: string) {
    const usuario = await this.validateUser(userId);

    return {
      userId: usuario.userId,
      correo: usuario.correo,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      rol: usuario.rol,
    };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const usuario = await this.validateUser(userId);

    if (updateProfileDto.correo && updateProfileDto.correo !== usuario.correo) {
      const existing = await this.usuarioRepository.findOne({ where: { correo: updateProfileDto.correo } });
      if (existing && existing.userId !== userId) {
        throw new ConflictException('El correo ya está registrado');
      }
      usuario.correo = updateProfileDto.correo;
    }

    if (updateProfileDto.nombre !== undefined) {
      usuario.nombre = updateProfileDto.nombre;
    }

    if (updateProfileDto.apellido !== undefined) {
      usuario.apellido = updateProfileDto.apellido;
    }

    await this.usuarioRepository.save(usuario);

    return this.getProfile(userId);
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const usuario = await this.validateUser(userId);
    const isCurrentValid = await usuario.comparePassword(changePasswordDto.currentPassword);

    if (!isCurrentValid) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    usuario.password = changePasswordDto.newPassword;
    await this.usuarioRepository.save(usuario);

    return { changed: true };
  }
}
