import { SetMetadata } from '@nestjs/common';

export const SKIP_CSRF_KEY = 'skipCsrf';

// Marca endpoints que establecen o intentan establecer una sesión nueva
// (login, register, pasos de 2FA previos a tener sesión). CsrfGuard no debe
// exigir el header ahí aunque el browser mande cookies de sesión viejas
// (de un login anterior, todavía vigentes por hasta 24h) — esas cookies no
// tienen nada que ver con esta request y no deberían bloquearla.
export const SkipCsrf = () => SetMetadata(SKIP_CSRF_KEY, true);
