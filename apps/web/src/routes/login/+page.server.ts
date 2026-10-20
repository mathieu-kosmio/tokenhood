import { redirect } from '@sveltejs/kit';
import type { MessageKey } from '@tokenhood/i18n';
import { safeReturnTo } from '#lib/identity.js';
import { api } from '#lib/server/api.js';
import { webConfig } from '#lib/server/config.js';
import type { PageServerLoad } from './$types';

// Motifs de refus renvoyés par l'API dans ?error= après le rappel GitHub.
const ERRORS: Record<string, MessageKey> = {
  state_invalid: 'identity.login.errors.stateInvalid',
  denied: 'identity.login.errors.denied',
  email_unverified: 'identity.login.errors.emailUnverified',
  exchange_failed: 'identity.login.errors.exchangeFailed',
  profile_failed: 'identity.login.errors.profileFailed',
};

export const load: PageServerLoad = async ({ locals, url }) => {
  const returnTo = safeReturnTo(url.searchParams.get('return_to'));
  if (locals.user) redirect(303, returnTo);
  const providers = await api<{ github: { available: boolean } }>('/v1/auth/providers', {
    lang: locals.lang,
  });
  const code = url.searchParams.get('error');
  const start = new URL(`${webConfig().publicApiUrl}/v1/auth/github/start`);
  start.searchParams.set('return_to', returnTo);
  start.searchParams.set('lang', locals.lang);
  return {
    available: providers.body?.github.available === true && code !== 'unavailable',
    error: code ? (ERRORS[code] ?? null) : null,
    startUrl: start.toString(),
  };
};
