// Contrôles sur le SQL des migrations, sans base : le schéma exploitation (témoin de restauration du runbook
// Coolify) n'est jamais touché et aucune migration, ni inverse, n'exécute DROP SCHEMA.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import config from '../drizzle.config.js';
import { MIGRATIONS_FOLDER, downSql, downTags, journal, migrationSql, statements } from './migrations.js';

// Retire les commentaires SQL pour ne juger que les instructions.
const code = (sql: string) => sql.replace(/--[^\n]*/g, '');

const allSql = () => [
  ...readdirSync(MIGRATIONS_FOLDER)
    .filter((f) => f.endsWith('.sql'))
    .map((f) => ({ file: f, sql: readFileSync(path.join(MIGRATIONS_FOLDER, f), 'utf8') })),
  ...downTags().map((tag) => ({ file: `down/${tag}.sql`, sql: downSql(tag) ?? '' })),
];

describe('migrations', () => {
  it('chaque entrée du journal a son fichier SQL, dans l’ordre', () => {
    const entries = journal();
    expect(entries.length).toBeGreaterThanOrEqual(2);
    entries.forEach((entry, index) => {
      expect(entry.idx).toBe(index);
      expect(entry.tag.startsWith(String(index).padStart(4, '0'))).toBe(true);
      expect(existsSync(path.join(MIGRATIONS_FOLDER, `${entry.tag}.sql`))).toBe(true);
    });
    const files = readdirSync(MIGRATIONS_FOLDER).filter((f) => f.endsWith('.sql'));
    expect(files.sort()).toEqual(entries.map((e) => `${e.tag}.sql`).sort());
  });

  it('aucune instruction ne supprime un schéma ni ne touche au schéma exploitation', () => {
    for (const { file, sql } of allSql()) {
      expect(code(sql), file).not.toMatch(/drop\s+schema/i);
      expect(code(sql), file).not.toMatch(/exploitation/i);
    }
  });

  it('le contrôle détecte un DROP SCHEMA et une référence au schéma exploitation', () => {
    expect(code('DROP  SCHEMA exploitation CASCADE;')).toMatch(/drop\s+schema/i);
    expect(code('-- exploitation : commentaire seul\nSELECT 1;')).not.toMatch(/exploitation/i);
    expect(code('ALTER TABLE exploitation.temoin_restauration ADD x int;')).toMatch(/exploitation/i);
  });

  it('chaque migration inverse correspond à une migration du journal', () => {
    const tags = journal().map((e) => e.tag);
    for (const tag of downTags()) expect(tags).toContain(tag);
  });

  it('les migrations du socle (TH-102) ont leur migration inverse', () => {
    expect(downSql('0000_foundation')).toMatch(/DROP TABLE IF EXISTS "users"/);
    expect(downSql('0001_audit_append_only')).toMatch(/DROP FUNCTION IF EXISTS "audit_events_append_only"/);
  });

  it('le journal d’audit refuse mise à jour, suppression et troncature (migration 0001)', () => {
    const sql = migrationSql('0001_audit_append_only');
    expect(sql).toMatch(/BEFORE UPDATE OR DELETE ON "audit_events" FOR EACH ROW/);
    expect(sql).toMatch(/BEFORE TRUNCATE ON "audit_events"/);
    expect(statements(sql)).toHaveLength(3);
  });

  it('drizzle-kit ne lit que le schéma public', () => {
    expect(config).toMatchObject({ dialect: 'postgresql', schemaFilter: ['public'], out: './migrations' });
  });
});
