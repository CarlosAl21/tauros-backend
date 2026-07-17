import { CookieOptions } from 'express';

export const ACCESS_TOKEN_COOKIE = 'tauros_access_token';
export const REFRESH_TOKEN_COOKIE = 'tauros_refresh_token';
export const CSRF_COOKIE = 'tauros_csrf';

// Debe coincidir con signOptions.expiresIn ('24h') configurado en AuthModule (JwtModule.registerAsync).
export const ACCESS_TOKEN_MAX_AGE_MS = 24 * 60 * 60 * 1000;

// Debe coincidir con la expiración real del refresh token: AuthService.createRefreshToken (days = 30)
// y AuthService.rotateRefreshToken (30 días hardcodeados al rotar).
export const REFRESH_TOKEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

function baseCookieOptions(): Pick<CookieOptions, 'secure' | 'sameSite'> {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  };
}

export function accessTokenCookieOptions(): CookieOptions {
  return {
    ...baseCookieOptions(),
    httpOnly: true,
    path: '/',
    maxAge: ACCESS_TOKEN_MAX_AGE_MS,
  };
}

export function refreshTokenCookieOptions(): CookieOptions {
  return {
    ...baseCookieOptions(),
    httpOnly: true,
    path: '/auth',
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
  };
}

export function csrfCookieOptions(): CookieOptions {
  return {
    ...baseCookieOptions(),
    httpOnly: false,
    path: '/',
    maxAge: ACCESS_TOKEN_MAX_AGE_MS,
  };
}

// express's res.clearCookie(name, opts) sets `expires: new Date(1)` internally,
// but res.cookie() recomputes `expires` from `maxAge` whenever it's present,
// clobbering that expiry with a future date. Passing the *-CookieOptions()
// above straight to clearCookie silently fails to delete the cookie. Strip
// maxAge (path/secure/sameSite still have to match what was set, or the
// browser treats it as a different cookie and won't remove the original).
export function forClearing(options: CookieOptions): CookieOptions {
  const { maxAge, ...rest } = options;
  return rest;
}
