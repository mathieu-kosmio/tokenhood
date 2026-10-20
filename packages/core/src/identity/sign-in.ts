// Connexion par GitHub : état à usage unique lié au navigateur, PKCE S256, compte rattaché à l'identifiant
// numérique GitHub, refus sans email principal vérifié, jeton GitHub révoqué et jamais conservé.
import { and, eq, lt } from 'drizzle-orm';
import { timingSafeEqual } from 'node:crypto';
import { identities, oauthStates, users } from '@tokenhood/db/schema/identity';
import { DEFAULT_LANG, isLang, type Lang } from '@tokenhood/i18n';
import { record } from '../audit/index.js';
import { uuidv7 } from '../common/uuid.js';
import { STATE_TTL_MS, type GitHubContext, type IdentityContext } from './context.js';
import {
  authorizeUrl,
  exchangeCode,
  fetchAccount,
  GitHubError,
  revokeToken,
  type GitHubAccount,
  type GitHubFailure,
} from './github.js';
import { DISPLAY_NAME_MAX, normalizeDisplayName, validateProfile } from './profile.js';
import { openSession, type OpenedSession } from './sessions.js';
import { keyedHash, pkceChallenge, randomToken, safeReturnTo } from './tokens.js';

export type SignInFailure = 'state_invalid' | 'email_unverified' | GitHubFailure;

export class SignInError extends Error {
  readonly reason: SignInFailure;
  constructor(reason: SignInFailure) {
    super(reason);
    this.name = 'SignInError';
    this.reason = reason;
  }
}

export async function beginGitHubSignIn(
  ctx: GitHubContext,
  params: { returnTo?: unknown; lang: Lang },
): Promise<{ url: string; state: string; expiresAt: Date }> {
  const now = ctx.clock();
  const state = randomToken();
  const verifier = randomToken();
  const expiresAt = new Date(now.getTime() + STATE_TTL_MS);
  await ctx.db.delete(oauthStates).where(lt(oauthStates.expiresAt, now));
  await ctx.db.insert(oauthStates).values({
    stateHash: keyedHash(ctx.sessionSecret, state),
    provider: 'github',
    codeVerifier: verifier,
    returnTo: safeReturnTo(params.returnTo),
    lang: params.lang,
    createdAt: now,
    expiresAt,
  });
  return {
    url: authorizeUrl(ctx.github, { state, codeChallenge: pkceChallenge(verifier) }),
    state,
    expiresAt,
  };
}

const sameString = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export interface SignedIn {
  userId: string;
  created: boolean;
  session: OpenedSession;
  returnTo: string;
  lang: Lang;
}

// params : paramètres de l'URL de rappel (state, code ou error) et état du cookie posé au départ.
export async function completeGitHubSignIn(
  ctx: GitHubContext,
  params: {
    state?: string | undefined;
    code?: string | undefined;
    error?: string | undefined;
    cookieState?: string | undefined;
  },
): Promise<SignedIn> {
  const { state, cookieState } = params;
  if (!state || !cookieState || !sameString(state, cookieState)) throw new SignInError('state_invalid');
  // L'état est consommé avant toute autre vérification : il ne sert qu'une fois, même si la suite échoue.
  const [row] = await ctx.db
    .delete(oauthStates)
    .where(
      and(eq(oauthStates.stateHash, keyedHash(ctx.sessionSecret, state)), eq(oauthStates.provider, 'github')),
    )
    .returning();
  if (!row || row.expiresAt.getTime() <= ctx.clock().getTime()) throw new SignInError('state_invalid');
  if (params.error) throw new SignInError(params.error === 'access_denied' ? 'denied' : 'exchange_failed');
  if (!params.code) throw new SignInError('exchange_failed');
  let account: GitHubAccount;
  try {
    const token = await exchangeCode(ctx.github, ctx.fetch, {
      code: params.code,
      codeVerifier: row.codeVerifier,
    });
    try {
      account = await fetchAccount(ctx.fetch, token);
    } finally {
      await revokeToken(ctx.github, ctx.fetch, token);
    }
  } catch (error) {
    if (error instanceof GitHubError) throw new SignInError(error.failure);
    throw error;
  }
  if (!account.verifiedPrimaryEmail) throw new SignInError('email_unverified');
  const lang = isLang(row.lang) ? row.lang : DEFAULT_LANG;
  const signedIn = await signInWithGitHubAccount(ctx, account, { lang });
  return { ...signedIn, returnTo: row.returnTo, lang };
}

const isUniqueViolation = (error: unknown): boolean => {
  const e = error as { code?: unknown; cause?: { code?: unknown } } | null;
  return e?.code === '23505' || e?.cause?.code === '23505';
};

function initialDisplayName(account: Pick<GitHubAccount, 'login' | 'name'>): string {
  const fromName = account.name
    ? [...normalizeDisplayName(account.name)].slice(0, DISPLAY_NAME_MAX).join('')
    : '';
  return fromName && !validateProfile({ displayName: fromName }).errors.length ? fromName : account.login;
}

// Trouve ou crée l'utilisateur rattaché au compte GitHub, met à jour son login, ouvre une session.
export async function signInWithGitHubAccount(
  ctx: IdentityContext,
  account: Pick<GitHubAccount, 'id' | 'login' | 'name'>,
  options: { lang: Lang },
): Promise<Omit<SignedIn, 'returnTo' | 'lang'>> {
  const subject = String(account.id);
  for (let attempt = 0; ; attempt += 1) {
    const now = ctx.clock();
    try {
      return await ctx.db.transaction(async (tx) => {
        const [existing] = await tx
          .select({ userId: identities.userId, login: identities.login })
          .from(identities)
          .where(and(eq(identities.provider, 'github'), eq(identities.subject, subject)))
          .limit(1);
        let userId: string;
        let created = false;
        if (existing) {
          userId = existing.userId;
          if (existing.login !== account.login)
            await tx
              .update(identities)
              .set({ login: account.login, updatedAt: now })
              .where(and(eq(identities.provider, 'github'), eq(identities.subject, subject)));
        } else {
          userId = uuidv7(now.getTime());
          created = true;
          await tx.insert(users).values({
            id: userId,
            displayName: initialDisplayName(account),
            lang: options.lang,
            createdAt: now,
            updatedAt: now,
          });
          await tx.insert(identities).values({
            provider: 'github',
            subject,
            userId,
            login: account.login,
            createdAt: now,
            updatedAt: now,
          });
          await record(tx, {
            actor: { kind: 'human', userId, admin: false, registered: false, sessionId: null },
            action: 'identity.account.created',
            subject: { type: 'user', id: userId },
            data: { provider: 'github' },
            at: now,
          });
        }
        const session = await openSession(tx, ctx, userId, now);
        return { userId, created, session };
      });
    } catch (error) {
      // Deux premières connexions simultanées du même compte : la seconde retrouve l'utilisateur créé.
      if (attempt === 0 && isUniqueViolation(error)) continue;
      throw error;
    }
  }
}
