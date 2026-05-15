import { Injectable, UnauthorizedException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../usuario/entities/usuario.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RefreshToken } from './entities/refresh-token.entity';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { TwoFactorChallenge, TwoFactorPurpose } from './entities/two-factor-challenge.entity';
import { TwoFactorSendDto } from './dto/two-factor-send.dto';
import { TwoFactorVerifyDto } from './dto/two-factor-verify.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    private jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private refreshRepo: Repository<RefreshToken>,
    @InjectRepository(TwoFactorChallenge)
    private twoFactorRepo: Repository<TwoFactorChallenge>,
    private configService: ConfigService,
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

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.createRefreshToken(usuario);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
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

    if (usuario.twoFactorEnabled) {
      const challenge = await this.createTwoFactorChallenge(usuario, TwoFactorPurpose.LOGIN);
      return {
        twoFactorRequired: true,
        challengeId: challenge.id,
        delivery: 'email',
      };
    }

    // Generar token
    const payload = {
      sub: usuario.userId,
      email: usuario.correo,
      rol: usuario.rol,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.createRefreshToken(usuario);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        userId: usuario.userId,
        correo: usuario.correo,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: usuario.rol,
      },
    };
  }

  private generateCode() {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  private hashValue(value: string) {
    return crypto.createHash('sha256').update(value).digest('hex');
  }

  private async getMailer() {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = Number(this.configService.get<string>('SMTP_PORT', '587'));
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    const from = this.configService.get<string>('SMTP_FROM', user ?? 'no-reply@taurosgym.com');

    if (!host || !user || !pass) {
      throw new BadRequestException('SMTP no configurado para 2FA por correo');
    }

    return {
      transporter: nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      }),
      from,
    };
  }

  private async sendCodeEmail(email: string, code: string, purpose: TwoFactorPurpose) {
    const { transporter, from } = await this.getMailer();
    const subject = purpose === TwoFactorPurpose.ENABLE ? 'Activa tu verificación en dos pasos' : 'Tu código de verificación Tauros';
    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5">
        <h2>TaurosGym</h2>
        <p>Tu código de verificación es:</p>
        <div style="font-size:32px;font-weight:bold;letter-spacing:4px">${code}</div>
        <p>Este código expira en 10 minutos.</p>
      </div>
    `;

    await transporter.sendMail({ from, to: email, subject, html });
  }

  private async createTwoFactorChallenge(usuario: Usuario, purpose: TwoFactorPurpose) {
    const code = this.generateCode();
    const challenge = this.twoFactorRepo.create({
      usuario,
      purpose,
      codeHash: this.hashValue(code),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      consumed: false,
      attempts: 0,
    });
    await this.twoFactorRepo.save(challenge);
    await this.sendCodeEmail(usuario.correo, code, purpose);
    return challenge;
  }

  private async loadChallenge(challengeId: string) {
    const challenge = await this.twoFactorRepo.findOne({ where: { id: challengeId }, relations: ['usuario'] });
    if (!challenge) {
      throw new UnauthorizedException('Desafío 2FA no encontrado');
    }
    if (challenge.consumed) {
      throw new UnauthorizedException('El código ya fue utilizado');
    }
    if (challenge.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('El código 2FA expiró');
    }
    return challenge;
  }

  async enableTwoFactor(userId: string) {
    const usuario = await this.validateUser(userId);
    const challenge = await this.createTwoFactorChallenge(usuario, TwoFactorPurpose.ENABLE);
    return {
      enabled: false,
      challengeId: challenge.id,
      delivery: 'email',
    };
  }

  async resendTwoFactorCode(body: TwoFactorSendDto) {
    const challenge = await this.loadChallenge(body.challengeId);
    const code = this.generateCode();
    challenge.codeHash = this.hashValue(code);
    challenge.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    challenge.attempts = 0;
    await this.twoFactorRepo.save(challenge);
    await this.sendCodeEmail(challenge.usuario.correo, code, challenge.purpose);
    return { sent: true };
  }

  async verifyTwoFactor(body: TwoFactorVerifyDto) {
    const challenge = await this.loadChallenge(body.challengeId);

    challenge.attempts += 1;
    if (challenge.attempts > 5) {
      challenge.consumed = true;
      await this.twoFactorRepo.save(challenge);
      throw new ForbiddenException('Demasiados intentos fallidos');
    }

    if (this.hashValue(body.code) !== challenge.codeHash) {
      await this.twoFactorRepo.save(challenge);
      throw new UnauthorizedException('Código 2FA inválido');
    }

    challenge.consumed = true;
    await this.twoFactorRepo.save(challenge);

    if (challenge.purpose === TwoFactorPurpose.ENABLE) {
      challenge.usuario.twoFactorEnabled = true;
      await this.usuarioRepository.save(challenge.usuario);
      return { enabled: true };
    }

    const payload = {
      sub: challenge.usuario.userId,
      email: challenge.usuario.correo,
      rol: challenge.usuario.rol,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.createRefreshToken(challenge.usuario);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        userId: challenge.usuario.userId,
        correo: challenge.usuario.correo,
        nombre: challenge.usuario.nombre,
        apellido: challenge.usuario.apellido,
        rol: challenge.usuario.rol,
      },
    };
  }

  private async hashToken(token: string) {
    return this.hashValue(token);
  }

  async createRefreshToken(usuario: Usuario, days = 30): Promise<string> {
    const plain = crypto.randomBytes(64).toString('hex');
    const tokenHash = await this.hashToken(plain);
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const row = this.refreshRepo.create({ usuario, tokenHash, expiresAt, revoked: false });
    await this.refreshRepo.save(row);

    return plain;
  }

  async rotateRefreshToken(plainToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenHash = await this.hashToken(plainToken);
    const row = await this.refreshRepo.findOne({ where: { tokenHash }, relations: ['usuario'] });
    if (!row || row.revoked || row.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    // create new token
    const newPlain = crypto.randomBytes(64).toString('hex');
    const newHash = await this.hashToken(newPlain);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // mark old as revoked and link
    row.revoked = true;
    row.replacedByHash = newHash;
    await this.refreshRepo.save(row);

    const newRow = this.refreshRepo.create({ usuario: row.usuario, tokenHash: newHash, expiresAt, revoked: false });
    await this.refreshRepo.save(newRow);

    const payload = { sub: row.usuario.userId, email: row.usuario.correo, rol: row.usuario.rol };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken, refreshToken: newPlain };
  }

  async revokeRefreshToken(plainToken: string) {
    const tokenHash = await this.hashToken(plainToken);
    const row = await this.refreshRepo.findOne({ where: { tokenHash } });
    if (!row) throw new BadRequestException('Token no encontrado');
    row.revoked = true;
    await this.refreshRepo.save(row);
    return { revoked: true };
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
