// Déconnexion depuis le bouton de l'en-tête (formulaire POST, protégé par le contrôle d'origine de SvelteKit) :
// l'API révoque la session, le cookie est effacé, retour à l'accueil.
import { redirect } from '@sveltejs/kit';
import { api, newIdempotencyKey } from '#lib/server/api.js';
import { clearSessionCookie } from '#lib/server/session.js';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, cookies }) => {
  if (locals.session)
    await api('/v1/auth/logout', {
      method: 'POST',
      session: locals.session,
      lang: locals.lang,
      idempotencyKey: newIdempotencyKey(),
    });
  clearSessionCookie(cookies);
  redirect(303, '/');
};

export const GET: RequestHandler = () => redirect(303, '/');
