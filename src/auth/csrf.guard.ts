import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ACCESS_TOKEN_COOKIE, CSRF_COOKIE } from './auth.cookies';
import { SKIP_CSRF_KEY } from './skip-csrf.decorator';

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
 *   la cookie (no httpOnly) `tauros_csrf`.
 * - Ojo: "no httpOnly" NO significa que el frontend pueda leerla con
 *   document.cookie en cualquier caso — si el backend y el frontend viven en
 *   dominios distintos (ej. tauros-backend.onrender.com vs
 *   tauros-front-web.onrender.com), esa cookie es invisible para el JS del
 *   frontend por una restricción del propio navegador (scoping por origen),
 *   sin importar el flag httpOnly. Por eso login/refresh/2fa-verify devuelven
 *   el mismo valor también en el body de la respuesta (ver auth.controller.ts,
 *   `setAuthCookies`) — así el frontend lo consigue leyendo el JSON, no la
 *   cookie, y lo manda de vuelta como header en cada request que lo requiera.
 * - Si la request no trae ni Authorization ni la cookie de acceso, no está
 *   autenticada por cookie: se deja pasar el chequeo (la request va a fallar
 *   el guard de auth correspondiente más adelante si hacía falta sesión).
 * - Endpoints marcados con @SkipCsrf() (login, register, refresh, logout,
 *   2fa/send, 2fa/verify) quedan exentos SIEMPRE, sin importar qué cookies
 *   traiga la request. Son endpoints de ciclo de vida de sesión: forzarlos
 *   desde otro sitio no tiene impacto real (el atacante no puede leer la
 *   respuesta por CORS ni las cookies por httpOnly), y refresh/logout tienen
 *   que poder llamarse aunque el frontend todavía no tenga ningún csrfToken
 *   en memoria (recién cargada la página, por ejemplo).
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    if (!UNSAFE_METHODS.has(request.method)) {
      return true;
    }

    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_CSRF_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) {
      return true;
    }

    if (request.headers.authorization) {
      return true;
    }

    const accessTokenCookie = request.cookies?.[ACCESS_TOKEN_COOKIE];
    if (!accessTokenCookie) {
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
