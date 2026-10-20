// Rôle administrateur provisoire : autorisation de gouvernance jusqu'à TH-104. Attribué ou retiré par une
// commande d'exploitation (apps/api/src/cli/admin.ts), sans interface ; chaque changement est audité.
import { and, eq, sql } from 'drizzle-orm';
import type { Database } from '@tokenhood/db';
import { identities, users } from '@tokenhood/db/schema/identity';
import { record } from '../audit/index.js';
import type { Clock } from '../common/clock.js';
import { DomainError } from '../common/errors.js';

export async function setAdmin(
  ctx: { db: Database; clock: Clock },
  target: { githubLogin: string },
  admin: boolean,
): Promise<{ userId: string; changed: boolean }> {
  const now = ctx.clock();
  return ctx.db.transaction(async (tx) => {
    const [identity] = await tx
      .select({ userId: identities.userId })
      .from(identities)
      .where(
        and(
          eq(identities.provider, 'github'),
          sql`lower(${identities.login}) = lower(${target.githubLogin})`,
        ),
      )
      .limit(1);
    if (!identity)
      throw new DomainError('unknown_user', 404, 'identity.admin.errors.unknownUser', {
        login: target.githubLogin,
      });
    const [row] = await tx
      .update(users)
      .set({ admin, updatedAt: now })
      .where(and(eq(users.id, identity.userId), sql`${users.admin} <> ${admin}`))
      .returning({ id: users.id });
    if (row)
      await record(tx, {
        actor: 'system',
        action: admin ? 'identity.admin.granted' : 'identity.admin.revoked',
        subject: { type: 'user', id: identity.userId },
        data: { via: 'operations_command' },
        at: now,
      });
    return { userId: identity.userId, changed: Boolean(row) };
  });
}

export async function listAdmins(ctx: { db: Database }): Promise<{ userId: string; login: string | null }[]> {
  return ctx.db
    .select({ userId: users.id, login: identities.login })
    .from(users)
    .leftJoin(identities, and(eq(identities.userId, users.id), eq(identities.provider, 'github')))
    .where(eq(users.admin, true));
}
