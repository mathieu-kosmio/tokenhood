// Applique les migrations en attente (service migrate du compose). Rejouable : une base à jour reste inchangée.
//   DATABASE_URL=… node packages/db/dist/migrate.js
import { migrate as drizzleMigrate } from 'drizzle-orm/node-postgres/migrator';
import { drizzle } from 'drizzle-orm/node-postgres';
import type pg from 'pg';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connect } from './client.js';
import { MIGRATIONS_FOLDER } from './migrations.js';

// Verrou consultatif : deux exécutions simultanées ne se chevauchent pas.
export const MIGRATION_LOCK = 4_102_102;

export async function migrate(pool: pg.Pool, folder = MIGRATIONS_FOLDER): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('select pg_advisory_lock($1)', [MIGRATION_LOCK]);
    await drizzleMigrate(drizzle({ client }), { migrationsFolder: folder });
  } finally {
    await client.query('select pg_advisory_unlock($1)', [MIGRATION_LOCK]).catch(() => {});
    client.release();
  }
}

export async function main(env = process.env): Promise<void> {
  const url = env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL est requise pour appliquer les migrations.');
  const { pool, close } = connect(url, { max: 1 });
  try {
    await migrate(pool);
    console.log('Migrations appliquées.');
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
