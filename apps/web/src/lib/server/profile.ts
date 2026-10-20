// Enregistrement du profil depuis un formulaire (inscription, rubrique Profil) : PATCH /v1/users/me avec
// l'ETag lu par la requête (If-Match) et une clé d'idempotence ; erreurs de l'API ramenées à leurs champs.
import { translator } from '@tokenhood/i18n';
import type { FormError } from '../forms/index.js';
import type { Me } from '../identity.js';
import { api } from './api.js';

export interface ProfileValues {
  display_name: string;
  roles: string[];
  lang: string;
  timezone: string;
}

export function readProfile(form: FormData): ProfileValues {
  return {
    display_name: String(form.get('display_name') ?? ''),
    roles: form.getAll('roles').map(String),
    lang: String(form.get('lang') ?? ''),
    timezone: String(form.get('timezone') ?? ''),
  };
}

export type SaveResult =
  { ok: true; me: Me; etag: string | null } | { ok: false; errors: FormError[]; message: string | null };

// Les champs de l'API (« roles.0 », « display_name ») désignent les champs du formulaire du même nom.
const fieldId = (field: string) => field.split('.')[0] ?? field;

export async function saveProfile(
  locals: App.Locals,
  values: ProfileValues,
  idempotencyKey: string,
): Promise<SaveResult> {
  const t = translator(locals.lang);
  const res = await api<Me>('/v1/users/me', {
    method: 'PATCH',
    session: locals.session,
    lang: locals.lang,
    idempotencyKey,
    ifMatch: locals.etag,
    body: values,
  });
  if (res.ok && res.body) return { ok: true, me: res.body, etag: res.etag };
  if (res.status === 0) return { ok: false, errors: [], message: t('errors.unavailable') };
  const fields = res.error?.fields ?? [];
  if (fields.length)
    return {
      ok: false,
      errors: fields.map((f) => ({ field: fieldId(f.field), message: f.message })),
      message: null,
    };
  return { ok: false, errors: [], message: res.error?.message ?? t('errors.internal') };
}
