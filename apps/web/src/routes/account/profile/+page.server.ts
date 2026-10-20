import { fail, redirect } from '@sveltejs/kit';
import { timezones } from '#lib/identity.js';
import { newIdempotencyKey } from '#lib/server/api.js';
import { readProfile, saveProfile } from '#lib/server/profile.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
  if (!locals.user) redirect(303, '/login?return_to=/account/profile');
  return { me: locals.user, timezones: timezones(), submission: newIdempotencyKey() };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    if (!locals.user) redirect(303, '/login?return_to=/account/profile');
    const form = await request.formData();
    const values = readProfile(form);
    const submission = String(form.get('submission') ?? '') || newIdempotencyKey();
    const saved = await saveProfile(locals, values, `${submission}:profile`);
    if (!saved.ok)
      return fail(saved.message ? 409 : 422, { values, errors: saved.errors, message: saved.message });
    return { saved: true };
  },
};
