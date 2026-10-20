import type { Handle } from '@sveltejs/kit/hooks';
import { allowedDuringRegistration } from '#lib/identity.js';
import { LANG_COOKIE, resolveLang } from '#lib/lang.js';
import { api, newIdempotencyKey, SESSION_COOKIE } from '#lib/server/api.js';
import { clearSessionCookie, loadUser } from '#lib/server/session.js';
import type { Me } from '#lib/identity.js';

export const handle: Handle = async ({ event, resolve }) => {
  const sources = {
    query: event.url.searchParams.get('lang'),
    cookie: event.cookies.get(LANG_COOKIE),
    acceptLanguage: event.request.headers.get('accept-language'),
  };
  const session = event.cookies.get(SESSION_COOKIE);
  const loaded = await loadUser(session, resolveLang(sources).lang);
  if (loaded === 'expired') clearSessionCookie(event.cookies);
  const user = typeof loaded === 'object' ? loaded : null;
  event.locals.user = user?.me ?? null;
  event.locals.etag = user?.etag ?? null;
  event.locals.session = user ? (session ?? null) : null;

  // Connecté, la langue du profil prime ; un choix explicite (?lang=) met le profil à jour.
  const { lang, remember, updateProfile } = resolveLang({
    ...sources,
    profile: event.locals.user?.lang ?? null,
  });
  if (updateProfile && event.locals.user) {
    const res = await api<Me>('/v1/users/me', {
      method: 'PATCH',
      body: { lang },
      session: event.locals.session,
      lang,
      ifMatch: event.locals.etag,
      idempotencyKey: newIdempotencyKey(),
    });
    if (res.ok && res.body) {
      event.locals.user = res.body;
      event.locals.etag = res.etag;
    }
  }
  event.locals.lang = lang;
  if (remember) {
    event.cookies.set(LANG_COOKIE, lang, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
      httpOnly: false,
    });
  }

  // Inscription incomplète : seul le parcours d'inscription est ouvert.
  if (
    event.locals.user &&
    !event.locals.user.registration.complete &&
    !allowedDuringRegistration(event.url.pathname)
  )
    return new Response(null, { status: 303, headers: { location: '/registration' } });

  const response = await resolve(event, {
    transformPageChunk: ({ html }) => html.replace('%lang%', lang),
  });
  response.headers.set('content-language', lang);
  response.headers.set('x-content-type-options', 'nosniff');
  response.headers.set('referrer-policy', 'strict-origin-when-cross-origin');
  response.headers.set('x-frame-options', 'DENY');
  return response;
};
