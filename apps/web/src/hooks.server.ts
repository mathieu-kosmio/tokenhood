import type { Handle } from '@sveltejs/kit/hooks';
import { LANG_COOKIE, resolveLang } from '#lib/lang.js';

export const handle: Handle = async ({ event, resolve }) => {
  const { lang, remember } = resolveLang({
    query: event.url.searchParams.get('lang'),
    cookie: event.cookies.get(LANG_COOKIE),
    acceptLanguage: event.request.headers.get('accept-language'),
  });
  event.locals.lang = lang;
  if (remember) {
    event.cookies.set(LANG_COOKIE, lang, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
      httpOnly: false,
    });
  }
  const response = await resolve(event, {
    transformPageChunk: ({ html }) => html.replace('%lang%', lang),
  });
  response.headers.set('content-language', lang);
  response.headers.set('x-content-type-options', 'nosniff');
  response.headers.set('referrer-policy', 'strict-origin-when-cross-origin');
  response.headers.set('x-frame-options', 'DENY');
  return response;
};
