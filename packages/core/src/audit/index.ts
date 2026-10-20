// Module audit : inscription d'un événement au journal en ajout seul (la base refuse mise à jour et suppression).
// Les données jointes ne portent ni secret ni donnée personnelle : des noms de champs, des identifiants.
import { and, asc, eq } from 'drizzle-orm';
import type { Executor } from '@tokenhood/db';
import { auditEvents } from '@tokenhood/db/schema/audit';
import { auditActor, type Actor } from '../common/actor.js';
import { uuidv7 } from '../common/uuid.js';

export interface AuditEntry {
  actor: Actor | 'system';
  action: string;
  subject: { type: string; id: string };
  data?: Record<string, unknown>;
  at: Date;
}

export async function record(db: Executor, entry: AuditEntry): Promise<string> {
  const id = uuidv7(entry.at.getTime());
  const actor = auditActor(entry.actor);
  const data =
    entry.actor !== 'system' && entry.actor.kind === 'agent'
      ? { ...entry.data, on_behalf_of: entry.actor.userId }
      : (entry.data ?? {});
  await db.insert(auditEvents).values({
    id,
    occurredAt: entry.at,
    actorKind: actor.kind,
    actorId: actor.id,
    action: entry.action,
    subjectType: entry.subject.type,
    subjectId: entry.subject.id,
    data,
  });
  return id;
}

export async function history(db: Executor, subject: { type: string; id: string }) {
  return db
    .select()
    .from(auditEvents)
    .where(and(eq(auditEvents.subjectType, subject.type), eq(auditEvents.subjectId, subject.id)))
    .orderBy(asc(auditEvents.occurredAt), asc(auditEvents.id));
}
