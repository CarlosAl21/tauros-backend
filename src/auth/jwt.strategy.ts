import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Usuario, Rol } from "../usuario/entities/usuario.entity";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        @InjectRepository(Usuario)
        private usuarioRepository: Repository<Usuario>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET', 'tauros_secret_key_2024')
        })
    }

    async validate(payload: any) {
        const usuario = await this.usuarioRepository.findOne({
            where: { userId: payload.sub },
        });

        if (!usuario) {
            throw new UnauthorizedException('Usuario no válido');
        }

        return {
            userId: usuario.userId,
            username: usuario.correo,
            rol: usuario.rol,
            isAdmin: usuario.rol === Rol.ADMIN,
            isCoach: usuario.rol === Rol.COACH,
            isUser: usuario.rol === Rol.USER,
        };
    }
}
