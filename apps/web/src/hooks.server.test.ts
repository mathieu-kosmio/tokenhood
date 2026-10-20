// Crochet serveur : utilisateur connecté, langue du profil, mise à jour du profil sur choix explicite,
// redirection vers l'inscription tant qu'elle est incomplète, cookie de session expiré effacé.
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Me } from '#lib/identity.js';
import { handle } from './hooks.server.js';

const me = (over: Partial<Me> = {}): Me => ({
  id: 'u1',
  display_name: 'Ada',
  roles: ['contributor'],
  lang: 'en',
  timezone: 'Europe/Paris',
  admin: false,
  github: { id: '1', login: 'ada' },
  registration: { complete: true, missing: [], documents: [] },
  ...over,
});

interface Call {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: unknown;
}

function stubApi(profile: Me | 'expired') {
  const calls: Call[] = [];
  vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
    const headers = init.headers as Record<string, string>;
    const body = init.body ? JSON.parse(String(init.body)) : null;
    calls.push({ method: init.method ?? 'GET', url, headers, body });
    if (profile === 'expired')
      return new Response(JSON.stringify({ error: 'unauthenticated' }), { status: 401 });
    const current = init.method === 'PATCH' ? { ...profile, ...body } : profile;
    return new Response(JSON.stringify(current), {
      status: 200,
      headers: { etag: init.method === 'PATCH' ? '"v2"' : '"v1"' },
    });
  });
  return calls;
}

async function run(path: string, cookies: Record<string, string>, acceptLanguage = 'fr-FR') {
  const jar = { ...cookies };
  const deleted: string[] = [];
  const event = {
    url: new URL(`http://localhost:3001${path}`),
    request: new Request(`http://localhost:3001${path}`, { headers: { 'accept-language': acceptLanguage } }),
    locals: {} as App.Locals,
    cookies: {
      get: (name: string) => jar[name],
      set: (name: string, value: string) => {
        jar[name] = value;
      },
      delete: (name: string) => {
        deleted.push(name);
        delete jar[name];
      },
    },
  };
  const resolve = async () => new Response('<html lang="%lang%"></html>');
  const response = await handle({ event, resolve } as unknown as Parameters<typeof handle>[0]);
  return { response, locals: event.locals, jar, deleted };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('crochet serveur', () => {
  it('sans cookie de session : aucun appel à l’API, langue du navigateur', async () => {
    const calls = stubApi(me());
    const { locals } = await run('/', {}, 'en-US');
    expect(calls).toEqual([]);
    expect(locals).toMatchObject({ lang: 'en', user: null, session: null });
  });

  it('connecté : la langue du profil prime sur le cookie et le navigateur', async () => {
    const calls = stubApi(me({ lang: 'en' }));
    const { locals, jar } = await run('/', { th_session: 'jeton', lang: 'fr' }, 'fr-FR');
    expect(calls.map((c) => `${c.method} ${c.url}`)).toEqual(['GET http://localhost:3000/v1/users/me']);
    expect(calls[0]?.headers.cookie).toBe('th_session=jeton');
    expect(locals).toMatchObject({ lang: 'en', session: 'jeton', etag: '"v1"' });
    expect(jar.lang).toBe('en');
  });

  it('connecté : un choix explicite met le profil à jour, avec If-Match et Idempotency-Key', async () => {
    const calls = stubApi(me({ lang: 'en' }));
    const { locals } = await run('/?lang=fr', { th_session: 'jeton' });
    const patch = calls.find((c) => c.method === 'PATCH');
    expect(patch?.body).toEqual({ lang: 'fr' });
    expect(patch?.headers['if-match']).toBe('"v1"');
    expect(patch?.headers['idempotency-key']).toMatch(/^[0-9a-f-]{36}$/);
    expect(locals).toMatchObject({ lang: 'fr', etag: '"v2"', user: { lang: 'fr' } });
  });

  it('inscription incomplète : toute page hors du parcours mène à l’inscription', async () => {
    stubApi(me({ registration: { complete: false, missing: ['documents'], documents: [] } }));
    const home = await run('/', { th_session: 'jeton' });
    expect(home.response.status).toBe(303);
    expect(home.response.headers.get('location')).toBe('/registration');
    const registration = await run('/registration', { th_session: 'jeton' });
    expect(registration.response.status).toBe(200);
  });

  it('session expirée : cookie effacé, visiteur anonyme', async () => {
    stubApi('expired');
    const { locals, deleted } = await run('/', { th_session: 'perime' });
    expect(deleted).toEqual(['th_session']);
    expect(locals.user).toBeNull();
  });
});
