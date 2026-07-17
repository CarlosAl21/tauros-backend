import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { ACCESS_TOKEN_COOKIE, CSRF_COOKIE, REFRESH_TOKEN_COOKIE } from './auth.cookies';

const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const CSRF_HEADER = 'x-csrf-token';

/**
 * Protección CSRF (patrón de doble token) para requests autenticadas por cookie.
 *
 * - El móvil autentica con `Authorization: Bearer <token>`. Los navegadores no
 *   adjuntan headers custom entre sitios, así que Bearer no es vulnerable a CSRF
 *   y no se le exige nada acá.
 * - El frontend web autentica con la cookie httpOnly `tauros_access_token`. Para
 *   métodos que mutan estado, exigimos que el header `X-CSRF-Token` coincida con
 *   la cookie (no httpOnly) `tauros_csrf`, que solo JS del mismo origen puede leer.
 * - Si la request no trae ni Authorization ni ninguna cookie de sesión (acceso
 *   o refresh), no está autenticada por cookie: se deja pasar el chequeo
 *   (endpoints públicos como /auth/login, /auth/register, etc., o la request
 *   fallará el guard de auth correspondiente más adelante).
 * - La cookie de refresh cuenta como "sesión por cookie" además de la de
 *   acceso: /auth/refresh y /auth/logout se llaman justo cuando el access
 *   token ya venció (por eso no traen esa cookie), así que si solo mirásemos
 *   la cookie de acceso, esas dos rutas quedarían sin protección CSRF.
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    if (!UNSAFE_METHODS.has(request.method)) {
      return true;
    }

    if (request.headers.authorization) {
      return true;
    }

    const accessTokenCookie = request.cookies?.[ACCESS_TOKEN_COOKIE];
    const refreshTokenCookie = request.cookies?.[REFRESH_TOKEN_COOKIE];
    if (!accessTokenCookie && !refreshTokenCookie) {
      return true;
    }

    const csrfCookie = request.cookies?.[CSRF_COOKIE];
    const csrfHeader = request.headers[CSRF_HEADER];

    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
      throw new ForbiddenException('Token CSRF inválido o ausente');
    }

    return true;
  }
}
