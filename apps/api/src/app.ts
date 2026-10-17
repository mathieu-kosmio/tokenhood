// Application Fastify de l'API REST (ADR-002). Les modules métier vivront dans packages/core ;
// ce squelette pose la santé, l'i18n des réponses et la description OpenAPI.
import Fastify, { type FastifyError, type FastifyRequest } from 'fastify';
import swagger from '@fastify/swagger';
import { Type, type TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { LANGS, catalog, isLang, negotiate, translate, type Lang } from '@tokenhood/i18n';

export const VERSION = '0.1.0';

export interface AppOptions {
  logger?: boolean | { level: string };
}

const langOf = (request: FastifyRequest): Lang => negotiate(request.headers['accept-language']);

const ErrorBody = Type.Object({ error: Type.String(), message: Type.String() });

// Fastify 5 type l'erreur en unknown : on n'en garde que ce qui est sûr.
function describe(error: unknown) {
  const e: Partial<FastifyError> = typeof error === 'object' && error !== null ? error : {};
  return {
    status: typeof e.statusCode === 'number' ? e.statusCode : 500,
    code: typeof e.code === 'string' ? e.code : 'bad_request',
    message: typeof e.message === 'string' ? e.message : '',
  };
}

export async function buildApp(options: AppOptions = {}) {
  const app = Fastify({ logger: options.logger ?? false }).withTypeProvider<TypeBoxTypeProvider>();

  await app.register(swagger, {
    openapi: {
      openapi: '3.1.0',
      info: { title: 'Tokenhood API', version: VERSION },
      servers: [{ url: '/' }],
    },
  });

  app.addHook('onSend', async (request, reply) => {
    reply.header('content-language', langOf(request));
  });

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

  app.setNotFoundHandler(async (request, reply) =>
    reply.code(404).send({
      error: 'not_found',
      message: translate(langOf(request), 'errors.notFound', { path: request.url }),
    }),
  );

  app.setErrorHandler(async (error, request, reply) => {
    const { status, code, message } = describe(error);
    if (status >= 500) request.log.error(error);
    return reply.code(status).send({
      error: status >= 500 ? 'internal' : code,
      message: status >= 500 ? translate(langOf(request), 'errors.internal') : message,
    });
  });

  return app;
}
