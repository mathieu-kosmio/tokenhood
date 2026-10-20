import { describe, expect, it } from 'vitest';
import { redactUrl } from './app.js';
import { configFromEnv } from './config.js';

const secrets = {
  GITHUB_CLIENT_ID: 'Iv1.test',
  GITHUB_CLIENT_SECRET: 'secret-de-test',
  SESSION_SECRET: 'x'.repeat(32),
};

describe('configuration', () => {
  it('sans secrets, la connexion est indisponible et l’API garde ses valeurs par défaut', () => {
    expect(configFromEnv({})).toEqual({
      publicApiUrl: 'http://localhost:3000',
      publicWebUrl: 'http://localhost:3001',
      cookie: { domain: undefined, secure: false },
      auth: null,
    });
  });

  it('chaque secret est requis, et le secret de session fait au moins 32 caractères', () => {
    for (const missing of Object.keys(secrets))
      expect(configFromEnv({ ...secrets, [missing]: '' }).auth, missing).toBeNull();
    expect(configFromEnv({ ...secrets, SESSION_SECRET: 'court' }).auth).toBeNull();
  });

  it('en production : adresse de rappel sur l’API publique, cookie Secure et domaine partagé', () => {
    const config = configFromEnv({
      ...secrets,
      NODE_ENV: 'production',
      PUBLIC_API_URL: 'https://api.tokenhood.kosm.io/',
      PUBLIC_WEB_URL: 'https://app.tokenhood.kosm.io',
      SESSION_COOKIE_DOMAIN: 'tokenhood.kosm.io',
    });
    expect(config.auth?.github.redirectUri).toBe('https://api.tokenhood.kosm.io/v1/auth/github/callback');
    expect(config.cookie).toEqual({ domain: 'tokenhood.kosm.io', secure: true });
    expect(configFromEnv({ NODE_ENV: 'production', SESSION_COOKIE_SECURE: 'false' }).cookie.secure).toBe(
      false,
    );
  });
});

describe('journaux', () => {
  it('masquent le code et l’état OAuth de l’URL de rappel', () => {
    expect(redactUrl('/v1/auth/github/callback?code=abc123&state=xyz')).toBe(
      '/v1/auth/github/callback?code=[masqué]&state=[masqué]',
    );
    expect(redactUrl('/v1/users/me?limit=2')).toBe('/v1/users/me?limit=2');
  });
});
