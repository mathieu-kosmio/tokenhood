// GitHub simulé pour les tests : un fetch en mémoire qui reproduit les points d'accès utilisés (autorisation,
// échange du code avec PKCE, compte, adresses, révocation du jeton). Aucun accès réseau.
import { randomBytes } from 'node:crypto';
import { GITHUB, GITHUB_SCOPES, type Fetch, type GitHubOAuthConfig } from '../github.js';
import { pkceChallenge } from '../tokens.js';

export interface FakeEmail {
  email: string;
  primary: boolean;
  verified: boolean;
}

export interface FakeGitHubOptions {
  config: GitHubOAuthConfig;
  account?: { id: number; login: string; name: string | null };
  emails?: FakeEmail[];
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export function fakeGitHub(options: FakeGitHubOptions) {
  const state = {
    account: options.account ?? { id: 4102, login: 'ada-l', name: 'Ada Lovelace' },
    emails: options.emails ?? [{ email: 'ada@example.org', primary: true, verified: true }],
  };
  const codes = new Map<string, { challenge: string; redirectUri: string }>();
  const tokens = new Set<string>();
  const issued: string[] = [];
  const revoked: string[] = [];
  const calls: string[] = [];

  // L'utilisateur approuve sur GitHub : renvoie le code et l'état que GitHub ajouterait à l'URL de rappel.
  function approve(authorizeUrl: string): { code: string; state: string } {
    const url = new URL(authorizeUrl);
    const p = url.searchParams;
    if (`${url.origin}${url.pathname}` !== GITHUB.authorize)
      throw new Error(`autorisation inattendue : ${url}`);
    if (p.get('client_id') !== options.config.clientId) throw new Error('client_id inattendu');
    if (p.get('scope') !== GITHUB_SCOPES.join(' ')) throw new Error(`portée inattendue : ${p.get('scope')}`);
    if (p.get('code_challenge_method') !== 'S256' || !p.get('code_challenge'))
      throw new Error('PKCE S256 absent');
    const code = randomBytes(10).toString('hex');
    codes.set(code, { challenge: p.get('code_challenge')!, redirectUri: p.get('redirect_uri') ?? '' });
    return { code, state: p.get('state') ?? '' };
  }

  const fetch: Fetch = async (input, init) => {
    const url = new URL(String(input));
    const method = init?.method ?? 'GET';
    calls.push(`${method} ${url.origin}${url.pathname}`);
    const auth = new Headers(init?.headers).get('authorization') ?? '';
    if (method === 'POST' && url.href === GITHUB.token) {
      const body = new URLSearchParams(String(init?.body ?? ''));
      const grant = codes.get(body.get('code') ?? '');
      codes.delete(body.get('code') ?? '');
      if (
        body.get('client_id') !== options.config.clientId ||
        body.get('client_secret') !== options.config.clientSecret
      )
        return json({ error: 'incorrect_client_credentials' });
      if (!grant || grant.redirectUri !== body.get('redirect_uri'))
        return json({ error: 'bad_verification_code' });
      if (pkceChallenge(body.get('code_verifier') ?? '') !== grant.challenge)
        return json({ error: 'invalid_grant', error_description: 'PKCE verification failed' });
      const token = `gho_${randomBytes(16).toString('hex')}`;
      tokens.add(token);
      issued.push(token);
      return json({ access_token: token, token_type: 'bearer', scope: GITHUB_SCOPES.join(',') });
    }
    if (method === 'DELETE' && url.pathname === `/applications/${options.config.clientId}/token`) {
      const expected = `Basic ${Buffer.from(`${options.config.clientId}:${options.config.clientSecret}`).toString('base64')}`;
      if (auth !== expected) return json({ message: 'Requires authentication' }, 401);
      const token = (JSON.parse(String(init?.body ?? '{}')) as { access_token?: string }).access_token ?? '';
      if (!tokens.delete(token)) return json({ message: 'Not Found' }, 404);
      revoked.push(token);
      return new Response(null, { status: 204 });
    }
    const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (url.origin === GITHUB.api && (url.pathname === '/user' || url.pathname === '/user/emails')) {
      if (!tokens.has(bearer)) return json({ message: 'Bad credentials' }, 401);
      return json(url.pathname === '/user' ? state.account : state.emails);
    }
    return json({ message: 'Not Found' }, 404);
  };

  return { fetch, approve, state, issued, revoked, calls };
}
