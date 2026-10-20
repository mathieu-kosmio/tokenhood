// Routes /v1/users/me : profil de l'utilisateur connecté (ETag, If-Match), documents acceptés.
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@fastify/type-provider-typebox';
import { DomainError } from '@tokenhood/core/common';
import { acceptDocument, getMe, listAcceptances, updateMe } from '@tokenhood/core/identity';
import { identityContext } from '../../deps.js';
import { etagOf, versionFromIfMatch } from '../../http/etag.js';
import { ErrorBody } from '../../http/errors.js';
import {
  AcceptanceBody,
  AcceptanceInput,
  AcceptancePage,
  acceptanceBody,
  MeBody,
  meBody,
  PatchHeaders,
  ProfilePatch,
  WriteHeaders,
} from './schemas.js';

const security = [{ session: [] }];
const errors = { 400: ErrorBody, 401: ErrorBody, 403: ErrorBody, 503: ErrorBody };

const routes: FastifyPluginAsyncTypebox = async (app) => {
  const context = () => {
    const ctx = identityContext(app.deps);
    if (!ctx) throw new DomainError('unavailable', 503, 'errors.unavailable');
    return ctx;
  };

  app.get(
    '/v1/users/me',
    {
      schema: {
        summary: 'Profil de l’utilisateur connecté et état de son inscription',
        tags: ['identity'],
        security,
        response: { 200: MeBody, ...errors },
      },
    },
    async (request, reply) => {
      const me = await getMe(context(), request.actor);
      reply.header('etag', etagOf(me.version));
      return meBody(me);
    },
  );

  app.patch(
    '/v1/users/me',
    {
      config: { idempotent: true },
      schema: {
        summary: 'Modifier le profil (nom affiché, rôles, langue, fuseau horaire)',
        tags: ['identity'],
        security,
        headers: PatchHeaders,
        body: ProfilePatch,
        response: { 200: MeBody, ...errors, 409: ErrorBody, 412: ErrorBody, 422: ErrorBody, 428: ErrorBody },
      },
    },
    async (request, reply) => {
      const body = request.body;
      const me = await updateMe(
        context(),
        request.actor,
        { displayName: body.display_name, roles: body.roles, lang: body.lang, timezone: body.timezone },
        versionFromIfMatch(request.headers['if-match']),
      );
      reply.header('etag', etagOf(me.version));
      return meBody(me);
    },
  );

  app.get(
    '/v1/users/me/acceptances',
    {
      schema: {
        summary: 'Historique des documents acceptés (pagination par curseur)',
        tags: ['identity'],
        security,
        querystring: Type.Object({
          limit: Type.Optional(Type.String({ pattern: '^[0-9]{1,3}$' })),
          cursor: Type.Optional(Type.String({ maxLength: 256 })),
        }),
        response: { 200: AcceptancePage, ...errors },
      },
    },
    async (request) => {
      const page = await listAcceptances(context(), request.actor, request.query);
      return { items: page.items.map(acceptanceBody), next_cursor: page.next_cursor };
    },
  );

  app.post(
    '/v1/users/me/acceptances',
    {
      config: { idempotent: true },
      schema: {
        summary: 'Accepter un document dans sa version courante',
        tags: ['identity'],
        security,
        headers: WriteHeaders,
        body: AcceptanceInput,
        response: { 200: AcceptanceBody, 201: AcceptanceBody, ...errors, 404: ErrorBody, 409: ErrorBody },
      },
    },
    async (request, reply) => {
      const { acceptance, created } = await acceptDocument(context(), request.actor, request.body);
      return reply.code(created ? 201 : 200).send(acceptanceBody(acceptance));
    },
  );
};

export default routes;
