import { fail, redirect } from '@sveltejs/kit';
import { translator } from '@tokenhood/i18n';
import type { FormError } from '#lib/forms/index.js';
import { DEFAULT_TIMEZONE, timezones } from '#lib/identity.js';
import { api, newIdempotencyKey } from '#lib/server/api.js';
import { etagOf, readProfile, saveProfile } from '#lib/server/profile.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
  if (!locals.user) redirect(303, '/login?return_to=/registration');
  if (locals.user.registration.complete) redirect(303, '/account');
  return {
    me: locals.user,
    etag: locals.etag,
    timezones: timezones(),
    defaultTimezone: DEFAULT_TIMEZONE,
    // Clé de la soumission : un double envoi du formulaire est rejoué par l'API, pas exécuté deux fois.
    submission: newIdempotencyKey(),
  };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const user = locals.user;
    if (!user) redirect(303, '/login?return_to=/registration');
    const t = translator(locals.lang);
    const form = await request.formData();
    const values = readProfile(form);
    const documents = form.getAll('documents').map(String);
    const submission = String(form.get('submission') ?? '') || newIdempotencyKey();
    const pending = user.registration.documents.filter((d) => !d.current);
    const errors: FormError[] = pending
      .filter((d) => !documents.includes(d.id))
      .map((d) => ({
        field: `document-${d.id}`,
        message: t('identity.documents.errors.required', { title: t(`identity.documents.${d.id}`) }),
      }));

    const saved = await saveProfile(locals, values, etagOf(form), `${submission}:profile`);
    if (!saved.ok)
      return fail(saved.status, {
        values,
        documents,
        errors: [...saved.errors, ...errors],
        message: saved.message,
      });
    if (errors.length) return fail(422, { values, documents, errors, message: null });

    for (const doc of pending) {
      const res = await api('/v1/users/me/acceptances', {
        method: 'POST',
        session: locals.session,
        lang: locals.lang,
        idempotencyKey: `${submission}:${doc.id}:${doc.version}`,
        body: { document: doc.id, version: doc.version },
      });
      if (!res.ok)
        errors.push({ field: `document-${doc.id}`, message: res.error?.message ?? t('errors.unavailable') });
    }
    if (errors.length) return fail(422, { values, documents, errors, message: null });
    redirect(303, '/account');
  },
};
