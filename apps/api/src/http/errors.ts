// Erreurs localisées selon Accept-Language : { error, message, fields? }. Les erreurs de la couche métier
// (DomainError) portent leur clé de message ; les erreurs de Fastify reçoivent un message générique localisé.
import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { Type } from '@fastify/type-provider-typebox';
import { translate, type MessageKey, type Values } from '@tokenhood/i18n';
import { isDomainError, type FieldError } from '@tokenhood/core/common';
import { langOf } from './lang.js';

export const ErrorBody = Type.Object({
  error: Type.String(),
  message: Type.String(),
  fields: Type.Optional(Type.Array(Type.Object({ field: Type.String(), message: Type.String() }))),
});

export function sendError(
  request: FastifyRequest,
  reply: FastifyReply,
  status: number,
  code: string,
  key: MessageKey,
  values?: Values,
  fields: FieldError[] = [],
) {
  const lang = langOf(request);
  const body: { error: string; message: string; fields?: { field: string; message: string }[] } = {
    error: code,
    message: translate(lang, key, values),
  };
  if (fields.length)
    body.fields = fields.map((f) => ({ field: f.field, message: translate(lang, f.key, f.values) }));
  return reply.code(status).type('application/json').send(body);
}

// Fastify 5 type l'erreur en unknown : on n'en garde que ce qui est sûr.
function describe(error: unknown) {
  const e: Partial<FastifyError> = typeof error === 'object' && error !== null ? error : {};
  return {
    status: typeof e.statusCode === 'number' ? e.statusCode : 500,
    code: typeof e.code === 'string' ? e.code : 'bad_request',
    validation: Array.isArray(e.validation) ? e.validation : null,
  };
}

const fieldOf = (v: { instancePath?: string; params?: Record<string, unknown> }) => {
  const path = (v.instancePath ?? '').replace(/^\//, '').replaceAll('/', '.');
  const missing = typeof v.params?.missingProperty === 'string' ? v.params.missingProperty : '';
  const extra = typeof v.params?.additionalProperty === 'string' ? v.params.additionalProperty : '';
  return [path, missing || extra].filter(Boolean).join('.') || 'body';
};

export function installErrors(app: FastifyInstance) {
  app.addHook('onSend', async (request, reply) => {
    reply.header('content-language', langOf(request));
  });

  app.setNotFoundHandler(async (request, reply) =>
    sendError(request, reply, 404, 'not_found', 'errors.notFound', { path: request.url }),
  );

  app.setErrorHandler(async (error, request, reply) => {
    if (isDomainError(error))
      return sendError(request, reply, error.status, error.code, error.key, error.values, error.fields);
    const { status, code, validation } = describe(error);
    if (status >= 500) {
      request.log.error(error);
      return sendError(request, reply, 500, 'internal', 'errors.internal');
    }
    if (validation) {
      const fields = [...new Set(validation.map(fieldOf))].map((field) => ({
        field,
        key: 'errors.fieldInvalid' as const,
      }));
      return sendError(request, reply, 400, 'bad_request', 'errors.badRequest', undefined, fields);
    }
    if (status === 415)
      return sendError(request, reply, 415, 'unsupported_media_type', 'errors.unsupportedMediaType');
    if (status === 413) return sendError(request, reply, 413, 'payload_too_large', 'errors.payloadTooLarge');
    return sendError(
      request,
      reply,
      status,
      code === 'bad_request' ? code : code.toLowerCase(),
      'errors.badRequest',
    );
  });
}
