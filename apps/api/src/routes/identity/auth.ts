// Routes /v1/auth : disponibilité de la connexion, parcours OAuth GitHub (départ, rappel), déconnexion.
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@fastify/type-provider-typebox';
import { negotiate } from '@tokenhood/i18n';
import {
  beginGitHubSignIn,
  completeGitHubSignIn,
  revokeSession,
  SignInError,
  type GitHubContext,
} from '@tokenhood/core/identity';
import { clearSession, SESSION_COOKIE, sessionCookie, STATE_COOKIE, stateCookie } from '../../auth/index.js';
import { identityContext, type Deps } from '../../deps.js';
import { ErrorBody, sendError } from '../../http/errors.js';
import { WriteHeaders } from './schemas.js';

const githubContext = (deps: Deps): GitHubContext | null => {
  const ctx = identityContext(deps);
  return ctx && deps.config.auth ? { ...ctx, github: deps.config.auth.github, fetch: deps.fetch } : null;
};

const routes: FastifyPluginAsyncTypebox = async (app) => {
  app.get(
    '/v1/auth/providers',
    {
      schema: {
        summary: 'Fournisseurs de connexion disponibles sur cette instance',
        tags: ['identity'],
        response: { 200: Type.Object({ github: Type.Object({ available: Type.Boolean() }) }) },
      },
    },
    async () => ({ github: { available: githubContext(app.deps) !== null } }),
  );

  app.get(
    '/v1/auth/github/start',
    {
      schema: {
        summary: 'Départ de la connexion GitHub (redirection vers GitHub, état à usage unique et PKCE S256)',
        tags: ['identity'],
        querystring: Type.Object({
          return_to: Type.Optional(
            Type.String({ maxLength: 512, description: 'Chemin de l’interface web après connexion' }),
          ),
          lang: Type.Optional(Type.String({ description: 'Langue initiale du profil créé (fr, en)' })),
        }),
        response: { 302: Type.Null(), 503: ErrorBody },
      },
    },
    async (request, reply) => {
      const ctx = githubContext(app.deps);
      if (!ctx) return sendError(request, reply, 503, 'auth_unavailable', 'identity.auth.unavailable');
      const lang = negotiate(request.query.lang ?? request.headers['accept-language']);
      const { url, state } = await beginGitHubSignIn(ctx, { returnTo: request.query.return_to, lang });
      reply.setCookie(STATE_COOKIE, state, stateCookie(app.deps.config));
      return reply.redirect(url, 302);
    },
  );

  app.get(
    '/v1/auth/github/callback',
    {
      schema: {
        summary: 'Rappel OAuth GitHub : ouvre la session et renvoie vers l’interface web',
        tags: ['identity'],
        querystring: Type.Object({
          code: Type.Optional(Type.String({ maxLength: 256 })),
          state: Type.Optional(Type.String({ maxLength: 256 })),
          error: Type.Optional(Type.String({ maxLength: 256 })),
        }),
        response: { 302: Type.Null() },
      },
    },
    async (request, reply) => {
      const { config } = app.deps;
      const ctx = githubContext(app.deps);
      const cookieState = request.cookies[STATE_COOKIE];
      reply.clearCookie(STATE_COOKIE, stateCookie(config));
      const toLogin = (reason: string) => reply.redirect(`${config.publicWebUrl}/login?error=${reason}`, 302);
      if (!ctx) return toLogin('unavailable');
      try {
        const signedIn = await completeGitHubSignIn(ctx, { ...request.query, cookieState });
        reply.setCookie(
          SESSION_COOKIE,
          signedIn.session.token,
          sessionCookie(config, signedIn.session.expiresAt),
        );
        return reply.redirect(`${config.publicWebUrl}${signedIn.returnTo}`, 302);
      } catch (error) {
        if (error instanceof SignInError) {
          request.log.info({ reason: error.reason }, 'connexion GitHub refusée');
          return toLogin(error.reason);
        }
        throw error;
      }
    },
  );

  app.post(
    '/v1/auth/logout',
    {
      config: { idempotent: true },
      schema: {
        summary: 'Déconnexion : révoque la session courante et efface le cookie',
        tags: ['identity'],
        headers: WriteHeaders,
        response: { 204: Type.Null(), 400: ErrorBody, 403: ErrorBody },
      },
    },
    async (request, reply) => {
      const ctx = identityContext(app.deps);
      if (ctx && request.actor) await revokeSession(ctx, request.actor);
      clearSession(reply, app.deps.config);
      return reply.code(204).send(null);
    },
  );
};

export default routes;
