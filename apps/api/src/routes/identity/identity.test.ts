// Routes du module identity sans base de données ni secrets : la plateforme démarre, la connexion est
// déclarée indisponible avec un message localisé, les écritures exigent Idempotency-Key.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import Fastify from 'fastify';
import { buildApp } from '../../app.js';
import { loadRouteModules } from '../../http/routes.js';

let app: Awaited<ReturnType<typeof buildApp>>;

beforeAll(async () => {
  app = await buildApp();
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe('identity sans secrets', () => {
  it('déclare la connexion GitHub indisponible', async () => {
    const res = await app.inject({ method: 'GET', url: '/v1/auth/providers' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ github: { available: false } });
  });

  it('le départ de connexion répond « connexion indisponible », en FR et en EN', async () => {
    const fr = await app.inject({
      method: 'GET',
      url: '/v1/auth/github/start',
      headers: { 'accept-language': 'fr' },
    });
    const en = await app.inject({
      method: 'GET',
      url: '/v1/auth/github/start',
      headers: { 'accept-language': 'en' },
    });
    expect(fr.statusCode).toBe(503);
    expect(fr.json()).toEqual({
      error: 'auth_unavailable',
      message: "Connexion indisponible : l'application OAuth GitHub n'est pas configurée sur cette instance.",
    });
    expect(en.json().message).toBe(
      'Sign-in unavailable: the GitHub OAuth application is not configured on this instance.',
    );
  });

  it('le rappel renvoie vers la page de connexion de l’interface web', async () => {
    const res = await app.inject({ method: 'GET', url: '/v1/auth/github/callback?code=x&state=y' });
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('http://localhost:3001/login?error=unavailable');
  });

  it('le profil répond 503 sans base de données', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/v1/users/me',
      headers: { 'accept-language': 'en' },
    });
    expect(res.statusCode).toBe(503);
    expect(res.json()).toEqual({
      error: 'unavailable',
      message: 'Service temporarily unavailable. Try again in a moment.',
    });
  });

  it('une écriture sans Idempotency-Key, ou avec une clé invalide, est refusée', async () => {
    const missing = await app.inject({ method: 'PATCH', url: '/v1/users/me', payload: { lang: 'fr' } });
    expect(missing.statusCode).toBe(400);
    expect(missing.json()).toMatchObject({ error: 'idempotency_key_required' });
    const invalid = await app.inject({
      method: 'POST',
      url: '/v1/users/me/acceptances',
      payload: { document: 'charter', version: 1 },
      headers: { 'idempotency-key': 'avec espace', 'accept-language': 'fr' },
    });
    expect(invalid.json()).toEqual({
      error: 'idempotency_key_invalid',
      message: 'En-tête Idempotency-Key invalide : de 1 à 255 caractères visibles.',
    });
  });

  it('un corps non conforme est refusé avec ses champs, message localisé', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: '/v1/users/me',
      payload: { lang: 'de', email: 'x' },
      headers: { 'idempotency-key': 'k1', 'accept-language': 'en' },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json()).toMatchObject({ error: 'bad_request', message: 'Invalid request.' });
    expect(res.json().fields.length).toBeGreaterThan(0);
  });

  it('la déconnexion sans session répond 204 et efface le cookie', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/auth/logout',
      headers: { 'idempotency-key': 'k2' },
    });
    expect(res.statusCode).toBe(204);
    expect(String(res.headers['set-cookie'])).toMatch(/^th_session=; .*Expires=Thu, 01 Jan 1970/);
  });

  it('décrit /v1/auth et /v1/users/me dans l’OpenAPI, avec le cookie de session', async () => {
    const spec = (await app.inject({ method: 'GET', url: '/v1/openapi.json' })).json();
    expect(Object.keys(spec.paths)).toEqual(
      expect.arrayContaining([
        '/v1/auth/providers',
        '/v1/auth/github/start',
        '/v1/auth/github/callback',
        '/v1/auth/logout',
        '/v1/users/me',
        '/v1/users/me/acceptances',
      ]),
    );
    expect(spec.components.securitySchemes.session).toEqual({
      type: 'apiKey',
      in: 'cookie',
      name: 'th_session',
    });
    expect(spec.paths['/v1/users/me'].patch.parameters.map((p: { name: string }) => p.name)).toEqual(
      expect.arrayContaining(['idempotency-key', 'if-match']),
    );
  });
});

describe('chargement des modules de routes', () => {
  it('charge chaque dossier de src/routes sans liste centrale', async () => {
    const bare = Fastify();
    bare.decorate('deps', app.deps);
    expect(await loadRouteModules(bare)).toEqual(['identity']);
    await bare.close();
  });
});
