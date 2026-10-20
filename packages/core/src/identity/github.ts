// Client OAuth GitHub : flux par code d'autorisation avec PKCE S256, portée read:user et user:email.
// Le jeton GitHub ne sert qu'à lire le compte et ses adresses, puis il est révoqué ; il n'est jamais conservé.
// fetch est injecté : les tests passent un GitHub simulé, sans réseau.

export type Fetch = (input: string | URL, init?: RequestInit) => Promise<Response>;

export interface GitHubOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export const GITHUB = {
  authorize: 'https://github.com/login/oauth/authorize',
  token: 'https://github.com/login/oauth/access_token',
  api: 'https://api.github.com',
} as const;

export const GITHUB_SCOPES = ['read:user', 'user:email'] as const;

const TIMEOUT_MS = 10_000;

export interface GitHubAccount {
  id: number;
  login: string;
  name: string | null;
  verifiedPrimaryEmail: boolean;
}

export type GitHubFailure = 'denied' | 'exchange_failed' | 'profile_failed';

export class GitHubError extends Error {
  readonly failure: GitHubFailure;
  constructor(failure: GitHubFailure, detail?: string) {
    super(detail ? `${failure}: ${detail}` : failure);
    this.name = 'GitHubError';
    this.failure = failure;
  }
}

export function authorizeUrl(
  config: GitHubOAuthConfig,
  params: { state: string; codeChallenge: string },
): string {
  const url = new URL(GITHUB.authorize);
  url.search = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: GITHUB_SCOPES.join(' '),
    state: params.state,
    code_challenge: params.codeChallenge,
    code_challenge_method: 'S256',
    allow_signup: 'true',
  }).toString();
  return url.toString();
}

const apiHeaders = (token: string) => ({
  accept: 'application/vnd.github+json',
  authorization: `Bearer ${token}`,
  'user-agent': 'tokenhood',
  'x-github-api-version': '2022-11-28',
});

export async function exchangeCode(
  config: GitHubOAuthConfig,
  fetch: Fetch,
  params: { code: string; codeVerifier: string },
): Promise<string> {
  let body: { access_token?: unknown; error?: unknown };
  try {
    const res = await fetch(GITHUB.token, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
        'user-agent': 'tokenhood',
      },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code: params.code,
        redirect_uri: config.redirectUri,
        code_verifier: params.codeVerifier,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw new GitHubError('exchange_failed', `HTTP ${res.status}`);
    body = (await res.json()) as typeof body;
  } catch (error) {
    if (error instanceof GitHubError) throw error;
    throw new GitHubError('exchange_failed', error instanceof Error ? error.name : undefined);
  }
  if (typeof body.access_token !== 'string' || !body.access_token)
    throw new GitHubError('exchange_failed', typeof body.error === 'string' ? body.error : 'no token');
  return body.access_token;
}

export async function fetchAccount(fetch: Fetch, token: string): Promise<GitHubAccount> {
  try {
    const [userRes, emailsRes] = await Promise.all([
      fetch(`${GITHUB.api}/user`, { headers: apiHeaders(token), signal: AbortSignal.timeout(TIMEOUT_MS) }),
      fetch(`${GITHUB.api}/user/emails`, {
        headers: apiHeaders(token),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      }),
    ]);
    if (!userRes.ok || !emailsRes.ok)
      throw new GitHubError('profile_failed', `HTTP ${userRes.status}/${emailsRes.status}`);
    const user = (await userRes.json()) as { id?: unknown; login?: unknown; name?: unknown };
    const emails = (await emailsRes.json()) as unknown;
    if (
      !Number.isSafeInteger(user.id) ||
      (user.id as number) <= 0 ||
      typeof user.login !== 'string' ||
      !user.login
    )
      throw new GitHubError('profile_failed', 'account');
    const verifiedPrimaryEmail =
      Array.isArray(emails) &&
      emails.some(
        (e: { primary?: unknown; verified?: unknown; email?: unknown }) =>
          e?.primary === true && e?.verified === true && typeof e?.email === 'string',
      );
    return {
      id: user.id as number,
      login: user.login,
      name: typeof user.name === 'string' && user.name.trim() ? user.name : null,
      verifiedPrimaryEmail,
    };
  } catch (error) {
    if (error instanceof GitHubError) throw error;
    throw new GitHubError('profile_failed', error instanceof Error ? error.name : undefined);
  }
}

// Révocation du jeton GitHub dès la lecture du compte faite. Un échec n'empêche pas la connexion : le jeton
// n'est conservé nulle part et expire côté GitHub.
export async function revokeToken(config: GitHubOAuthConfig, fetch: Fetch, token: string): Promise<boolean> {
  try {
    const res = await fetch(`${GITHUB.api}/applications/${encodeURIComponent(config.clientId)}/token`, {
      method: 'DELETE',
      headers: {
        accept: 'application/vnd.github+json',
        authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`,
        'content-type': 'application/json',
        'user-agent': 'tokenhood',
        'x-github-api-version': '2022-11-28',
      },
      body: JSON.stringify({ access_token: token }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return res.status === 204;
  } catch {
    return false;
  }
}
