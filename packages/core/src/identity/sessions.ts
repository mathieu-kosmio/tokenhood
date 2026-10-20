// Sessions des humains : jeton opaque remis dans un cookie, seul son condensat à clé est conservé ; expiration
// fixe, révocation à la déconnexion (inscrite au journal d'audit).
import { and, eq, gt, isNull } from 'drizzle-orm';
import type { Executor } from '@tokenhood/db';
import { sessions } from '@tokenhood/db/schema/identity';
import { record } from '../audit/index.js';
import { authorize, type Actor, type HumanActor } from '../common/actor.js';
import { uuidv7 } from '../common/uuid.js';
import { SESSION_TTL_MS, type IdentityContext } from './context.js';
import { identityOperations as ops } from './operations.js';
import { keyedHash, randomToken } from './tokens.js';
import { loadMe, type Me } from './users.js';

export interface OpenedSession {
  id: string;
  token: string;
  expiresAt: Date;
}

export async function openSession(
  db: Executor,
  ctx: IdentityContext,
  userId: string,
  now: Date,
): Promise<OpenedSession> {
  const token = randomToken();
  const id = uuidv7(now.getTime());
  const expiresAt = new Date(now.getTime() + (ctx.sessionTtlMs ?? SESSION_TTL_MS));
  await db
    .insert(sessions)
    .values({ id, userId, tokenHash: keyedHash(ctx.sessionSecret, token), createdAt: now, expiresAt });
  return { id, token, expiresAt };
}

// Acteur humain d'un jeton de session valide (ni expiré ni révoqué), avec son profil ; null sinon.
export async function resolveSession(
  ctx: IdentityContext,
  token: string | undefined,
): Promise<{ actor: HumanActor; me: Me } | null> {
  if (!token || token.length > 128) return null;
  const now = ctx.clock();
  const [row] = await ctx.db
    .select({ id: sessions.id, userId: sessions.userId })
    .from(sessions)
    .where(
      and(
        eq(sessions.tokenHash, keyedHash(ctx.sessionSecret, token)),
        isNull(sessions.revokedAt),
        gt(sessions.expiresAt, now),
      ),
    )
    .limit(1);
  if (!row) return null;
  const me = await loadMe(ctx.db, row.userId, ctx.documents);
  if (!me) return null;
  return {
    actor: {
      kind: 'human',
      userId: me.id,
      admin: me.admin,
      registered: me.registration.complete,
      sessionId: row.id,
    },
    me,
  };
}

// Déconnexion : révoque la session courante. Renvoie false si elle l'était déjà.
export async function revokeSession(ctx: IdentityContext, actor: Actor | null): Promise<boolean> {
  const human = authorize(actor, ops.signOut);
  if (!human.sessionId) return false;
  const sessionId = human.sessionId;
  const now = ctx.clock();
  return ctx.db.transaction(async (tx) => {
    const [row] = await tx
      .update(sessions)
      .set({ revokedAt: now })
      .where(and(eq(sessions.id, sessionId), eq(sessions.userId, human.userId), isNull(sessions.revokedAt)))
      .returning({ id: sessions.id });
    if (!row) return false;
    await record(tx, {
      actor: human,
      action: 'identity.session.revoked',
      subject: { type: 'session', id: row.id },
      data: { reason: 'logout' },
      at: now,
    });
    return true;
  });
}
