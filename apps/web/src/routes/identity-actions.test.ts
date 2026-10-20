// Chargements et actions côté serveur des pages d'identité, contre une API simulée.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { isRedirect } from '@sveltejs/kit';
import type { Me } from '#lib/identity.js';
import { load as loginLoad } from './login/+page.server.js';
import { actions as registration } from './registration/+page.server.js';
import { POST as logout } from './logout/+server.js';

const pending: Me = {
  id: 'u1',
  display_name: 'Ada',
  roles: [],
  lang: 'fr',
  timezone: null,
  admin: false,
  github: { id: '1', login: 'ada' },
  registration: {
    complete: false,
    missing: ['timezone', 'roles', 'documents'],
    documents: [
      {
        id: 'charter',
        version: 1,
        url: { fr: 'https://x/c', en: 'https://x/c' },
        accepted: null,
        current: false,
      },
      {
        id: 'terms',
        version: 1,
        url: { fr: 'https://x/t', en: 'https://x/t' },
        accepted: null,
        current: false,
      },
    ],
  },
};

function stubApi(
  respond: (method: string, path: string, body: unknown) => { status: number; body?: unknown },
) {
  const calls: {
    method: string;
    path: string;
    body: unknown;
    key: string | undefined;
    ifMatch: string | undefined;
    cookie: string | undefined;
  }[] = [];
  vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
    const path = new URL(url).pathname;
    const body = init.body ? JSON.parse(String(init.body)) : null;
    const method = init.method ?? 'GET';
    const headers = init.headers as Record<string, string>;
    calls.push({
      method,
      path,
      body,
      key: headers['idempotency-key'],
      ifMatch: headers['if-match'],
      cookie: headers.cookie,
    });
    const res = respond(method, path, body);
    return new Response(res.status === 204 ? null : JSON.stringify(res.body ?? {}), {
      status: res.status,
      headers: { etag: '"v2"' },
    });
  });
  return calls;
}

const formOf = (entries: [string, string][]) => {
  const form = new FormData();
  for (const [k, v] of entries) form.append(k, v);
  return form;
};

const submit = (entries: [string, string][]) =>
  registration.default!({
    request: new Request('http://localhost/registration', { method: 'POST', body: formOf(entries) }),
    locals: { lang: 'fr', user: pending, etag: '"v1"', session: 'jeton' },
  } as never);

const profileEntries: [string, string][] = [
  ['submission', 's1'],
  ['etag', '"v-affiche"'],
  ['display_name', 'Ada'],
  ['roles', 'contributor'],
  ['lang', 'fr'],
  ['timezone', 'Europe/Paris'],
];

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('connexion', () => {
  it('connexion indisponible si l’API le déclare ou est injoignable', async () => {
    stubApi(() => ({ status: 200, body: { github: { available: false } } }));
    const url = new URL('http://localhost/login?error=email_unverified');
    const data = await loginLoad({ locals: { lang: 'fr', user: null }, url } as never);
    expect(data).toMatchObject({ available: false, error: 'identity.login.errors.emailUnverified' });
    vi.stubGlobal('fetch', async () => {
      throw new TypeError('fetch failed');
    });
    expect(
      await loginLoad({
        locals: { lang: 'fr', user: null },
        url: new URL('http://localhost/login'),
      } as never),
    ).toMatchObject({
      available: false,
      error: null,
    });
  });

  it('lien de départ vers l’API publique, avec la langue et l’adresse de retour', async () => {
    stubApi(() => ({ status: 200, body: { github: { available: true } } }));
    const data = await loginLoad({
      locals: { lang: 'en', user: null },
      url: new URL('http://localhost/login?return_to=/account/profile'),
    } as never);
    expect(data).toMatchObject({ available: true });
    const start = new URL((data as { startUrl: string }).startUrl);
    expect(start.pathname).toBe('/v1/auth/github/start');
    expect(Object.fromEntries(start.searchParams)).toEqual({ return_to: '/account/profile', lang: 'en' });
  });
});

describe('inscription', () => {
  it('un document non accepté est refusé, relié à sa case, sans aucune acceptation envoyée', async () => {
    const calls = stubApi((method) => ({ status: 200, body: method === 'PATCH' ? pending : {} }));
    const result = await submit([...profileEntries, ['documents', 'charter']]);
    expect(result).toMatchObject({
      status: 422,
      data: {
        errors: [
          {
            field: 'document-terms',
            message: "Acceptez les conditions d'utilisation pour terminer l'inscription.",
          },
        ],
      },
    });
    expect(calls.filter((c) => c.path === '/v1/users/me/acceptances')).toEqual([]);
  });

  it('les erreurs de l’API sont ramenées à leurs champs', async () => {
    stubApi(() => ({
      status: 422,
      body: {
        error: 'validation_failed',
        message: '1',
        fields: [{ field: 'timezone', message: 'Choisissez un fuseau horaire de la liste.' }],
      },
    }));
    const result = await submit([...profileEntries, ['documents', 'charter'], ['documents', 'terms']]);
    expect(result).toMatchObject({
      status: 422,
      data: { errors: [{ field: 'timezone', message: 'Choisissez un fuseau horaire de la liste.' }] },
    });
  });

  it('profil puis acceptations, chacune avec sa clé d’idempotence, puis l’espace Compte', async () => {
    const calls = stubApi((method) => ({ status: method === 'PATCH' ? 200 : 201, body: pending }));
    let redirected: unknown;
    try {
      await submit([...profileEntries, ['documents', 'charter'], ['documents', 'terms']]);
    } catch (error) {
      redirected = error;
    }
    expect(isRedirect(redirected) && redirected.location).toBe('/account');
    expect(calls.map((c) => [c.method, c.path, c.key])).toEqual([
      ['PATCH', '/v1/users/me', 's1:profile'],
      ['POST', '/v1/users/me/acceptances', 's1:charter:1'],
      ['POST', '/v1/users/me/acceptances', 's1:terms:1'],
    ]);
    // If-Match : l'ETag du profil affiché (champ caché), pas celui relu à l'envoi (« "v1" » dans locals).
    expect(calls[0]?.ifMatch).toBe('"v-affiche"');
    expect(calls[0]?.body).toEqual({
      display_name: 'Ada',
      roles: ['contributor'],
      lang: 'fr',
      timezone: 'Europe/Paris',
    });
  });
});

describe('déconnexion', () => {
  const cookieJar = (token: string | undefined) => {
    const deleted: string[] = [];
    return {
      deleted,
      cookies: { get: () => token, delete: (name: string) => deleted.push(name) },
    };
  };

  it('révoque la session du cookie même si le profil n’a pas pu être chargé', async () => {
    const calls = stubApi(() => ({ status: 204 }));
    const jar = cookieJar('jeton');
    let redirected: unknown;
    try {
      await logout({
        locals: { lang: 'fr', user: null, session: null, etag: null },
        cookies: jar.cookies,
      } as never);
    } catch (error) {
      redirected = error;
    }
    expect(isRedirect(redirected) && redirected.location).toBe('/');
    expect(calls.map((c) => [c.method, c.path, c.cookie])).toEqual([
      ['POST', '/v1/auth/logout', 'th_session=jeton'],
    ]);
    expect(jar.deleted).toEqual(['th_session']);
  });

  it('si l’API ne révoque pas la session, le cookie est gardé et l’erreur affichée', async () => {
    vi.stubGlobal('fetch', async () => {
      throw new TypeError('fetch failed');
    });
    const jar = cookieJar('jeton');
    await expect(
      logout({
        locals: { lang: 'fr', user: null, session: null, etag: null },
        cookies: jar.cookies,
      } as never),
    ).rejects.toMatchObject({ status: 503 });
    expect(jar.deleted).toEqual([]);
  });
});
