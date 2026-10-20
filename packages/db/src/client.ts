// Connexion PostgreSQL (node-postgres) et instance Drizzle. Les sessions sont en UTC.
import pg from 'pg';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';

export type Database = NodePgDatabase;
export type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0];
// Ce qu'une fonction de la couche métier reçoit : la base ou une transaction en cours.
export type Executor = Database | Transaction;

export interface Connection {
  db: Database;
  pool: pg.Pool;
  close: () => Promise<void>;
}

export function connect(url: string, options: { max?: number } = {}): Connection {
  const pool = new pg.Pool({ connectionString: url, max: options.max ?? 10, options: '-c timezone=UTC' });
  const db = drizzle({ client: pool });
  return { db, pool, close: () => pool.end() };
}
