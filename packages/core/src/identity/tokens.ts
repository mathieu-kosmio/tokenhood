// Jetons opaques, condensats à clé (HMAC-SHA256 avec le secret de session) et PKCE S256.
import { createHash, createHmac, randomBytes } from 'node:crypto';

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

export function keyedHash(secret: string, value: string): string {
  return createHmac('sha256', secret).update(value).digest('hex');
}

export function pkceChallenge(verifier: string): string {
  return createHash('sha256').update(verifier).digest('base64url');
}

// Adresse de retour après connexion : un chemin de l'interface web, jamais une autre origine.
export const DEFAULT_RETURN_TO = '/account';

export function safeReturnTo(value: unknown): string {
  if (typeof value !== 'string' || value.length > 512) return DEFAULT_RETURN_TO;
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return DEFAULT_RETURN_TO;
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f\\]/.test(value)) return DEFAULT_RETURN_TO;
  return value;
}
