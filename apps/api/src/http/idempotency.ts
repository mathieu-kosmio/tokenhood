// Idempotence des écritures : une route déclarée { config: { idempotent: true } } exige l'en-tête
// Idempotency-Key. Pour un appelant identifié, la première réponse (hors erreur 5xx) est conservée 24 heures et
// rejouée à l'identique si la même clé revient avec la même requête ; une autre requête sur la même clé est refusée.
// Un client qui abandonne sa requête ne libère pas la clé : la réponse, enregistrée à son envoi, sera rejouée.
import { createHash } from 'node:crypto';
import { and, eq, isNull, lt } from 'drizzle-orm';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { idempotencyKeys } from '@tokenhood/db/schema/idempotency';
import { sendError } from './errors.js';

export const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;
const KEY = /^[\x21-\x7e]{1,255}$/;
// En-têtes de la réponse rejoués avec elle.
const KEPT_HEADERS = ['etag', 'location', 'content-type'] as const;

// Une requête « en cours » depuis plus longtemps que ce délai a été interrompue (arrêt du service) : sa clé est
// reprise. Les écritures de l'API restent sûres à rejouer (verrou optimiste, contraintes d'unicité).
export const IN_PROGRESS_STALE_MS = 2 * 60 * 1000;

// Portée d'une clé : l'appelant et sa session (ou son autorisation d'agent).
const scopeOf = (request: FastifyRequest): string | null => {
  const actor = request.actor;
  if (!actor) return null;
  return actor.kind === 'agent'
    ? `agent:${actor.agentId}:${actor.authorizationId}`
    : `human:${actor.userId}:${actor.sessionId ?? '-'}`;
};

const requestHash = (request: FastifyRequest) =>
  createHash('sha256')
    .update(
      JSON.stringify([
        request.method,
        request.routeOptions.url,
        request.params,
        request.query,
        request.body ?? null,
        request.headers['if-match'] ?? null,
      ]),
    )
    .digest('hex');

export function installIdempotency(app: FastifyInstance) {
  app.decorateRequest('idempotency', null);

  app.addHook('preHandler', async (request, reply) => {
    if (!request.routeOptions.config.idempotent) return;
    const raw = request.headers['idempotency-key'];
    if (raw === undefined)
      return sendError(request, reply, 400, 'idempotency_key_required', 'errors.idempotencyKeyRequired');
    if (typeof raw !== 'string' || !KEY.test(raw))
      return sendError(request, reply, 400, 'idempotency_key_invalid', 'errors.idempotencyKeyInvalid');
    const scope = scopeOf(request);
    const { db, clock } = app.deps;
    // Appel anonyme : la clé est exigée mais rien n'est conservé (aucune réponse à rejouer d'un appelant à l'autre).
    if (!scope || !db) return;
    const now = clock();
    const hash = requestHash(request);
    await db
      .delete(idempotencyKeys)
      .where(
        and(
          eq(idempotencyKeys.scope, scope),
          lt(idempotencyKeys.createdAt, new Date(now.getTime() - IDEMPOTENCY_TTL_MS)),
        ),
      );
    const [inserted] = await db
      .insert(idempotencyKeys)
      .values({ scope, key: raw, requestHash: hash, createdAt: now })
      .onConflictDoNothing()
      .returning({ key: idempotencyKeys.key });
    if (inserted) {
      request.idempotency = { scope, key: raw };
      return;
    }
    const [existing] = await db
      .select()
      .from(idempotencyKeys)
      .where(and(eq(idempotencyKeys.scope, scope), eq(idempotencyKeys.key, raw)))
      .limit(1);
    if (!existing)
      return sendError(request, reply, 409, 'idempotency_in_progress', 'errors.idempotencyInProgress');
    // Première requête encore en cours : 409, sauf si elle est périmée (service arrêté) ; la clé est alors reprise.
    if (existing.statusCode === null) {
      const stale = existing.createdAt.getTime() < now.getTime() - IN_PROGRESS_STALE_MS;
      const [taken] = stale
        ? await db
            .update(idempotencyKeys)
            .set({ createdAt: now, requestHash: hash })
            .where(
              and(
                eq(idempotencyKeys.scope, scope),
                eq(idempotencyKeys.key, raw),
                isNull(idempotencyKeys.statusCode),
                eq(idempotencyKeys.createdAt, existing.createdAt),
              ),
            )
            .returning({ key: idempotencyKeys.key })
        : [];
      if (!taken)
        return sendError(request, reply, 409, 'idempotency_in_progress', 'errors.idempotencyInProgress');
      request.idempotency = { scope, key: raw };
      return;
    }
    if (existing.requestHash !== hash)
      return sendError(request, reply, 422, 'idempotency_key_reused', 'errors.idempotencyKeyReused');
    reply.code(existing.statusCode).headers({ ...existing.responseHeaders, 'idempotent-replayed': 'true' });
    return reply.send(existing.responseBody ?? undefined);
  });

  app.addHook('onSend', async (request, reply, payload) => {
    const pending = request.idempotency;
    const db = app.deps.db;
    if (!pending || !db) return payload;
    request.idempotency = null;
    const where = and(eq(idempotencyKeys.scope, pending.scope), eq(idempotencyKeys.key, pending.key));
    if (reply.statusCode >= 500) {
      await db.delete(idempotencyKeys).where(where);
      return payload;
    }
    const headers: Record<string, string> = {};
    for (const name of KEPT_HEADERS) {
      const value = reply.getHeader(name);
      if (value !== undefined) headers[name] = String(value);
    }
    await db
      .update(idempotencyKeys)
      .set({
        statusCode: reply.statusCode,
        responseBody: typeof payload === 'string' ? payload : null,
        responseHeaders: headers,
      })
      .where(where);
    return payload;
  });
}
