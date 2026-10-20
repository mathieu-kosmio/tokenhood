// Parcours HTTP du module identity sur PostgreSQL (TEST_DATABASE_URL), contre un GitHub simulé sans réseau :
// connexion, cookie de session, profil (ETag, If-Match), idempotence, documents, déconnexion.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createTestDatabase, type TestDatabase } from '@tokenhood/db/testing';
import { authorize, operation } from '@tokenhood/core/common';
import { DOCUMENTS } from '@tokenhood/core/identity';
import { fakeGitHub } from '@tokenhood/core/identity/testing';
import { buildApp } from '../../app.js';
import { run as adminCommand } from '../../cli/admin.js';
import { configFromEnv } from '../../config.js';

const env = {
  GITHUB_CLIENT_ID: 'Iv1.test',
  GITHUB_CLIENT_SECRET: 'secret-de-test',
  SESSION_SECRET: 'cle-de-session-de-test-de-32-caracteres',
  NODE_ENV: 'production',
  PUBLIC_API_URL: 'https://api.tokenhood.test',
  PUBLIC_WEB_URL: 'https://app.tokenhood.test',
  SESSION_COOKIE_DOMAIN: 'tokenhood.test',
};
const config = configFromEnv(env);

let t: TestDatabase;
let app: Awaited<ReturnType<typeof buildApp>>;
let gh: ReturnType<typeof fakeGitHub>;
let now: Date;
let key = 0;
// Un compte GitHub distinct par test : chaque test part d'un utilisateur neuf.
let accountId = 4100;
const idem = () => ({ 'idempotency-key': `cle-${++key}` });

interface Cookie {
  value: string;
  attributes: string;
}
const cookiesOf = (header: string | string[] | undefined): Record<string, Cookie> => {
  const list = Array.isArray(header) ? header : header ? [header] : [];
  return Object.fromEntries(
    list.map((c) => {
      const [pair = '', ...attrs] = c.split('; ');
      const [name = '', value = ''] = pair.split('=');
      return [name, { value, attributes: attrs.join('; ') }];
    }),
  );
};

// Connexion complète : départ, approbation sur GitHub (simulé), rappel. Renvoie le jeton de session.
async function signIn(
  query = 'return_to=/account/profile&lang=en',
): Promise<{ token: string; location: string }> {
  const start = await app.inject({ method: 'GET', url: `/v1/auth/github/start?${query}` });
  expect(start.statusCode).toBe(302);
  const state = cookiesOf(start.headers['set-cookie']).th_oauth_state!;
  const { code, state: returned } = gh.approve(String(start.headers.location));
  const callback = await app.inject({
    method: 'GET',
    url: `/v1/auth/github/callback?code=${code}&state=${returned}`,
    cookies: { th_oauth_state: state.value },
  });
  expect(callback.statusCode).toBe(302);
  return {
    token: cookiesOf(callback.headers['set-cookie']).th_session?.value ?? '',
    location: String(callback.headers.location),
  };
}

const me = (token: string, lang = 'fr') =>
  app.inject({
    method: 'GET',
    url: '/v1/users/me',
    cookies: { th_session: token },
    headers: { 'accept-language': lang },
  });

const patch = (token: string, payload: object, headers: Record<string, string>) =>
  app.inject({ method: 'PATCH', url: '/v1/users/me', cookies: { th_session: token }, payload, headers });

beforeAll(async () => {
  t = await createTestDatabase();
});

beforeEach(async () => {
  now = new Date('2026-10-20T09:00:00.000Z');
  accountId += 1;
  gh = fakeGitHub({
    config: config.auth!.github,
    account: { id: accountId, login: 'ada-l', name: 'Ada Lovelace' },
  });
  await app?.close();
  app = await buildApp({ db: t.db, config, fetch: gh.fetch, clock: () => now });
  // Route de démonstration d'une opération ordinaire : refusée tant que l'inscription est incomplète.
  app.get('/v1/test/registered', async (request) => {
    authorize(request.actor, operation('test.registered'));
    return { ok: true };
  });
  await app.ready();
});

afterAll(async () => {
  await app?.close();
  await t?.drop();
});

describe('connexion par GitHub', () => {
  it('départ : redirection vers GitHub avec état et PKCE S256, cookie d’état propre à l’API', async () => {
    const res = await app.inject({ method: 'GET', url: '/v1/auth/github/start' });
    const url = new URL(String(res.headers.location));
    expect(url.searchParams.get('redirect_uri')).toBe('https://api.tokenhood.test/v1/auth/github/callback');
    expect(url.searchParams.get('scope')).toBe('read:user user:email');
    expect(url.searchParams.get('code_challenge_method')).toBe('S256');
    const state = cookiesOf(res.headers['set-cookie']).th_oauth_state!;
    expect(state.value).toBe(url.searchParams.get('state'));
    expect(state.attributes).toContain('Path=/v1/auth/github');
    expect(state.attributes).toContain('HttpOnly');
    expect(state.attributes).not.toContain('Domain=');
  });

  it('rappel : cookie de session HttpOnly, SameSite=Lax, Secure, partagé avec l’interface web', async () => {
    const start = await app.inject({
      method: 'GET',
      url: '/v1/auth/github/start?return_to=/account/profile',
    });
    const state = cookiesOf(start.headers['set-cookie']).th_oauth_state!;
    const { code } = gh.approve(String(start.headers.location));
    const res = await app.inject({
      method: 'GET',
      url: `/v1/auth/github/callback?code=${code}&state=${state.value}`,
      cookies: { th_oauth_state: state.value },
    });
    expect(res.headers.location).toBe('https://app.tokenhood.test/account/profile');
    const session = cookiesOf(res.headers['set-cookie']).th_session!;
    expect(session.value).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(session.attributes).toMatch(/Domain=tokenhood\.test/);
    expect(session.attributes).toMatch(/Path=\//);
    expect(session.attributes).toMatch(/Expires=/);
    expect(session.attributes).toMatch(/HttpOnly/);
    expect(session.attributes).toMatch(/Secure/);
    expect(session.attributes).toMatch(/SameSite=Lax/);
    expect(cookiesOf(res.headers['set-cookie']).th_oauth_state?.value).toBe('');
  });

  it('rappel sans le cookie d’état : refus, retour à la page de connexion', async () => {
    const start = await app.inject({ method: 'GET', url: '/v1/auth/github/start' });
    const { code, state } = gh.approve(String(start.headers.location));
    const res = await app.inject({
      method: 'GET',
      url: `/v1/auth/github/callback?code=${code}&state=${state}`,
    });
    expect(res.headers.location).toBe('https://app.tokenhood.test/login?error=state_invalid');
    expect(cookiesOf(res.headers['set-cookie']).th_session).toBeUndefined();
  });

  it('compte sans email principal vérifié : refus explicite', async () => {
    gh.state.emails = [{ email: 'a@example.org', primary: true, verified: false }];
    const start = await app.inject({ method: 'GET', url: '/v1/auth/github/start' });
    const state = cookiesOf(start.headers['set-cookie']).th_oauth_state!;
    const { code } = gh.approve(String(start.headers.location));
    const res = await app.inject({
      method: 'GET',
      url: `/v1/auth/github/callback?code=${code}&state=${state.value}`,
      cookies: { th_oauth_state: state.value },
    });
    expect(res.headers.location).toBe('https://app.tokenhood.test/login?error=email_unverified');
  });

  it('une adresse de retour vers une autre origine est remplacée par l’espace Compte', async () => {
    const { location } = await signIn('return_to=//evil.example/');
    expect(location).toBe('https://app.tokenhood.test/account');
  });
});

describe('/v1/users/me', () => {
  it('sans session : 401 localisé', async () => {
    const res = await me('jeton-inconnu', 'en');
    expect(res.statusCode).toBe(401);
    expect(res.json()).toEqual({ error: 'unauthenticated', message: 'Sign-in required.' });
  });

  it('profil, langue initiale et inscription incomplète ; ETag', async () => {
    const { token } = await signIn();
    const res = await me(token);
    expect(res.statusCode).toBe(200);
    expect(res.headers.etag).toBe('"v1"');
    expect(res.json()).toMatchObject({
      display_name: 'Ada Lovelace',
      lang: 'en',
      roles: [],
      timezone: null,
      admin: false,
      github: { id: String(accountId), login: 'ada-l' },
      registration: { complete: false, missing: ['timezone', 'roles', 'documents'] },
    });
    expect(res.json().registration.documents.map((d: { id: string }) => d.id)).toEqual([
      'charter',
      'terms',
      'privacy',
    ]);
  });

  it('modification : If-Match requis, ETag périmé refusé, nouvel ETag, idempotence', async () => {
    const { token } = await signIn();
    const etag = (await me(token)).headers.etag as string;
    expect((await patch(token, { lang: 'fr' }, idem())).statusCode).toBe(428);
    const stale = await patch(
      token,
      { lang: 'fr' },
      { ...idem(), 'if-match': '"v999"', 'accept-language': 'fr' },
    );
    expect(stale.statusCode).toBe(412);
    expect(stale.json().message).toBe(
      'La ressource a changé depuis votre lecture : relisez-la puis recommencez.',
    );
    const headers = { 'idempotency-key': 'profil-1', 'if-match': etag };
    const first = await patch(token, { display_name: 'Ada King', timezone: 'Europe/London' }, headers);
    expect(first.statusCode).toBe(200);
    expect(first.headers.etag).not.toBe(etag);
    const replay = await patch(token, { display_name: 'Ada King', timezone: 'Europe/London' }, headers);
    expect(replay.statusCode).toBe(200);
    expect(replay.headers['idempotent-replayed']).toBe('true');
    expect(replay.json()).toEqual(first.json());
    expect(replay.headers.etag).toBe(first.headers.etag);
    const reused = await patch(token, { display_name: 'Autre' }, headers);
    expect(reused.statusCode).toBe(422);
    expect(reused.json().error).toBe('idempotency_key_reused');
    const audit = await t.pool.query(
      "select count(*)::int as n from audit_events where action = 'identity.profile.updated' and subject_id = $1",
      [first.json().id],
    );
    expect(audit.rows[0].n).toBe(1);
  });

  it('erreurs de validation reliées à leur champ, localisées', async () => {
    const { token } = await signIn();
    const etag = (await me(token)).headers.etag as string;
    const res = await patch(
      token,
      { display_name: ' ', roles: [], timezone: 'Mars/Olympus' },
      {
        ...idem(),
        'if-match': etag,
        'accept-language': 'en',
      },
    );
    expect(res.statusCode).toBe(422);
    expect(res.json()).toEqual({
      error: 'validation_failed',
      message: '3 fields need fixing.',
      fields: [
        {
          field: 'display_name',
          message: 'Enter a name of 1 to 80 characters, without invisible characters.',
        },
        { field: 'roles', message: 'Choose at least one role.' },
        { field: 'timezone', message: 'Choose a time zone from the list.' },
      ],
    });
  });

  it('inscription incomplète : seul le parcours d’inscription est ouvert, puis tout l’est', async () => {
    const { token } = await signIn();
    const blocked = await app.inject({
      method: 'GET',
      url: '/v1/test/registered',
      cookies: { th_session: token },
    });
    expect(blocked.statusCode).toBe(403);
    expect(blocked.json().error).toBe('registration_incomplete');
    const etag = (await me(token)).headers.etag as string;
    await patch(token, { roles: ['contributor'], timezone: 'Europe/Paris' }, { ...idem(), 'if-match': etag });
    for (const d of DOCUMENTS) {
      const res = await app.inject({
        method: 'POST',
        url: '/v1/users/me/acceptances',
        cookies: { th_session: token },
        payload: { document: d.id, version: d.version },
        headers: idem(),
      });
      expect(res.statusCode).toBe(201);
      expect(res.json()).toMatchObject({
        document: d.id,
        version: d.version,
        accepted_at: now.toISOString(),
      });
    }
    expect((await me(token)).json().registration).toMatchObject({ complete: true, missing: [] });
    const open = await app.inject({
      method: 'GET',
      url: '/v1/test/registered',
      cookies: { th_session: token },
    });
    expect(open.statusCode).toBe(200);
    const history = await app.inject({
      method: 'GET',
      url: '/v1/users/me/acceptances?limit=2',
      cookies: { th_session: token },
    });
    expect(history.json().items).toHaveLength(2);
    expect(history.json().next_cursor).toEqual(expect.any(String));
  });

  it('accepter une version périmée : 409 localisé', async () => {
    const { token } = await signIn();
    const res = await app.inject({
      method: 'POST',
      url: '/v1/users/me/acceptances',
      cookies: { th_session: token },
      payload: { document: 'terms', version: 3 },
      headers: { ...idem(), 'accept-language': 'en' },
    });
    expect(res.statusCode).toBe(409);
    expect(res.json()).toEqual({
      error: 'document_version_outdated',
      message: 'This document changed: the current version of “terms” is 1. Read it again, then accept it.',
    });
  });
});

describe('sessions', () => {
  it('une session expirée n’authentifie plus', async () => {
    const { token } = await signIn();
    now = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
    expect((await me(token)).statusCode).toBe(401);
  });

  it('la déconnexion révoque la session, efface le cookie et s’inscrit au journal', async () => {
    const { token } = await signIn();
    const res = await app.inject({
      method: 'POST',
      url: '/v1/auth/logout',
      cookies: { th_session: token },
      headers: idem(),
    });
    expect(res.statusCode).toBe(204);
    const cleared = cookiesOf(res.headers['set-cookie']).th_session!;
    expect(cleared.value).toBe('');
    expect(cleared.attributes).toMatch(/Domain=tokenhood\.test/);
    expect((await me(token)).statusCode).toBe(401);
    const revoked = await t.pool.query(
      "select count(*)::int as n from audit_events where action = 'identity.session.revoked'",
    );
    expect(revoked.rows[0].n).toBeGreaterThanOrEqual(1);
  });
});

describe('base présente, secrets OAuth absents', () => {
  it('la plateforme démarre : connexion indisponible, aucune session résolue', async () => {
    const bare = await buildApp({ db: t.db, config: configFromEnv({}) });
    await bare.ready();
    try {
      expect((await bare.inject({ method: 'GET', url: '/v1/auth/providers' })).json()).toEqual({
        github: { available: false },
      });
      const res = await bare.inject({
        method: 'GET',
        url: '/v1/users/me',
        cookies: { th_session: 'quelconque' },
      });
      expect(res.statusCode).toBe(401);
    } finally {
      await bare.close();
    }
  });
});

describe('idempotence', () => {
  it('la portée d’une clé est la session : la même clé depuis une autre session n’est pas rejouée', async () => {
    const first = await signIn();
    const second = await signIn();
    for (const token of [first.token, second.token]) {
      const res = await app.inject({
        method: 'POST',
        url: '/v1/auth/logout',
        cookies: { th_session: token },
        headers: { 'idempotency-key': 'meme-cle' },
      });
      expect(res.headers['idempotent-replayed']).toBeUndefined();
    }
    expect((await me(first.token)).statusCode).toBe(401);
    expect((await me(second.token)).statusCode).toBe(401);
  });

  it('une requête en cours bloque sa clé (409) ; périmée, la clé est reprise', async () => {
    const { token } = await signIn();
    const profile = await me(token);
    const userId: string = profile.json().id;
    const session = await t.pool.query(
      'select id from sessions where user_id = $1 order by created_at desc limit 1',
      [userId],
    );
    const scope = `human:${userId}:${session.rows[0].id}`;
    await t.pool.query(
      "insert into idempotency_keys (scope, key, request_hash, created_at) values ($1, 'en-cours', 'autre', $2)",
      [scope, now],
    );
    const headers = { 'idempotency-key': 'en-cours', 'if-match': profile.headers.etag as string };
    const blocked = await patch(token, { timezone: 'Europe/Paris' }, headers);
    expect(blocked.statusCode).toBe(409);
    expect(blocked.json().error).toBe('idempotency_in_progress');
    await t.pool.query("update idempotency_keys set created_at = $2 where scope = $1 and key = 'en-cours'", [
      scope,
      new Date(now.getTime() - 3 * 60 * 1000),
    ]);
    const taken = await patch(token, { timezone: 'Europe/Paris' }, headers);
    expect(taken.statusCode).toBe(200);
    const replay = await patch(token, { timezone: 'Europe/Paris' }, headers);
    expect(replay.headers['idempotent-replayed']).toBe('true');
  });
});

describe('commande d’exploitation du rôle administrateur', () => {
  it('attribue le rôle par identifiant numérique GitHub', async () => {
    const { token } = await signIn();
    const lines: string[] = [];
    expect(
      await adminCommand(['grant', '--github-id', String(accountId)], { DATABASE_URL: t.url }, (l) =>
        lines.push(l),
      ),
    ).toBe(0);
    expect(lines[0]).toMatch(/rôle administrateur attribué/);
    expect((await me(token)).json().admin).toBe(true);
    expect(await adminCommand(['grant'], { DATABASE_URL: t.url }, (l) => lines.push(l))).toBe(2);
    expect(await adminCommand(['grant', 'inconnu-xyz'], { DATABASE_URL: t.url }, (l) => lines.push(l))).toBe(
      1,
    );
    expect(lines.at(-1)).toBe(
      'Erreur unknown_user : Aucun utilisateur rattaché au compte GitHub inconnu-xyz.',
    );
  });
});
