// Module audit (TH-102) : journal d'événements en ajout seul. La migration 0001 refuse en base toute
// mise à jour, suppression ou troncature de cette table.
import { sql } from 'drizzle-orm';
import { check, index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const auditEvents = pgTable(
  'audit_events',
  {
    id: uuid('id').primaryKey(),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull().defaultNow(),
    actorKind: text('actor_kind').notNull(),
    actorId: uuid('actor_id'),
    action: text('action').notNull(),
    subjectType: text('subject_type').notNull(),
    subjectId: text('subject_id').notNull(),
    data: jsonb('data').$type<Record<string, unknown>>().notNull().default({}),
  },
  (t) => [
    check('audit_events_actor_kind_check', sql`${t.actorKind} in ('human', 'agent', 'system')`),
    index('audit_events_subject_idx').on(t.subjectType, t.subjectId, t.occurredAt),
  ],
);
