import {
  ACCESS_TOKEN_MAX_AGE_MS,
  REFRESH_TOKEN_MAX_AGE_MS,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  csrfCookieOptions,
} from './auth.cookies';

describe('auth.cookies', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('expira el access token junto con el JWT (24h, igual que signOptions.expiresIn en AuthModule)', () => {
    expect(ACCESS_TOKEN_MAX_AGE_MS).toBe(24 * 60 * 60 * 1000);
  });

  it('expira el refresh token junto con AuthService.createRefreshToken/rotateRefreshToken (30 dias)', () => {
    expect(REFRESH_TOKEN_MAX_AGE_MS).toBe(30 * 24 * 60 * 60 * 1000);
  });

  it('en desarrollo usa SameSite=Lax sin Secure (mismo localhost, distinto puerto)', () => {
    process.env.NODE_ENV = 'development';
    expect(accessTokenCookieOptions()).toMatchObject({
      httpOnly: true,
      path: '/',
      secure: false,
      sameSite: 'lax',
      maxAge: ACCESS_TOKEN_MAX_AGE_MS,
    });
  });

  it('en produccion usa Secure + SameSite=None (front y backend en dominios distintos)', () => {
    process.env.NODE_ENV = 'production';
    expect(accessTokenCookieOptions()).toMatchObject({
      secure: true,
      sameSite: 'none',
    });
  });

  it('la cookie de refresh token restringe el path a /auth', () => {
    expect(refreshTokenCookieOptions()).toMatchObject({
      httpOnly: true,
      path: '/auth',
      maxAge: REFRESH_TOKEN_MAX_AGE_MS,
    });
  });

  it('la cookie CSRF no es httpOnly (el front necesita leerla con JS)', () => {
    expect(csrfCookieOptions()).toMatchObject({
      httpOnly: false,
      path: '/',
      maxAge: ACCESS_TOKEN_MAX_AGE_MS,
    });
  });
});
