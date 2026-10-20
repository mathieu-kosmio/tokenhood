// Déconnexion depuis le bouton de l'en-tête (formulaire POST, protégé par le contrôle d'origine de SvelteKit) :
// l'API révoque la session, le cookie est effacé, retour à l'accueil.
import { error, redirect } from '@sveltejs/kit';
import { api, newIdempotencyKey, SESSION_COOKIE } from '#lib/server/api.js';
import { clearSessionCookie } from '#lib/server/session.js';
import type { RequestHandler } from './$types';

// Le jeton vient du cookie lui-même (et non du profil chargé) : si l'API n'a pas répondu au chargement, la
// session est quand même révoquée. Si la révocation échoue, le cookie est gardé et l'erreur affichée.
export const POST: RequestHandler = async ({ locals, cookies }) => {
  const session = cookies.get(SESSION_COOKIE);
  if (session) {
    const res = await api('/v1/auth/logout', {
      method: 'POST',
      session,
      lang: locals.lang,
      idempotencyKey: newIdempotencyKey(),
    });
    if (res.status === 0 || res.status >= 500) error(503);
  }
  clearSessionCookie(cookies);
  redirect(303, '/');
};

export const GET: RequestHandler = () => redirect(303, '/');
