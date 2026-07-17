import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { Request } from "express";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Usuario, Rol } from "../usuario/entities/usuario.entity";
import { ACCESS_TOKEN_COOKIE } from "./auth.cookies";

// El móvil sigue mandando `Authorization: Bearer <token>` (SecureStore) sin cambios.
// El frontend web ahora autentica con la cookie httpOnly `tauros_access_token`.
// Se prueba primero el header y, si no está, se cae a la cookie: mismo guard/estrategia
// para ambos clientes sin duplicar lógica.
export function cookieExtractor(req: Request): string | null {
    return req?.cookies?.[ACCESS_TOKEN_COOKIE] ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        @InjectRepository(Usuario)
        private usuarioRepository: Repository<Usuario>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                ExtractJwt.fromAuthHeaderAsBearerToken(),
                cookieExtractor,
            ]),
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
