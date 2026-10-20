// Application Fastify de l'API REST (ADR-002). Les règles vivent dans packages/core ; l'API résout l'acteur
// (src/auth/), applique les conventions HTTP communes (src/http/) et charge chaque module de routes de src/routes/.
import Fastify, { type FastifyRequest, type FastifyServerOptions } from 'fastify';
import cookie from '@fastify/cookie';
import swagger from '@fastify/swagger';
import { Type, type TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { LANGS, catalog, isLang, translate } from '@tokenhood/i18n';
import type { Database } from '@tokenhood/db';
import { systemClock, type Clock } from '@tokenhood/core/common';
import { DOCUMENTS, type Fetch, type LegalDocument } from '@tokenhood/core/identity';
import { installAuth, SESSION_COOKIE } from './auth/index.js';
import { configFromEnv, type ApiConfig } from './config.js';
import type { Deps } from './deps.js';
import { ErrorBody, installErrors } from './http/errors.js';
import { installIdempotency } from './http/idempotency.js';
import { langOf } from './http/lang.js';
import { loadRouteModules } from './http/routes.js';

export const VERSION = '0.1.0';

export interface AppOptions {
  logger?: boolean | { level: string };
  db?: Database | null;
  config?: ApiConfig;
  fetch?: Fetch;
  clock?: Clock;
  documents?: readonly LegalDocument[];
}

// Le code d'autorisation et l'état OAuth de l'URL de rappel ne s'écrivent jamais dans les journaux.
export const redactUrl = (url: string): string => url.replace(/([?&](?:code|state)=)[^&#]*/g, '$1[masqué]');

const loggerOf = (logger: AppOptions['logger']): NonNullable<FastifyServerOptions['logger']> =>
  logger
    ? {
        ...(typeof logger === 'object' ? logger : {}),
        serializers: {
          req: (req: FastifyRequest) => ({
            method: req.method,
            url: redactUrl(req.url),
            host: req.host,
            remoteAddress: req.ip,
          }),
        },
      }
    : false;

export async function buildApp(options: AppOptions = {}) {
  const app = Fastify({ logger: loggerOf(options.logger) }).withTypeProvider<TypeBoxTypeProvider>();

  const deps: Deps = {
    db: options.db ?? null,
    clock: options.clock ?? systemClock,
    fetch: options.fetch ?? globalThis.fetch,
    config: options.config ?? configFromEnv({}),
    documents: options.documents ?? DOCUMENTS,
  };
  app.decorate('deps', deps);

  await app.register(cookie);
  await app.register(swagger, {
    openapi: {
      openapi: '3.1.0',
      info: { title: 'Tokenhood API', version: VERSION },
      servers: [{ url: '/' }],
      components: {
        securitySchemes: { session: { type: 'apiKey', in: 'cookie', name: SESSION_COOKIE } },
      },
    },
  });

  installErrors(app);
  installAuth(app);
  installIdempotency(app);

  app.get(
    '/healthz',
    {
      schema: {
        summary: 'Sonde de disponibilité',
        response: { 200: Type.Object({ status: Type.Literal('ok'), version: Type.String() }) },
      },
    },
    async () => ({ status: 'ok' as const, version: VERSION }),
  );

  app.get(
    '/v1/i18n/:lang',
    {
      schema: {
        summary: "Catalogue des messages d'interface d'une langue",
        params: Type.Object({ lang: Type.String() }),
        response: { 200: Type.Record(Type.String(), Type.String()), 404: ErrorBody },
      },
    },
    async (request, reply) => {
      const { lang } = request.params;
      if (!isLang(lang)) {
        return reply.code(404).send({
          error: 'unsupported_language',
          message: translate(langOf(request), 'errors.unsupportedLanguage', {
            lang,
            available: LANGS.join(', '),
          }),
        });
      }
      return catalog(lang);
    },
  );

  app.get('/v1/openapi.json', { schema: { hide: true } }, async () => app.swagger());

  await loadRouteModules(app);

  return app;
}
