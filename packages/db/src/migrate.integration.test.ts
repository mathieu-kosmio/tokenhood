// Migrations sur une base PostgreSQL réelle (TEST_DATABASE_URL) : application rejouable, retour arrière,
// journal d'audit en ajout seul, schéma exploitation intact.
import { cpSync, mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { migrate } from './migrate.js';
import { MIGRATIONS_FOLDER } from './migrations.js';
import { rollback, RollbackError } from './rollback.js';
import { createTestDatabase, type TestDatabase } from './testing.js';

let t: TestDatabase;

const tables = async () =>
  (
    await t.pool.query<{ table_name: string }>(
      'select table_name from information_schema.tables where table_schema = \'public\' order by table_name collate "C"',
    )
  ).rows.map((r) => r.table_name);

const applied = async () =>
  (await t.pool.query<{ n: string }>('select count(*) as n from drizzle.__drizzle_migrations')).rows[0]?.n;

const witness = async () =>
  (await t.pool.query<{ note: string }>('select note from exploitation.temoin_restauration')).rows.map(
    (r) => r.note,
  );

beforeAll(async () => {
  t = await createTestDatabase({ migrated: false });
  // Témoin de restauration du runbook Coolify, écrit avant toute migration.
  await t.pool.query(`
    create schema exploitation;
    create table exploitation.temoin_restauration (id serial primary key, ecrit_le timestamptz not null default now(), note text);
    insert into exploitation.temoin_restauration (note) values ('essai de restauration');`);
});

afterAll(async () => {
  await t?.drop();
});

describe('migrate', () => {
  it('crée les tables du socle', async () => {
    await migrate(t.pool);
    expect(await tables()).toEqual([
      'audit_events',
      'document_acceptances',
      'idempotency_keys',
      'identities',
      'oauth_states',
      'sessions',
      'users',
    ]);
    expect(await applied()).toBe('2');
  });

  it('est rejouable sans effet', async () => {
    const before = await t.pool.query(
      'select hash, created_at from drizzle.__drizzle_migrations order by created_at',
    );
    await migrate(t.pool);
    await migrate(t.pool);
    const after = await t.pool.query(
      'select hash, created_at from drizzle.__drizzle_migrations order by created_at',
    );
    expect(after.rows).toEqual(before.rows);
  });

  it('le journal d’audit est en ajout seul', async () => {
    await t.pool.query(
      "insert into audit_events (id, actor_kind, action, subject_type, subject_id) values ('0192f0a0-0000-7000-8000-000000000001', 'system', 'essai', 'test', '1')",
    );
    await expect(t.pool.query("update audit_events set action = 'modifie'")).rejects.toThrow(/ajout seul/);
    await expect(t.pool.query('delete from audit_events')).rejects.toThrow(/ajout seul/);
    await expect(t.pool.query('truncate audit_events')).rejects.toThrow(/ajout seul/);
    const rows = await t.pool.query('select action from audit_events');
    expect(rows.rows).toEqual([{ action: 'essai' }]);
  });

  it('le schéma exploitation reste intact', async () => {
    expect(await witness()).toEqual(['essai de restauration']);
  });
});

describe('rollback', () => {
  it('retire les migrations une à une, puis ne fait plus rien', async () => {
    expect(await rollback(t.pool)).toBe('0001_audit_append_only');
    // Sans les déclencheurs, le journal redevient modifiable : c'est l'effet attendu du retour arrière.
    expect(await rollback(t.pool)).toBe('0000_foundation');
    expect(await tables()).toEqual([]);
    expect(await applied()).toBe('0');
    expect(await rollback(t.pool)).toBeNull();
    expect(await witness()).toEqual(['essai de restauration']);
  });

  it('les migrations se réappliquent après un retour arrière', async () => {
    await migrate(t.pool);
    expect(await tables()).toHaveLength(7);
    expect(await applied()).toBe('2');
  });

  it('refuse sans migration inverse et renvoie à la procédure', async () => {
    const folder = mkdtempSync(path.join(os.tmpdir(), 'th-migrations-'));
    try {
      cpSync(MIGRATIONS_FOLDER, folder, { recursive: true });
      rmSync(path.join(folder, 'down', '0001_audit_append_only.sql'));
      await expect(rollback(t.pool, folder)).rejects.toBeInstanceOf(RollbackError);
      await expect(rollback(t.pool, folder)).rejects.toThrow(/packages\/db\/README\.md/);
      expect(await applied()).toBe('2');
    } finally {
      rmSync(folder, { recursive: true, force: true });
    }
  });
});
