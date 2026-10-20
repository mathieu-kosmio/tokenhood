// Résolution de l'acteur d'une requête. Un humain s'authentifie par le cookie de session (jeton opaque) ; les
// jetons d'agent arrivent avec TH-109. Les autorisations restent vérifiées par la couche métier (core/common).
import type { FastifyInstance, FastifyReply } from 'fastify';
import type { CookieSerializeOptions } from '@fastify/cookie';
import { resolveSession } from '@tokenhood/core/identity';
import type { ApiConfig } from '../config.js';
import { identityContext } from '../deps.js';

export const SESSION_COOKIE = 'th_session';
export const STATE_COOKIE = 'th_oauth_state';

export function sessionCookie(config: ApiConfig, expires?: Date): CookieSerializeOptions {
  const options: CookieSerializeOptions = {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: config.cookie.secure,
  };
  if (config.cookie.domain) options.domain = config.cookie.domain;
  if (expires) options.expires = expires;
  return options;
}

// Cookie d'état OAuth : propre à l'API (sans domaine partagé), limité au parcours GitHub, 10 minutes.
export function stateCookie(config: ApiConfig): CookieSerializeOptions {
  return {
    path: '/v1/auth/github',
    httpOnly: true,
    sameSite: 'lax',
    secure: config.cookie.secure,
    maxAge: 600,
  };
}

export function clearSession(reply: FastifyReply, config: ApiConfig) {
  reply.clearCookie(SESSION_COOKIE, sessionCookie(config));
}

export function installAuth(app: FastifyInstance) {
  app.decorateRequest('actor', null);
  app.addHook('onRequest', async (request) => {
    request.actor = null;
    const token = request.cookies[SESSION_COOKIE];
    const ctx = identityContext(app.deps);
    if (!token || !ctx || !app.deps.config.auth) return;
    const resolved = await resolveSession(ctx, token);
    if (resolved) request.actor = resolved.actor;
  });
}
