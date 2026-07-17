import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CsrfGuard } from './csrf.guard';

function buildContext(request: Record<string, any>, skipCsrf = false): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: () => (skipCsrf ? function skipHandler() {} : function handler() {}),
    getClass: () => class TestController {},
  } as unknown as ExecutionContext;
}

describe('CsrfGuard', () => {
  function buildGuard(skipCsrfReturn = false) {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(skipCsrfReturn) } as unknown as Reflector;
    return new CsrfGuard(reflector);
  }

  it('permite metodos seguros (GET) sin chequear nada', () => {
    const guard = buildGuard();
    const context = buildContext({ method: 'GET', headers: {}, cookies: {} });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('permite requests autenticadas por Authorization header (movil) sin exigir CSRF', () => {
    const guard = buildGuard();
    const context = buildContext({
      method: 'POST',
      headers: { authorization: 'Bearer abc' },
      cookies: {},
    });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('permite requests sin cookie de acceso (endpoint publico, ej. login)', () => {
    const guard = buildGuard();
    const context = buildContext({ method: 'POST', headers: {}, cookies: {} });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('permite requests autenticadas por cookie cuando el header X-CSRF-Token coincide', () => {
    const guard = buildGuard();
    const context = buildContext({
      method: 'POST',
      headers: { 'x-csrf-token': 'match-me' },
      cookies: { tauros_access_token: 'jwt', tauros_csrf: 'match-me' },
    });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('rechaza con 403 cuando el header X-CSRF-Token no coincide con la cookie', () => {
    const guard = buildGuard();
    const context = buildContext({
      method: 'POST',
      headers: { 'x-csrf-token': 'wrong' },
      cookies: { tauros_access_token: 'jwt', tauros_csrf: 'match-me' },
    });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('rechaza con 403 cuando falta el header X-CSRF-Token', () => {
    const guard = buildGuard();
    const context = buildContext({
      method: 'PATCH',
      headers: {},
      cookies: { tauros_access_token: 'jwt', tauros_csrf: 'match-me' },
    });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('rechaza con 403 en DELETE si el header no coincide', () => {
    const guard = buildGuard();
    const context = buildContext({
      method: 'DELETE',
      headers: { 'x-csrf-token': 'nope' },
      cookies: { tauros_access_token: 'jwt', tauros_csrf: 'match-me' },
    });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('exige CSRF en /auth/refresh o /auth/logout, autenticadas solo con la cookie de refresh (sin cookie de acceso, ya vencida)', () => {
    const guard = buildGuard();
    const context = buildContext({
      method: 'POST',
      headers: {},
      cookies: { tauros_refresh_token: 'refresh-jwt', tauros_csrf: 'match-me' },
    });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('permite el refresh solo-con-cookie-de-refresh cuando el header X-CSRF-Token coincide', () => {
    const guard = buildGuard();
    const context = buildContext({
      method: 'POST',
      headers: { 'x-csrf-token': 'match-me' },
      cookies: { tauros_refresh_token: 'refresh-jwt', tauros_csrf: 'match-me' },
    });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('permite login/register aunque el browser mande cookies de una sesion anterior todavia vigente, sin exigir CSRF', () => {
    const guard = buildGuard(true); // @SkipCsrf() presente en el handler
    const context = buildContext(
      {
        method: 'POST',
        headers: {}, // el frontend NO manda X-CSRF-Token en login/register a proposito
        cookies: { tauros_access_token: 'stale-jwt', tauros_csrf: 'stale-csrf' },
      },
      true,
    );
    expect(guard.canActivate(context)).toBe(true);
  });
});
