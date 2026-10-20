// Lecture des migrations versionnées (migrations/, produites par drizzle-kit) et de leurs migrations inverses
// (migrations/down/<tag>.sql, écrites à la main, facultatives).
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const MIGRATIONS_FOLDER = fileURLToPath(new URL('../migrations', import.meta.url));

export interface JournalEntry {
  idx: number;
  tag: string;
  when: number;
}

export function journal(folder = MIGRATIONS_FOLDER): JournalEntry[] {
  const file = path.join(folder, 'meta', '_journal.json');
  return (JSON.parse(readFileSync(file, 'utf8')) as { entries: JournalEntry[] }).entries;
}

export function migrationSql(tag: string, folder = MIGRATIONS_FOLDER): string {
  return readFileSync(path.join(folder, `${tag}.sql`), 'utf8');
}

export function downSql(tag: string, folder = MIGRATIONS_FOLDER): string | null {
  const file = path.join(folder, 'down', `${tag}.sql`);
  return existsSync(file) ? readFileSync(file, 'utf8') : null;
}

export function downTags(folder = MIGRATIONS_FOLDER): string[] {
  const dir = path.join(folder, 'down');
  return existsSync(dir)
    ? readdirSync(dir)
        .filter((f) => f.endsWith('.sql'))
        .map((f) => f.slice(0, -4))
    : [];
}

// drizzle-kit sépare les instructions par ce marqueur.
export function statements(sqlText: string): string[] {
  return sqlText
    .split('--> statement-breakpoint')
    .map((s) => s.trim())
    .filter(Boolean);
}
