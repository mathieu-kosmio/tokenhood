import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp, VERSION } from '../src/app.js';

let app: Awaited<ReturnType<typeof buildApp>>;

beforeAll(async () => {
  app = await buildApp();
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe('api', () => {
  it('répond à la sonde de disponibilité', async () => {
    const res = await app.inject({ method: 'GET', url: '/healthz' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: 'ok', version: VERSION });
  });

  it('localise les erreurs selon Accept-Language', async () => {
    const fr = await app.inject({
      method: 'GET',
      url: '/v1/nope',
      headers: { 'accept-language': 'fr-FR,fr;q=0.9' },
    });
    const en = await app.inject({ method: 'GET', url: '/v1/nope', headers: { 'accept-language': 'en-GB' } });
    expect(fr.statusCode).toBe(404);
    expect(fr.json()).toEqual({ error: 'not_found', message: 'Ressource introuvable : /v1/nope' });
    expect(fr.headers['content-language']).toBe('fr');
    expect(en.json().message).toBe('Resource not found: /v1/nope');
    expect(en.headers['content-language']).toBe('en');
  });

  it('sert le catalogue de messages de chaque langue', async () => {
    const res = await app.inject({ method: 'GET', url: '/v1/i18n/en' });
    expect(res.statusCode).toBe(200);
    expect(res.json()['app.tagline']).toBe('Token patronage for the digital commons');
  });

  it('refuse une langue non prise en charge, avec un message localisé', async () => {
    const res = await app.inject({ method: 'GET', url: '/v1/i18n/de', headers: { 'accept-language': 'en' } });
    expect(res.statusCode).toBe(404);
    expect(res.json()).toEqual({
      error: 'unsupported_language',
      message: 'Unsupported language: de. Available languages: fr, en.',
    });
  });

  it('publie une description OpenAPI 3.1 des routes', async () => {
    const res = await app.inject({ method: 'GET', url: '/v1/openapi.json' });
    const spec = res.json();
    expect(spec.openapi).toBe('3.1.0');
    expect(Object.keys(spec.paths)).toEqual(expect.arrayContaining(['/healthz', '/v1/i18n/{lang}']));
  });
});
