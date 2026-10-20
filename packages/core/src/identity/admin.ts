// Rôle administrateur provisoire : autorisation de gouvernance jusqu'à TH-104. Attribué ou retiré par une
// commande d'exploitation (apps/api/src/cli/admin.ts), sans interface ; chaque changement est audité.
// La cible se désigne par l'identifiant numérique GitHub, ou par un login s'il ne désigne qu'un compte : un
// login n'est rafraîchi qu'à la connexion, deux comptes peuvent porter le même (renommage sur GitHub).
import { and, eq, sql } from 'drizzle-orm';
import type { Database } from '@tokenhood/db';
import { identities, users } from '@tokenhood/db/schema/identity';
import { record } from '../audit/index.js';
import type { Clock } from '../common/clock.js';
import { DomainError } from '../common/errors.js';

export type AdminTarget = { githubId: string } | { githubLogin: string };

export async function setAdmin(
  ctx: { db: Database; clock: Clock },
  target: AdminTarget,
  admin: boolean,
): Promise<{ userId: string; changed: boolean }> {
  const now = ctx.clock();
  const label = 'githubId' in target ? target.githubId : target.githubLogin;
  return ctx.db.transaction(async (tx) => {
    const matches = await tx
      .select({ userId: identities.userId })
      .from(identities)
      .where(
        and(
          eq(identities.provider, 'github'),
          'githubId' in target
            ? eq(identities.subject, target.githubId)
            : sql`lower(${identities.login}) = lower(${target.githubLogin})`,
        ),
      )
      .limit(2);
    const [identity] = matches;
    if (!identity)
      throw new DomainError('unknown_user', 404, 'identity.admin.errors.unknownUser', { login: label });
    if (matches.length > 1)
      throw new DomainError('ambiguous_user', 409, 'identity.admin.errors.ambiguousLogin', { login: label });
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

export async function listAdmins(ctx: {
  db: Database;
}): Promise<{ userId: string; githubId: string | null; login: string | null }[]> {
  return ctx.db
    .select({ userId: users.id, githubId: identities.subject, login: identities.login })
    .from(users)
    .leftJoin(identities, and(eq(identities.userId, users.id), eq(identities.provider, 'github')))
    .where(eq(users.admin, true));
}
