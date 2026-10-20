// Retour arrière de la dernière migration appliquée, par sa migration inverse (migrations/down/<tag>.sql).
// Sans migration inverse, la commande refuse : suivre la procédure de packages/db/README.md.
//   DATABASE_URL=… node packages/db/dist/rollback.js
import type pg from 'pg';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connect } from './client.js';
import { MIGRATION_LOCK } from './migrate.js';
import { MIGRATIONS_FOLDER, downSql, journal, statements } from './migrations.js';

export class RollbackError extends Error {}

// Renvoie le tag de la migration retirée, ou null si aucune n'est appliquée.
export async function rollback(pool: pg.Pool, folder = MIGRATIONS_FOLDER): Promise<string | null> {
  const client = await pool.connect();
  try {
    await client.query('select pg_advisory_lock($1)', [MIGRATION_LOCK]);
    const table = await client.query<{ exists: boolean }>(
      "select to_regclass('drizzle.__drizzle_migrations') is not null as exists",
    );
    if (!table.rows[0]?.exists) return null;
    const last = await client.query<{ created_at: string }>(
      'select created_at from drizzle.__drizzle_migrations order by created_at desc limit 1',
    );
    const createdAt = last.rows[0]?.created_at;
    if (createdAt === undefined) return null;
    const entry = journal(folder).find((e) => e.when === Number(createdAt));
    if (!entry) throw new RollbackError(`Migration appliquée inconnue du journal (created_at ${createdAt}).`);
    const down = downSql(entry.tag, folder);
    if (down === null)
      throw new RollbackError(
        `Aucune migration inverse pour ${entry.tag} (migrations/down/${entry.tag}.sql) : suivre la procédure de retour arrière de packages/db/README.md.`,
      );
    await client.query('begin');
    try {
      for (const statement of statements(down)) await client.query(statement);
      await client.query('delete from drizzle.__drizzle_migrations where created_at = $1', [createdAt]);
      await client.query('commit');
    } catch (error) {
      await client.query('rollback');
      throw error;
    }
    return entry.tag;
  } finally {
    await client.query('select pg_advisory_unlock($1)', [MIGRATION_LOCK]).catch(() => {});
    client.release();
  }
}

export async function main(env = process.env): Promise<void> {
  const url = env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL est requise pour le retour arrière.');
  const { pool, close } = connect(url, { max: 1 });
  try {
    const tag = await rollback(pool);
    console.log(tag ? `Migration retirée : ${tag}.` : 'Aucune migration appliquée.');
  } finally {
    await close();
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
