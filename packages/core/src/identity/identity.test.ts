import { describe, expect, it } from 'vitest';
import { DOCUMENTS } from './documents.js';
import {
  authorizeUrl,
  exchangeCode,
  fetchAccount,
  GitHubError,
  GITHUB_SCOPES,
  revokeToken,
} from './github.js';
import { identityOperations } from './operations.js';
import { DISPLAY_NAME_MAX, timezones, validateProfile } from './profile.js';
import { registrationStatus } from './registration.js';
import { fakeGitHub } from './testing/index.js';
import { keyedHash, pkceChallenge, randomToken, safeReturnTo } from './tokens.js';

const config = {
  clientId: 'Iv1.test',
  clientSecret: 'secret-de-test',
  redirectUri: 'https://api.example/cb',
};

describe('jetons et PKCE', () => {
  it('calcule le défi S256 de la RFC 7636 (annexe B)', () => {
    expect(pkceChallenge('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk')).toBe(
      'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
    );
  });

  it('produit des jetons opaques de 256 bits, condensés avec la clé', () => {
    const token = randomToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(randomToken()).not.toBe(token);
    expect(keyedHash('k1', token)).toMatch(/^[0-9a-f]{64}$/);
    expect(keyedHash('k1', token)).not.toBe(keyedHash('k2', token));
  });

  it.each([
    ['/account/profile', '/account/profile'],
    ['/registration?x=1', '/registration?x=1'],
    [undefined, '/account'],
    ['https://evil.example/', '/account'],
    ['//evil.example/', '/account'],
    ['/\\evil.example', '/account'],
    ['/a\nb', '/account'],
    ['account', '/account'],
  ])('adresse de retour %s → %s', (input, expected) => {
    expect(safeReturnTo(input)).toBe(expected);
  });
});

describe('client OAuth GitHub', () => {
  it('demande read:user et user:email seulement, avec état et PKCE S256', () => {
    const url = new URL(authorizeUrl(config, { state: 'etat', codeChallenge: 'defi' }));
    expect(url.origin + url.pathname).toBe('https://github.com/login/oauth/authorize');
    expect(Object.fromEntries(url.searchParams)).toMatchObject({
      client_id: 'Iv1.test',
      redirect_uri: 'https://api.example/cb',
      scope: 'read:user user:email',
      state: 'etat',
      code_challenge: 'defi',
      code_challenge_method: 'S256',
    });
    expect(GITHUB_SCOPES).toEqual(['read:user', 'user:email']);
  });

  it('échange le code avec le vérificateur PKCE, lit le compte puis révoque le jeton', async () => {
    const gh = fakeGitHub({ config });
    const verifier = randomToken();
    const { code } = gh.approve(authorizeUrl(config, { state: 's', codeChallenge: pkceChallenge(verifier) }));
    const token = await exchangeCode(config, gh.fetch, { code, codeVerifier: verifier });
    expect(await fetchAccount(gh.fetch, token)).toEqual({
      id: 4102,
      login: 'ada-l',
      name: 'Ada Lovelace',
      verifiedPrimaryEmail: true,
    });
    expect(await revokeToken(config, gh.fetch, token)).toBe(true);
    expect(gh.revoked).toEqual([token]);
    await expect(fetchAccount(gh.fetch, token)).rejects.toBeInstanceOf(GitHubError);
  });

  it('refuse un vérificateur PKCE qui ne correspond pas au défi, et un code rejoué', async () => {
    const gh = fakeGitHub({ config });
    const verifier = randomToken();
    const { code } = gh.approve(authorizeUrl(config, { state: 's', codeChallenge: pkceChallenge(verifier) }));
    await expect(exchangeCode(config, gh.fetch, { code, codeVerifier: randomToken() })).rejects.toMatchObject(
      {
        failure: 'exchange_failed',
      },
    );
    await expect(exchangeCode(config, gh.fetch, { code, codeVerifier: verifier })).rejects.toMatchObject({
      failure: 'exchange_failed',
    });
  });

  it.each([
    [[{ email: 'a@x.org', primary: true, verified: false }], false],
    [[{ email: 'a@x.org', primary: false, verified: true }], false],
    [[], false],
    [
      [
        { email: 'a@x.org', primary: false, verified: true },
        { email: 'b@x.org', primary: true, verified: true },
      ],
      true,
    ],
  ])('email principal vérifié : %j → %s', async (emails, expected) => {
    const gh = fakeGitHub({ config, emails });
    const verifier = randomToken();
    const { code } = gh.approve(authorizeUrl(config, { state: 's', codeChallenge: pkceChallenge(verifier) }));
    const token = await exchangeCode(config, gh.fetch, { code, codeVerifier: verifier });
    expect((await fetchAccount(gh.fetch, token)).verifiedPrimaryEmail).toBe(expected);
  });

  it('une panne réseau devient une erreur GitHub typée', async () => {
    const down = async () => {
      throw new TypeError('fetch failed');
    };
    await expect(exchangeCode(config, down, { code: 'c', codeVerifier: 'v' })).rejects.toMatchObject({
      failure: 'exchange_failed',
    });
    await expect(fetchAccount(down, 't')).rejects.toMatchObject({ failure: 'profile_failed' });
    expect(await revokeToken(config, down, 't')).toBe(false);
  });
});

describe('profil', () => {
  it('normalise et accepte un profil complet', () => {
    expect(
      validateProfile({
        displayName: '  Ada   Lovelace ',
        roles: ['maintainer', 'contributor'],
        lang: 'en',
        timezone: 'Europe/Paris',
      }),
    ).toEqual({
      changes: {
        displayName: 'Ada Lovelace',
        roles: ['contributor', 'maintainer'],
        lang: 'en',
        timezone: 'Europe/Paris',
      },
      errors: [],
    });
    expect(validateProfile({ timezone: 'UTC' }).errors).toEqual([]);
  });

  it.each([
    [{ displayName: '   ' }, 'display_name'],
    [{ displayName: 'x'.repeat(DISPLAY_NAME_MAX + 1) }, 'display_name'],
    [{ displayName: 'Ada‮ecalovoL' }, 'display_name'],
    [{ roles: [] }, 'roles'],
    [{ roles: ['admin'] }, 'roles'],
    [{ lang: 'de' }, 'lang'],
    [{ timezone: 'Mars/Olympus' }, 'timezone'],
  ])('refuse %j (champ %s)', (input, field) => {
    expect(validateProfile(input).errors.map((e) => e.field)).toEqual([field]);
  });

  it('la liste des fuseaux contient UTC et les fuseaux IANA', () => {
    expect(timezones()).toEqual(expect.arrayContaining(['UTC', 'Europe/Paris', 'America/Toronto']));
  });
});

describe('inscription', () => {
  const at = new Date('2026-10-20T10:00:00Z');
  const all = DOCUMENTS.map((d) => ({ document: d.id, version: d.version, acceptedAt: at }));
  const profile = { timezone: 'Europe/Paris', roles: ['contributor'] };

  it('complète avec fuseau, rôle et chaque document accepté dans sa version courante', () => {
    expect(registrationStatus(profile, all)).toMatchObject({ complete: true, missing: [] });
  });

  it('incomplète tant qu’un élément manque', () => {
    expect(registrationStatus({ timezone: null, roles: [] }, []).missing).toEqual([
      'timezone',
      'roles',
      'documents',
    ]);
    expect(registrationStatus(profile, all.slice(1))).toMatchObject({
      complete: false,
      missing: ['documents'],
    });
  });

  it('une nouvelle version d’un document rend l’inscription de nouveau incomplète', () => {
    const v2 = DOCUMENTS.map((d) => (d.id === 'terms' ? { ...d, version: 2 } : d));
    const status = registrationStatus(profile, all, v2);
    expect(status.complete).toBe(false);
    expect(status.documents.find((d) => d.id === 'terms')).toMatchObject({
      version: 2,
      accepted: { version: 1, at },
      current: false,
    });
  });

  it('la liste versionnée porte un identifiant, une version et une adresse FR et EN par document', () => {
    expect(DOCUMENTS.map((d) => d.id)).toEqual(['charter', 'terms', 'privacy']);
    for (const d of DOCUMENTS) {
      expect(Number.isInteger(d.version) && d.version >= 1).toBe(true);
      expect(new URL(d.url.fr).protocol).toBe('https:');
      expect(new URL(d.url.en).protocol).toBe('https:');
    }
  });
});

describe('opérations du module', () => {
  it('toutes sont fermées aux agents et ouvertes pendant l’inscription', () => {
    for (const op of Object.values(identityOperations)) {
      expect(op.agents).toBe(false);
      expect(op.humans).toBe('registering');
    }
  });
});
