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

// ETag du profil affiché, renvoyé par le formulaire (champ caché « etag »).
export const etagOf = (form: FormData): string | null => String(form.get('etag') ?? '') || null;

export function readProfile(form: FormData): ProfileValues {
  return {
    display_name: String(form.get('display_name') ?? ''),
    roles: form.getAll('roles').map(String),
    lang: String(form.get('lang') ?? ''),
    timezone: String(form.get('timezone') ?? ''),
  };
}

export type SaveResult =
  | { ok: true; me: Me; etag: string | null }
  | { ok: false; status: number; errors: FormError[]; message: string | null };

// Les champs de l'API (« roles.0 », « display_name ») désignent les champs du formulaire du même nom.
const fieldId = (field: string) => field.split('.')[0] ?? field;

// ifMatch : ETag du profil tel qu'il était affiché (champ caché du formulaire), jamais celui relu à l'envoi :
// une modification faite entre-temps (autre onglet) est refusée par l'API (412) au lieu d'être écrasée.
export async function saveProfile(
  locals: App.Locals,
  values: ProfileValues,
  ifMatch: string | null,
  idempotencyKey: string,
): Promise<SaveResult> {
  const t = translator(locals.lang);
  const res = await api<Me>('/v1/users/me', {
    method: 'PATCH',
    session: locals.session,
    lang: locals.lang,
    idempotencyKey,
    ifMatch,
    body: values,
  });
  if (res.ok && res.body) return { ok: true, me: res.body, etag: res.etag };
  if (res.status === 0) return { ok: false, status: 503, errors: [], message: t('errors.unavailable') };
  const fields = res.error?.fields ?? [];
  if (fields.length)
    return {
      ok: false,
      status: res.status,
      errors: fields.map((f) => ({ field: fieldId(f.field), message: f.message })),
      message: null,
    };
  return { ok: false, status: res.status, errors: [], message: res.error?.message ?? t('errors.internal') };
}
