// Représentation REST du module identity (snake_case), décrite dans l'OpenAPI.
import { Type } from '@fastify/type-provider-typebox';
import type { AcceptanceRecord, Me } from '@tokenhood/core/identity';

const Lang = Type.Union([Type.Literal('fr'), Type.Literal('en')]);
const Role = Type.Union([Type.Literal('contributor'), Type.Literal('maintainer')]);

export const MeBody = Type.Object({
  id: Type.String({ format: 'uuid' }),
  display_name: Type.String(),
  roles: Type.Array(Role),
  lang: Lang,
  timezone: Type.Union([Type.String(), Type.Null()]),
  admin: Type.Boolean({ description: 'Rôle administrateur provisoire (gouvernance jusqu’à TH-104)' }),
  github: Type.Union([Type.Object({ id: Type.String(), login: Type.String() }), Type.Null()]),
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.String({ format: 'date-time' }),
  registration: Type.Object({
    complete: Type.Boolean(),
    missing: Type.Array(
      Type.Union([Type.Literal('timezone'), Type.Literal('roles'), Type.Literal('documents')]),
    ),
    documents: Type.Array(
      Type.Object({
        id: Type.String(),
        version: Type.Integer(),
        url: Type.Object({ fr: Type.String(), en: Type.String() }),
        accepted: Type.Union([
          Type.Object({ version: Type.Integer(), at: Type.String({ format: 'date-time' }) }),
          Type.Null(),
        ]),
        current: Type.Boolean(),
      }),
    ),
  }),
});

export const ProfilePatch = Type.Object(
  {
    display_name: Type.Optional(Type.String({ maxLength: 400 })),
    roles: Type.Optional(Type.Array(Role, { maxItems: 2 })),
    lang: Type.Optional(Lang),
    timezone: Type.Optional(Type.String({ maxLength: 64 })),
  },
  { additionalProperties: false },
);

export const AcceptanceInput = Type.Object(
  { document: Type.String({ maxLength: 64 }), version: Type.Integer({ minimum: 1 }) },
  { additionalProperties: false },
);

export const AcceptanceBody = Type.Object({
  id: Type.String({ format: 'uuid' }),
  document: Type.String(),
  version: Type.Integer(),
  accepted_at: Type.String({ format: 'date-time' }),
});

export const AcceptancePage = Type.Object({
  items: Type.Array(AcceptanceBody),
  next_cursor: Type.Union([Type.String(), Type.Null()]),
});

export const WriteHeaders = Type.Object({
  'idempotency-key': Type.Optional(
    Type.String({
      description:
        'Obligatoire : clé unique de l’écriture, réutilisée pour la réessayer (1 à 255 caractères)',
    }),
  ),
});

export const PatchHeaders = Type.Object({
  'idempotency-key': WriteHeaders.properties['idempotency-key'],
  'if-match': Type.Optional(
    Type.String({ description: 'Obligatoire : ETag du profil lu (verrou optimiste)' }),
  ),
});

export const meBody = (me: Me) => ({
  id: me.id,
  display_name: me.displayName,
  roles: me.roles,
  lang: me.lang,
  timezone: me.timezone,
  admin: me.admin,
  github: me.github,
  created_at: me.createdAt.toISOString(),
  updated_at: me.updatedAt.toISOString(),
  registration: {
    complete: me.registration.complete,
    missing: me.registration.missing,
    documents: me.registration.documents.map((d) => ({
      id: d.id,
      version: d.version,
      url: d.url,
      accepted: d.accepted ? { version: d.accepted.version, at: d.accepted.at.toISOString() } : null,
      current: d.current,
    })),
  },
});

export const acceptanceBody = (a: AcceptanceRecord) => ({
  id: a.id,
  document: a.document,
  version: a.version,
  accepted_at: a.acceptedAt.toISOString(),
});
