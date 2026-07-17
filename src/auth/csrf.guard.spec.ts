import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { CsrfGuard } from './csrf.guard';

function buildContext(request: Record<string, any>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}

describe('CsrfGuard', () => {
  const guard = new CsrfGuard();

  it('permite metodos seguros (GET) sin chequear nada', () => {
    const context = buildContext({ method: 'GET', headers: {}, cookies: {} });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('permite requests autenticadas por Authorization header (movil) sin exigir CSRF', () => {
    const context = buildContext({
      method: 'POST',
      headers: { authorization: 'Bearer abc' },
      cookies: {},
    });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('permite requests sin cookie de acceso (endpoint publico, ej. login)', () => {
    const context = buildContext({ method: 'POST', headers: {}, cookies: {} });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('permite requests autenticadas por cookie cuando el header X-CSRF-Token coincide', () => {
    const context = buildContext({
      method: 'POST',
      headers: { 'x-csrf-token': 'match-me' },
      cookies: { tauros_access_token: 'jwt', tauros_csrf: 'match-me' },
    });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('rechaza con 403 cuando el header X-CSRF-Token no coincide con la cookie', () => {
    const context = buildContext({
      method: 'POST',
      headers: { 'x-csrf-token': 'wrong' },
      cookies: { tauros_access_token: 'jwt', tauros_csrf: 'match-me' },
    });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('rechaza con 403 cuando falta el header X-CSRF-Token', () => {
    const context = buildContext({
      method: 'PATCH',
      headers: {},
      cookies: { tauros_access_token: 'jwt', tauros_csrf: 'match-me' },
    });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('rechaza con 403 en DELETE si el header no coincide', () => {
    const context = buildContext({
      method: 'DELETE',
      headers: { 'x-csrf-token': 'nope' },
      cookies: { tauros_access_token: 'jwt', tauros_csrf: 'match-me' },
    });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('exige CSRF en /auth/refresh o /auth/logout, autenticadas solo con la cookie de refresh (sin cookie de acceso, ya vencida)', () => {
    const context = buildContext({
      method: 'POST',
      headers: {},
      cookies: { tauros_refresh_token: 'refresh-jwt', tauros_csrf: 'match-me' },
    });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('permite el refresh solo-con-cookie-de-refresh cuando el header X-CSRF-Token coincide', () => {
    const context = buildContext({
      method: 'POST',
      headers: { 'x-csrf-token': 'match-me' },
      cookies: { tauros_refresh_token: 'refresh-jwt', tauros_csrf: 'match-me' },
    });
    expect(guard.canActivate(context)).toBe(true);
  });
});
