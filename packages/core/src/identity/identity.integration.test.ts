// Module identity sur PostgreSQL (TEST_DATABASE_URL) : connexion GitHub simulée, sessions, profil, documents,
// acteurs agents, rôle administrateur et journal d'audit.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestDatabase, type TestDatabase } from '@tokenhood/db/testing';
import { history } from '../audit/index.js';
import {
  authorize,
  DomainError,
  operation,
  uuidv7,
  type AgentActor,
  type HumanActor,
} from '../common/index.js';
import type { GitHubContext } from './context.js';
import { DOCUMENTS } from './documents.js';
import { fakeGitHub } from './testing/index.js';
import { setAdmin } from './admin.js';
import { resolveSession, revokeSession } from './sessions.js';
import { beginGitHubSignIn, completeGitHubSignIn, signInWithGitHubAccount, SignInError } from './sign-in.js';
import { acceptDocument, getMe, listAcceptances, updateMe } from './users.js';

let t: TestDatabase;
let now = new Date('2026-10-20T08:00:00.000Z');
const clock = () => now;
const github = {
  clientId: 'Iv1.test',
  clientSecret: 'secret-de-test',
  redirectUri: 'https://api.example/v1/auth/github/callback',
};
const ctx = (gh = fakeGitHub({ config: github })): GitHubContext => ({
  db: t.db,
  clock,
  sessionSecret: 'cle-de-session-de-test-de-32-caracteres',
  github,
  fetch: gh.fetch,
});

const failure = async (promise: Promise<unknown>) => {
  try {
    await promise;
  } catch (error) {
    if (error instanceof SignInError) return error.reason;
    if (error instanceof DomainError) return `${error.status} ${error.code}`;
    throw error;
  }
  return 'ok';
};

// Connexion complète contre le GitHub simulé ; renvoie la session et l'acteur résolu.
async function signIn(gh = fakeGitHub({ config: github }), returnTo = '/account') {
  const c = ctx(gh);
  const { url, state } = await beginGitHubSignIn(c, { returnTo, lang: 'en' });
  const { code, state: returned } = gh.approve(url);
  const signedIn = await completeGitHubSignIn(c, { state: returned, code, cookieState: state });
  const resolved = await resolveSession(c, signedIn.session.token);
  return { ...signedIn, actor: resolved!.actor, gh };
}

const register = async (actor: HumanActor) => {
  const me = await getMe(ctx(), actor);
  await updateMe(ctx(), actor, { roles: ['contributor'], timezone: 'Europe/Paris' }, me.version);
  for (const d of DOCUMENTS) await acceptDocument(ctx(), actor, { document: d.id, version: d.version });
};

beforeAll(async () => {
  t = await createTestDatabase();
});

afterAll(async () => {
  await t?.drop();
});

describe('connexion GitHub', () => {
  it('crée le compte à la première connexion, rattaché à l’identifiant numérique GitHub', async () => {
    const { userId, created, returnTo, actor } = await signIn();
    expect(created).toBe(true);
    expect(returnTo).toBe('/account');
    expect(actor).toMatchObject({ kind: 'human', userId, admin: false, registered: false });
    const me = await getMe(ctx(), actor);
    expect(me).toMatchObject({
      displayName: 'Ada Lovelace',
      lang: 'en',
      github: { id: '4102', login: 'ada-l' },
    });
    const events = await history(t.db, { type: 'user', id: userId });
    expect(events.map((e) => e.action)).toEqual(['identity.account.created']);
    expect(events[0]).toMatchObject({ actorKind: 'human', actorId: userId, data: { provider: 'github' } });
  });

  it('retrouve le même compte si le login GitHub change', async () => {
    const first = await signIn();
    const gh = fakeGitHub({ config: github, account: { id: 4102, login: 'ada-renamed', name: null } });
    const second = await signIn(gh);
    expect(second.created).toBe(false);
    expect(second.userId).toBe(first.userId);
    expect((await getMe(ctx(), second.actor)).github).toEqual({ id: '4102', login: 'ada-renamed' });
  });

  it('un autre identifiant numérique avec l’ancien login donne un autre compte', async () => {
    const gh = fakeGitHub({ config: github, account: { id: 9999, login: 'ada-l', name: 'Homonyme' } });
    const other = await signIn(gh);
    expect(other.created).toBe(true);
    const ada = await signIn();
    expect(other.userId).not.toBe(ada.userId);
  });

  it('l’état est à usage unique et lié au navigateur', async () => {
    const gh = fakeGitHub({ config: github });
    const c = ctx(gh);
    const { url, state } = await beginGitHubSignIn(c, { lang: 'fr' });
    const { code } = gh.approve(url);
    expect(await failure(completeGitHubSignIn(c, { state, code, cookieState: 'autre-navigateur' }))).toBe(
      'state_invalid',
    );
    expect(await failure(completeGitHubSignIn(c, { state, code }))).toBe('state_invalid');
    expect(await failure(completeGitHubSignIn(c, { state, code, cookieState: state }))).toBe('ok');
    expect(await failure(completeGitHubSignIn(c, { state, code, cookieState: state }))).toBe('state_invalid');
  });

  it('un état expiré est refusé', async () => {
    const gh = fakeGitHub({ config: github });
    const c = ctx(gh);
    const { url, state } = await beginGitHubSignIn(c, { lang: 'fr' });
    const { code } = gh.approve(url);
    now = new Date(now.getTime() + 11 * 60_000);
    expect(await failure(completeGitHubSignIn(c, { state, code, cookieState: state }))).toBe('state_invalid');
  });

  it('refus explicite sur GitHub : aucune lecture, état consommé', async () => {
    const gh = fakeGitHub({ config: github });
    const c = ctx(gh);
    const { state } = await beginGitHubSignIn(c, { lang: 'fr' });
    expect(
      await failure(completeGitHubSignIn(c, { state, error: 'access_denied', cookieState: state })),
    ).toBe('denied');
    expect(gh.calls).toEqual([]);
  });

  it('refuse un compte sans email principal vérifié, sans rien créer', async () => {
    const gh = fakeGitHub({
      config: github,
      account: { id: 777, login: 'sans-email', name: null },
      emails: [{ email: 'x@example.org', primary: true, verified: false }],
    });
    const c = ctx(gh);
    const { url, state } = await beginGitHubSignIn(c, { lang: 'fr' });
    const { code } = gh.approve(url);
    expect(await failure(completeGitHubSignIn(c, { state, code, cookieState: state }))).toBe(
      'email_unverified',
    );
    const found = await t.pool.query("select 1 from identities where subject = '777'");
    expect(found.rowCount).toBe(0);
    expect(gh.revoked).toHaveLength(1);
  });

  it('le jeton GitHub est révoqué et ne figure nulle part en base, ni l’adresse email', async () => {
    const { gh, session } = await signIn();
    expect(gh.issued).toHaveLength(1);
    expect(gh.revoked).toEqual(gh.issued);
    const dump = await t.pool.query(`
      select string_agg(t::text, ' ') as all from (
        select row_to_json(u)::text as t from users u union all select row_to_json(i)::text from identities i
        union all select row_to_json(s)::text from sessions s union all select row_to_json(o)::text from oauth_states o
        union all select row_to_json(a)::text from audit_events a) x`);
    const all: string = dump.rows[0].all;
    expect(all).not.toContain(gh.issued[0]);
    expect(all).not.toContain('ada@example.org');
    expect(all).not.toContain(session.token);
  });
});

describe('sessions', () => {
  it('le jeton n’est conservé que haché et expire', async () => {
    const { session, userId } = await signIn();
    const stored = await t.pool.query('select token_hash, expires_at from sessions where id = $1', [
      session.id,
    ]);
    expect(stored.rows[0].token_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(stored.rows[0].token_hash).not.toContain(session.token);
    expect((await resolveSession(ctx(), session.token))?.actor.userId).toBe(userId);
    const saved = now;
    now = new Date(session.expiresAt.getTime() + 1);
    expect(await resolveSession(ctx(), session.token)).toBeNull();
    now = saved;
    expect(await resolveSession(ctx(), 'jeton-inconnu')).toBeNull();
  });

  it('la déconnexion révoque la session et l’inscrit au journal', async () => {
    const { session, actor } = await signIn();
    expect(await revokeSession(ctx(), actor)).toBe(true);
    expect(await resolveSession(ctx(), session.token)).toBeNull();
    expect(await revokeSession(ctx(), actor)).toBe(false);
    const events = await history(t.db, { type: 'session', id: session.id });
    expect(events.map((e) => e.action)).toEqual(['identity.session.revoked']);
  });
});

describe('profil et inscription', () => {
  it('verrou optimiste : version attendue requise, version périmée refusée, modification auditée', async () => {
    const { actor, userId } = await signIn(
      fakeGitHub({ config: github, account: { id: 5001, login: 'grace', name: 'Grace Hopper' } }),
    );
    const me = await getMe(ctx(), actor);
    expect(await failure(updateMe(ctx(), actor, { lang: 'fr' }, null))).toBe('428 precondition_required');
    expect(await failure(updateMe(ctx(), actor, { lang: 'fr' }, me.version + 7))).toBe(
      '412 precondition_failed',
    );
    expect(await failure(updateMe(ctx(), actor, { lang: 'de' }, me.version))).toBe('422 validation_failed');
    const updated = await updateMe(ctx(), actor, { displayName: 'Grace B. Hopper', lang: 'fr' }, me.version);
    expect(updated).toMatchObject({ displayName: 'Grace B. Hopper', lang: 'fr', version: me.version + 1 });
    expect(await failure(updateMe(ctx(), actor, { lang: 'en' }, me.version))).toBe('412 precondition_failed');
    const events = await history(t.db, { type: 'user', id: userId });
    expect(events.at(-1)).toMatchObject({
      action: 'identity.profile.updated',
      data: { fields: ['display_name', 'lang'] },
    });
  });

  it('l’inscription n’est complète qu’après profil et acceptation de chaque document, horodatée', async () => {
    const { actor, userId, session } = await signIn(
      fakeGitHub({ config: github, account: { id: 5002, login: 'katherine', name: 'Katherine Johnson' } }),
    );
    const op = operation('test.registered');
    expect(await failure(Promise.resolve().then(() => authorize(actor, op)))).toBe(
      '403 registration_incomplete',
    );
    const me = await getMe(ctx(), actor);
    await updateMe(
      ctx(),
      actor,
      { roles: ['contributor', 'maintainer'], timezone: 'America/Toronto' },
      me.version,
    );
    for (const d of DOCUMENTS.slice(0, 2))
      await acceptDocument(ctx(), actor, { document: d.id, version: d.version });
    expect((await resolveSession(ctx(), session.token))?.actor.registered).toBe(false);
    now = new Date(now.getTime() + 1000);
    const last = DOCUMENTS[2]!;
    const accepted = await acceptDocument(ctx(), actor, { document: last.id, version: last.version });
    expect(accepted.created).toBe(true);
    expect(accepted.acceptance.acceptedAt).toEqual(now);
    const again = await acceptDocument(ctx(), actor, { document: last.id, version: last.version });
    expect(again).toMatchObject({ created: false, acceptance: { id: accepted.acceptance.id } });
    const resolved = await resolveSession(ctx(), session.token);
    expect(resolved?.actor.registered).toBe(true);
    expect(() => authorize(resolved!.actor, op)).not.toThrow();
    const events = await history(t.db, { type: 'user', id: userId });
    expect(events.filter((e) => e.action === 'identity.document.accepted').map((e) => e.data)).toEqual(
      DOCUMENTS.map((d) => ({ document: d.id, version: d.version })),
    );
  });

  it('refuse un document inconnu ou une version qui n’est pas la courante', async () => {
    const { actor } = await signIn();
    expect(await failure(acceptDocument(ctx(), actor, { document: 'cgv', version: 1 }))).toBe(
      '404 unknown_document',
    );
    expect(await failure(acceptDocument(ctx(), actor, { document: 'terms', version: 2 }))).toBe(
      '409 document_version_outdated',
    );
  });

  it('une nouvelle version d’un document ramène au parcours d’inscription', async () => {
    const { actor, session } = await signIn(
      fakeGitHub({ config: github, account: { id: 5003, login: 'dorothy', name: 'Dorothy Vaughan' } }),
    );
    await register(actor);
    expect((await resolveSession(ctx(), session.token))?.actor.registered).toBe(true);
    const v2 = DOCUMENTS.map((d) => (d.id === 'privacy' ? { ...d, version: 2 } : d));
    const resolved = await resolveSession({ ...ctx(), documents: v2 }, session.token);
    expect(resolved?.actor.registered).toBe(false);
    expect(resolved?.me.registration.missing).toEqual(['documents']);
  });

  it('pagine l’historique des acceptations par curseur, du plus récent au plus ancien', async () => {
    const { actor } = await signIn(
      fakeGitHub({ config: github, account: { id: 5004, login: 'mary', name: 'Mary Jackson' } }),
    );
    for (const d of DOCUMENTS) {
      now = new Date(now.getTime() + 1000);
      await acceptDocument(ctx(), actor, { document: d.id, version: d.version });
    }
    const first = await listAcceptances(ctx(), actor, { limit: 2 });
    expect(first.items.map((a) => a.document)).toEqual(['privacy', 'terms']);
    expect(first.next_cursor).not.toBeNull();
    const second = await listAcceptances(ctx(), actor, { limit: 2, cursor: first.next_cursor! });
    expect(second.items.map((a) => a.document)).toEqual(['charter']);
    expect(second.next_cursor).toBeNull();
    expect(await failure(listAcceptances(ctx(), actor, { cursor: 'abc' }))).toBe('400 invalid_cursor');
  });
});

describe('acteurs agents', () => {
  it('un acteur agent ne lit ni ne modifie le profil, n’accepte rien et ne ferme aucune session', async () => {
    const { userId } = await signIn();
    const agent: AgentActor = {
      kind: 'agent',
      agentId: uuidv7(),
      authorizationId: uuidv7(),
      userId,
      registered: true,
    };
    expect(await failure(getMe(ctx(), agent))).toBe('403 agent_forbidden');
    expect(await failure(updateMe(ctx(), agent, { lang: 'fr' }, 1))).toBe('403 agent_forbidden');
    expect(await failure(acceptDocument(ctx(), agent, { document: 'charter', version: 1 }))).toBe(
      '403 agent_forbidden',
    );
    expect(await failure(listAcceptances(ctx(), agent, {}))).toBe('403 agent_forbidden');
    expect(await failure(revokeSession(ctx(), agent))).toBe('403 agent_forbidden');
  });
});

describe('rôle administrateur provisoire', () => {
  it('attribué et retiré par commande d’exploitation, audité, il ouvre les opérations de gouvernance', async () => {
    const { userId, session } = await signIn(
      fakeGitHub({ config: github, account: { id: 5005, login: 'Hedy-L', name: 'Hedy Lamarr' } }),
    );
    const actor = (await resolveSession(ctx(), session.token))!.actor;
    await register(actor);
    const governance = operation('test.governance', { humans: 'admin' });
    const resolve = async () => (await resolveSession(ctx(), session.token))!.actor;
    expect(await failure(Promise.resolve().then(async () => authorize(await resolve(), governance)))).toBe(
      '403 admin_required',
    );
    expect(await setAdmin(ctx(), { githubLogin: 'hedy-l' }, true)).toEqual({ userId, changed: true });
    expect(await setAdmin(ctx(), { githubLogin: 'HEDY-L' }, true)).toEqual({ userId, changed: false });
    expect(() => authorize(actor, governance)).toThrow();
    expect(authorize(await resolve(), governance)).toMatchObject({ userId, admin: true });
    await setAdmin(ctx(), { githubLogin: 'hedy-l' }, false);
    expect((await resolve()).admin).toBe(false);
    expect(await failure(setAdmin(ctx(), { githubLogin: 'personne' }, true))).toBe('404 unknown_user');
    expect(await setAdmin(ctx(), { githubId: '5005' }, true)).toEqual({ userId, changed: true });
    await setAdmin(ctx(), { githubId: '5005' }, false);
    const events = await history(t.db, { type: 'user', id: userId });
    expect(
      events
        .filter((e) => e.action.startsWith('identity.admin.'))
        .map((e) => [e.action, e.actorKind, e.actorId]),
    ).toEqual([
      ['identity.admin.granted', 'system', null],
      ['identity.admin.revoked', 'system', null],
      ['identity.admin.granted', 'system', null],
      ['identity.admin.revoked', 'system', null],
    ]);
  });

  it('un login porté par deux comptes (renommage sur GitHub) est refusé : identifiant numérique requis', async () => {
    // L'ancien titulaire du login ne s'est pas reconnecté depuis son renommage ; un autre compte a pris ce login.
    await signIn(fakeGitHub({ config: github, account: { id: 5101, login: 'alice', name: 'Alice' } }));
    const other = await signIn(
      fakeGitHub({ config: github, account: { id: 5102, login: 'Alice', name: 'Autre' } }),
    );
    expect(await failure(setAdmin(ctx(), { githubLogin: 'alice' }, true))).toBe('409 ambiguous_user');
    expect(await setAdmin(ctx(), { githubId: '5102' }, true)).toEqual({
      userId: other.userId,
      changed: true,
    });
  });
});

describe('journal d’audit', () => {
  it('horodatage UTC et identifiants UUID v7, en ajout seul', async () => {
    const rows = await t.pool.query<{ id: string; at: string }>(
      "select id::text, to_char(occurred_at at time zone 'UTC', 'YYYY-MM-DD\"T\"HH24:MI:SS') as at from audit_events limit 5",
    );
    expect(rows.rows.length).toBeGreaterThan(0);
    for (const row of rows.rows) expect(row.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7/);
    await expect(t.pool.query('delete from audit_events')).rejects.toThrow(/ajout seul/);
  });

  it('deux premières connexions simultanées du même compte ne créent qu’un utilisateur', async () => {
    const account = { id: 6006, login: 'concurrent', name: null };
    const [a, b] = await Promise.all([
      signInWithGitHubAccount(ctx(), account, { lang: 'fr' }),
      signInWithGitHubAccount(ctx(), account, { lang: 'fr' }),
    ]);
    expect(a.userId).toBe(b.userId);
    expect([a.created, b.created].filter(Boolean)).toHaveLength(1);
  });
});
