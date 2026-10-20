import { describe, expect, it } from 'vitest';
import { api } from './api.js';

describe('client de l’API', () => {
  it('transmet session, langue, clé d’idempotence et If-Match', async () => {
    const seen: { url: string; init: RequestInit }[] = [];
    const fetcher = (async (url: string, init: RequestInit) => {
      seen.push({ url, init });
      return new Response(JSON.stringify({ id: 'u1' }), { status: 200, headers: { etag: '"v2"' } });
    }) as unknown as typeof fetch;
    const res = await api(
      '/v1/users/me',
      {
        method: 'PATCH',
        body: { lang: 'en' },
        session: 'jeton',
        lang: 'en',
        idempotencyKey: 'cle',
        ifMatch: '"v1"',
      },
      fetcher,
    );
    expect(res).toMatchObject({ status: 200, ok: true, body: { id: 'u1' }, etag: '"v2"' });
    expect(seen[0]?.url).toBe('http://localhost:3000/v1/users/me');
    expect(seen[0]?.init.headers).toMatchObject({
      cookie: 'th_session=jeton',
      'accept-language': 'en',
      'idempotency-key': 'cle',
      'if-match': '"v1"',
      'content-type': 'application/json',
    });
    expect(seen[0]?.init.body).toBe('{"lang":"en"}');
  });

  it('API injoignable : statut 0, sans exception', async () => {
    const down = (async () => {
      throw new TypeError('fetch failed');
    }) as unknown as typeof fetch;
    expect(await api('/v1/auth/providers', { lang: 'fr' }, down)).toEqual({
      status: 0,
      ok: false,
      body: null,
      error: null,
      etag: null,
    });
  });
});
