// Clés d'idempotence des écritures de l'API (en-tête Idempotency-Key), par appelant.
import { integer, jsonb, pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';

export const idempotencyKeys = pgTable(
  'idempotency_keys',
  {
    scope: text('scope').notNull(),
    key: text('key').notNull(),
    requestHash: text('request_hash').notNull(),
    // Vides tant que la première requête est en cours.
    statusCode: integer('status_code'),
    responseBody: text('response_body'),
    responseHeaders: jsonb('response_headers').$type<Record<string, string>>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.scope, t.key] })],
);
