import { describe, expect, it } from 'vitest';
import { authorize, operation, type AgentActor, type HumanActor } from './actor.js';
import { decodeCursor, encodeCursor, pageLimit, pageOf, PAGE_SIZE } from './cursor.js';
import { DomainError } from './errors.js';
import { parseRepository } from './repository.js';
import { isUuidV7, uuidv7, uuidv7Time } from './uuid.js';

const human = (over: Partial<HumanActor> = {}): HumanActor => ({
  kind: 'human',
  userId: uuidv7(),
  admin: false,
  registered: true,
  sessionId: null,
  ...over,
});
const agent: AgentActor = { kind: 'agent', agentId: uuidv7(), authorizationId: uuidv7(), userId: uuidv7() };

const code = (fn: () => unknown) => {
  try {
    fn();
  } catch (error) {
    return error instanceof DomainError ? `${error.status} ${error.code}` : String(error);
  }
  return 'ok';
};

describe('uuidv7', () => {
  it('produit des UUID v7 conformes (version 7, variante RFC 9562) portant leur date', () => {
    const at = Date.UTC(2026, 9, 20, 12, 0, 0, 123);
    const id = uuidv7(at);
    expect(isUuidV7(id)).toBe(true);
    expect(uuidv7Time(id)).toBe(at);
    expect(isUuidV7('0192f0a0-0000-4000-8000-000000000001')).toBe(false);
  });

  it('reste trié dans l’ordre de création, même dans la même milliseconde', () => {
    const at = Date.now() + 10_000;
    const ids = Array.from({ length: 2000 }, () => uuidv7(at));
    expect([...ids].sort()).toEqual(ids);
    expect(new Set(ids).size).toBe(ids.length);
    const later = uuidv7(at + 1000);
    expect(later > ids.at(-1)!).toBe(true);
  });
});

describe('pagination par curseur', () => {
  it('le curseur est opaque et réversible', () => {
    const cursor = encodeCursor({ id: 'abc', k: 3 });
    expect(cursor).not.toContain('abc');
    expect(decodeCursor(cursor, (p): p is { id: string; k: number } => typeof p.id === 'string')).toEqual({
      id: 'abc',
      k: 3,
    });
  });

  it('refuse un curseur illisible ou d’une autre forme', () => {
    const valid = (p: Record<string, string | number>): p is { id: string } => typeof p.id === 'string';
    expect(code(() => decodeCursor('%%%', valid))).toBe('400 invalid_cursor');
    expect(code(() => decodeCursor(encodeCursor({ k: 1 }), valid))).toBe('400 invalid_cursor');
    expect(code(() => decodeCursor(Buffer.from('[1]').toString('base64url'), valid))).toBe(
      '400 invalid_cursor',
    );
  });

  it('borne la taille de page', () => {
    expect(pageLimit(undefined)).toBe(PAGE_SIZE.default);
    expect(pageLimit('5')).toBe(5);
    expect(code(() => pageLimit('0'))).toBe('400 invalid_limit');
    expect(code(() => pageLimit(PAGE_SIZE.max + 1))).toBe('400 invalid_limit');
    expect(code(() => pageLimit('2.5'))).toBe('400 invalid_limit');
  });

  it('une page n’a de suivante que si une ligne de plus a été lue', () => {
    const rows = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    const first = pageOf(rows, 2, (r) => ({ id: r.id }));
    expect(first.items).toEqual([{ id: 'a' }, { id: 'b' }]);
    expect(first.next_cursor).toBe(encodeCursor({ id: 'b' }));
    expect(pageOf(rows.slice(0, 2), 2, (r) => ({ id: r.id })).next_cursor).toBeNull();
  });
});

describe('référence de dépôt GitHub', () => {
  it.each([
    ['mathieu-kosmio/tokenhood', 'github:mathieu-kosmio/tokenhood'],
    ['Mathieu-Kosmio/TokenHood', 'github:mathieu-kosmio/tokenhood'],
    ['https://github.com/mathieu-kosmio/tokenhood', 'github:mathieu-kosmio/tokenhood'],
    ['https://www.github.com/mathieu-kosmio/tokenhood.git/', 'github:mathieu-kosmio/tokenhood'],
    ['github.com/mathieu-kosmio/tokenhood#readme', 'github:mathieu-kosmio/tokenhood'],
    ['git@github.com:mathieu-kosmio/tokenhood.git', 'github:mathieu-kosmio/tokenhood'],
    ['github:Mathieu-Kosmio/tokenhood', 'github:mathieu-kosmio/tokenhood'],
    ['  owner/repo.name_x  ', 'github:owner/repo.name_x'],
  ])('%s → %s', (input, ref) => {
    expect(parseRepository(input)?.ref).toBe(ref);
  });

  it.each([
    '',
    'tokenhood',
    'a/b/c',
    '-owner/repo',
    'own--er/repo',
    'owner/..',
    'https://gitlab.com/a/b',
    'owner/re po',
  ])('refuse %s', (input) => {
    expect(parseRepository(input)).toBeNull();
  });
});

describe('acteurs et autorisations', () => {
  const registered = operation('test.registered');
  const registering = operation('test.registering', { humans: 'registering' });
  const admin = operation('test.admin', { humans: 'admin' });
  const forAgents = operation('test.agents', { agents: 'allowed' });

  it('refuse par défaut toute opération à un acteur agent', () => {
    expect(code(() => authorize(agent, registered))).toBe('403 agent_forbidden');
    expect(code(() => authorize(agent, registering))).toBe('403 agent_forbidden');
    expect(code(() => authorize(agent, admin))).toBe('403 agent_forbidden');
    expect(code(() => authorize(agent, forAgents))).toBe('ok');
  });

  it('une opération d’administration ne s’ouvre jamais aux agents', () => {
    expect(() => operation('test.bad', { humans: 'admin', agents: 'allowed' } as never)).toThrow(
      /jamais aux agents/,
    );
  });

  it('sans acteur : connexion requise', () => {
    expect(code(() => authorize(null, registering))).toBe('401 unauthenticated');
  });

  it('inscription incomplète : seul le parcours d’inscription est ouvert', () => {
    const pending = human({ registered: false });
    expect(code(() => authorize(pending, registering))).toBe('ok');
    expect(code(() => authorize(pending, registered))).toBe('403 registration_incomplete');
    expect(code(() => authorize(pending, forAgents))).toBe('403 registration_incomplete');
    expect(code(() => authorize(human({ registered: false, admin: true }), admin))).toBe(
      '403 registration_incomplete',
    );
  });

  it('le rôle administrateur provisoire ouvre les opérations de gouvernance', () => {
    expect(code(() => authorize(human(), admin))).toBe('403 admin_required');
    expect(code(() => authorize(human({ admin: true }), admin))).toBe('ok');
    expect(code(() => authorize(human(), registered))).toBe('ok');
  });
});
