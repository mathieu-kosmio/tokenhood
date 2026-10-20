// Dépendances partagées par les modules de routes (base, horloge, fetch, configuration) et types ajoutés à Fastify.
import type { Database } from '@tokenhood/db';
import type { Actor, Clock } from '@tokenhood/core/common';
import type { Fetch, IdentityContext, LegalDocument } from '@tokenhood/core/identity';
import type { ApiConfig } from './config.js';

export interface Deps {
  // null : pas de DATABASE_URL, les routes qui en ont besoin répondent 503.
  db: Database | null;
  clock: Clock;
  fetch: Fetch;
  config: ApiConfig;
  documents: readonly LegalDocument[];
}

declare module 'fastify' {
  interface FastifyInstance {
    deps: Deps;
  }
  interface FastifyRequest {
    // Acteur résolu par apps/api/src/auth/ ; null pour un appel anonyme.
    actor: Actor | null;
    idempotency: { scope: string; key: string } | null;
  }
  interface FastifyContextConfig {
    // Écriture soumise à l'en-tête Idempotency-Key (apps/api/src/http/idempotency.ts).
    idempotent?: boolean;
  }
}

// Contexte du module identity, ou null sans base de données. Sans secret de session, aucune session ne se
// résout (apps/api/src/auth/) : les routes répondent comme à un appel anonyme.
export function identityContext(deps: Deps): IdentityContext | null {
  if (!deps.db) return null;
  return {
    db: deps.db,
    clock: deps.clock,
    sessionSecret: deps.config.auth?.sessionSecret ?? '',
    documents: deps.documents,
  };
}
