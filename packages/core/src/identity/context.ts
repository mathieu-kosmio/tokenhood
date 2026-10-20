// Dépendances des services du module identity, fournies par l'API (ou par les tests).
import type { Database } from '@tokenhood/db';
import type { Clock } from '../common/clock.js';
import type { LegalDocument } from './documents.js';
import type { Fetch, GitHubOAuthConfig } from './github.js';

export interface IdentityContext {
  db: Database;
  clock: Clock;
  // Secret de session (SESSION_SECRET) : clé des condensats de jetons de session et d'états OAuth.
  sessionSecret: string;
  documents?: readonly LegalDocument[];
  sessionTtlMs?: number;
}

export interface GitHubContext extends IdentityContext {
  github: GitHubOAuthConfig;
  fetch: Fetch;
}

// Durée de vie d'une session, sans prolongation : 14 jours.
export const SESSION_TTL_MS = 14 * 24 * 60 * 60 * 1000;
// Durée de vie d'un état OAuth : 10 minutes.
export const STATE_TTL_MS = 10 * 60 * 1000;
