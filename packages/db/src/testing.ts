// Bases éphémères des tests d'intégration : une base neuve par fichier de test, créée depuis TEST_DATABASE_URL,
// migrée, puis supprimée. Le journal d'audit refuse toute suppression : on ne vide jamais une base partagée.
import pg from 'pg';
import { randomUUID } from 'node:crypto';
import { connect, type Connection } from './client.js';
import { migrate } from './migrate.js';

export interface TestDatabase extends Connection {
  url: string;
  drop: () => Promise<void>;
}

export function testDatabaseUrl(env = process.env): string {
  const url = env.TEST_DATABASE_URL;
  if (!url)
    throw new Error(
      'TEST_DATABASE_URL est requise pour les tests d’intégration (ex. postgres://tokenhood:tokenhood@localhost:5432/tokenhood_test).',
    );
  return url;
}

async function onServer(base: string, sql: string): Promise<void> {
  const client = new pg.Client({ connectionString: base });
  await client.connect();
  try {
    await client.query(sql);
  } finally {
    await client.end();
  }
}

export async function createTestDatabase(options: { migrated?: boolean } = {}): Promise<TestDatabase> {
  const base = testDatabaseUrl();
  const name = `th_test_${randomUUID().replaceAll('-', '')}`;
  await onServer(base, `create database "${name}"`);
  const url = new URL(base);
  url.pathname = `/${name}`;
  const connection = connect(url.toString(), { max: 5 });
  if (options.migrated ?? true) await migrate(connection.pool);
  return {
    ...connection,
    url: url.toString(),
    drop: async () => {
      await connection.close();
      await onServer(base, `drop database if exists "${name}" with (force)`);
    },
  };
}
