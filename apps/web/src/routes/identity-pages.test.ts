// Tests de rendu des pages de connexion, d'inscription et de profil : champs étiquetés, erreurs reliées à leur
// champ, ordre de tabulation naturel, textes localisés, « connexion indisponible » sans configuration.
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import type { Me } from '#lib/identity.js';
import { elements, problems, textOf } from '#lib/testing/a11y.js';
import Login from './login/+page.svelte';
import Registration from './registration/+page.svelte';
import Profile from './account/profile/+page.svelte';

const pending: Me = {
  id: 'u1',
  display_name: 'Ada Lovelace',
  roles: [],
  lang: 'fr',
  timezone: null,
  admin: false,
  github: { id: '1', login: 'ada-l' },
  registration: {
    complete: false,
    missing: ['timezone', 'roles', 'documents'],
    documents: [
      {
        id: 'charter',
        version: 1,
        url: { fr: 'https://x/fr/charte', en: 'https://x/en/charter' },
        accepted: null,
        current: false,
      },
      {
        id: 'terms',
        version: 2,
        url: { fr: 'https://x/fr/cgu', en: 'https://x/en/terms' },
        accepted: { version: 1, at: '2026-10-01T10:00:00.000Z' },
        current: false,
      },
      {
        id: 'privacy',
        version: 1,
        url: { fr: 'https://x/fr/conf', en: 'https://x/en/privacy' },
        accepted: { version: 1, at: '2026-10-01T10:00:00.000Z' },
        current: true,
      },
    ],
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const html = (component: any, props: Record<string, unknown>) => render(component, { props }).body;

describe('page de connexion', () => {
  const base = {
    lang: 'fr',
    user: null,
    startUrl: 'https://api.example/v1/auth/github/start?lang=fr',
    error: null,
  };

  it('sans configuration OAuth : message localisé « connexion indisponible », aucun lien de départ', () => {
    const fr = html(Login, { data: { ...base, available: false } });
    expect(fr).toContain('Connexion indisponible');
    expect(fr).not.toContain('auth/github/start');
    const en = html(Login, { data: { ...base, lang: 'en', available: false } });
    expect(en).toContain('Sign-in unavailable');
  });

  it('configurée : lien de départ vers l’API, portées expliquées', () => {
    const page = html(Login, { data: { ...base, available: true } });
    const [link] = elements(page, 'a').filter((a) => a.href?.includes('/v1/auth/github/start'));
    expect(link).toBeDefined();
    expect(page).toContain('Continuer avec GitHub');
    expect(page).toContain('read:user');
    expect(problems(page)).toEqual([]);
  });

  it('affiche le motif d’un refus, annoncé', () => {
    const page = html(Login, {
      data: { ...base, available: true, error: 'identity.login.errors.emailUnverified' },
    });
    expect(page).toMatch(/role="alert"[^>]*>Votre compte GitHub n'a pas d'adresse email principale vérifiée/);
  });
});

describe('page d’inscription', () => {
  const data = {
    lang: 'fr',
    user: { displayName: 'Ada' },
    me: pending,
    timezones: ['Europe/Paris', 'UTC'],
    defaultTimezone: 'Europe/Paris',
    submission: 's1',
  };

  it('tous les champs sont étiquetés, groupés et utilisables au clavier', () => {
    const page = html(Registration, { data, form: null });
    expect(problems(page)).toEqual([]);
    expect(elements(page, 'legend').length).toBeGreaterThanOrEqual(5);
    expect(
      elements(page, 'input')
        .filter((i) => i.name === 'documents')
        .map((i) => i.value),
    ).toEqual(['charter', 'terms']);
    expect(page).toContain(
      'Vous avez accepté la politique de confidentialité (version 1) le 1 octobre 2026.',
    );
    expect(page).toContain('J’accepte les conditions d’utilisation (version 2)'.replaceAll('’', "'"));
    expect(elements(page, 'button').every((b) => b.type === 'submit')).toBe(true);
  });

  it('les erreurs sont reliées à leur champ et récapitulées avec un lien vers chacun', () => {
    const errors = [
      { field: 'display_name', message: 'Indiquez un nom de 1 à 80 caractères, sans caractère invisible.' },
      { field: 'roles', message: 'Choisissez au moins un rôle.' },
      { field: 'document-charter', message: "Acceptez la charte d'amorçage pour terminer l'inscription." },
    ];
    const form = {
      values: { display_name: ' ', roles: [], lang: 'fr', timezone: 'UTC' },
      documents: [],
      errors,
      message: null,
    };
    const page = html(Registration, { data, form });
    expect(problems(page)).toEqual([]);
    const name = elements(page, 'input').find((i) => i.id === 'display_name')!;
    expect(name['aria-invalid']).toBe('true');
    expect(name['aria-describedby']).toContain('display_name-error');
    expect(textOf(page, 'display_name-error')).toBe(errors[0]!.message);
    const charter = elements(page, 'input').find((i) => i.id === 'document-charter')!;
    expect(charter['aria-describedby']).toContain('document-charter-error');
    expect(
      elements(page, 'fieldset').find((f) => f['aria-describedby']?.includes('roles-error')),
    ).toBeDefined();
    expect(
      elements(page, 'a')
        .filter((a) => a.href?.startsWith('#'))
        .map((a) => a.href),
    ).toEqual(['#display_name', '#roles', '#document-charter']);
    expect(page).toContain('3 champs sont à corriger :');
  });

  it('en anglais, les textes et les liens des documents changent de langue', () => {
    const page = html(Registration, { data: { ...data, lang: 'en' }, form: null });
    expect(page).toContain('Complete your registration');
    expect(page).toContain('href="https://x/en/charter"');
  });
});

describe('rubrique Profil', () => {
  const me: Me = {
    ...pending,
    roles: ['contributor'],
    timezone: 'Europe/Paris',
    registration: { ...pending.registration, complete: true },
  };
  const data = {
    lang: 'en',
    user: { displayName: 'Ada' },
    me,
    timezones: ['Europe/Paris', 'UTC'],
    submission: 's1',
  };

  it('champs étiquetés, valeurs du profil, documents acceptés', () => {
    const page = html(Profile, { data, form: null });
    expect(problems(page)).toEqual([]);
    expect(elements(page, 'input').find((i) => i.id === 'display_name')?.value).toBe('Ada Lovelace');
    expect(
      elements(page, 'input').find((i) => i.name === 'roles' && i.value === 'contributor'),
    ).toHaveProperty('checked');
    expect(page).toContain('GitHub account: ada-l');
    expect(page).toContain('You accepted the privacy policy (version 1) on October 1, 2026');
  });

  it('un conflit de version est annoncé, l’enregistrement réussi aussi', () => {
    const conflict = html(Profile, {
      data,
      form: {
        values: { display_name: 'Ada', roles: ['contributor'], lang: 'en', timezone: 'UTC' },
        errors: [],
        message: 'The resource changed since you read it: read it again, then retry.',
      },
    });
    expect(conflict).toMatch(/role="alert"[^>]*>The resource changed/);
    const saved = html(Profile, { data, form: { saved: true } });
    expect(saved).toMatch(/role="status"[^>]*>Profile saved\./);
  });
});
