// Utilisateur connecté d'une requête : le cookie de session (posé par l'API sur le domaine partagé) est présenté
// à /v1/users/me. Une session expirée ou révoquée efface le cookie.
import type { Cookies } from '@sveltejs/kit';
import type { Lang } from '@tokenhood/i18n';
import type { Me } from '../identity.js';
import { api, SESSION_COOKIE } from './api.js';
import { webConfig } from './config.js';

export type LoadedUser = { me: Me; etag: string | null } | 'anonymous' | 'expired';

export async function loadUser(
  session: string | undefined,
  lang: Lang,
  fetcher?: typeof fetch,
): Promise<LoadedUser> {
  if (!session) return 'anonymous';
  const res = await api<Me>('/v1/users/me', { session, lang }, fetcher);
  if (res.status === 401) return 'expired';
  return res.ok && res.body ? { me: res.body, etag: res.etag } : 'anonymous';
}

export function clearSessionCookie(cookies: Cookies) {
  const { cookieDomain, cookieSecure } = webConfig();
  cookies.delete(SESSION_COOKIE, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: cookieSecure,
    ...(cookieDomain ? { domain: cookieDomain } : {}),
  });
}
