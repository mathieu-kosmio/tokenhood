// Configuration de l'API, lue dans l'environnement. Aucun secret dans le dépôt : GITHUB_CLIENT_ID,
// GITHUB_CLIENT_SECRET et SESSION_SECRET viennent de Coolify (ou de l'environnement local). Sans eux, l'API
// démarre et la connexion est déclarée indisponible.
import type { GitHubOAuthConfig } from '@tokenhood/core/identity';

export interface AuthConfig {
  github: GitHubOAuthConfig;
  sessionSecret: string;
}

export interface ApiConfig {
  // Origine publique de l'API (adresse de rappel OAuth) et de l'interface web (retour après connexion).
  publicApiUrl: string;
  publicWebUrl: string;
  cookie: { domain: string | undefined; secure: boolean };
  auth: AuthConfig | null;
}

export const SESSION_SECRET_MIN_LENGTH = 32;

const origin = (value: string | undefined, fallback: string) => {
  try {
    return new URL(value || fallback).origin;
  } catch {
    return new URL(fallback).origin;
  }
};

export function configFromEnv(env: NodeJS.ProcessEnv = process.env): ApiConfig {
  const publicApiUrl = origin(env.PUBLIC_API_URL, 'http://localhost:3000');
  const publicWebUrl = origin(env.PUBLIC_WEB_URL, 'http://localhost:3001');
  const clientId = env.GITHUB_CLIENT_ID?.trim();
  const clientSecret = env.GITHUB_CLIENT_SECRET?.trim();
  const sessionSecret = env.SESSION_SECRET?.trim();
  const auth =
    clientId && clientSecret && sessionSecret && sessionSecret.length >= SESSION_SECRET_MIN_LENGTH
      ? {
          github: { clientId, clientSecret, redirectUri: `${publicApiUrl}/v1/auth/github/callback` },
          sessionSecret,
        }
      : null;
  return {
    publicApiUrl,
    publicWebUrl,
    cookie: {
      domain: env.SESSION_COOKIE_DOMAIN?.trim() || undefined,
      secure: env.SESSION_COOKIE_SECURE
        ? env.SESSION_COOKIE_SECURE !== 'false'
        : env.NODE_ENV === 'production',
    },
    auth,
  };
}
