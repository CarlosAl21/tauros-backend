import { cookieExtractor } from './jwt.strategy';
import { ACCESS_TOKEN_COOKIE } from './auth.cookies';

describe('cookieExtractor', () => {
  it('devuelve el access token desde la cookie httpOnly (auth web)', () => {
    const req: any = { cookies: { [ACCESS_TOKEN_COOKIE]: 'jwt-value' } };
    expect(cookieExtractor(req)).toBe('jwt-value');
  });

  it('devuelve null si no hay cookies (ej. movil, que usa Authorization header)', () => {
    const req: any = {};
    expect(cookieExtractor(req)).toBeNull();
  });

  it('devuelve null si la cookie de acceso no esta presente', () => {
    const req: any = { cookies: {} };
    expect(cookieExtractor(req)).toBeNull();
  });
});
