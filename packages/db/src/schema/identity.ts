// Module identity (TH-102) : utilisateurs, identités de forge, sessions, états OAuth, acceptations de documents.
// Aucune adresse email ni jeton de forge n'est conservé : l'email vérifié n'est contrôlé qu'à la connexion.
import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

const at = (name: string) => timestamp(name, { withTimezone: true });

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey(),
    displayName: text('display_name').notNull(),
    roles: text('roles')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    lang: text('lang').notNull().default('fr'),
    timezone: text('timezone'),
    // Rôle administrateur provisoire (gouvernance jusqu'à TH-104), attribué par commande d'exploitation.
    admin: boolean('admin').notNull().default(false),
    // Version du profil : sert d'ETag, incrémentée à chaque modification.
    version: integer('version').notNull().default(1),
    createdAt: at('created_at').notNull().defaultNow(),
    updatedAt: at('updated_at').notNull().defaultNow(),
  },
  (t) => [
    check('users_lang_check', sql`${t.lang} in ('fr', 'en')`),
    check('users_roles_check', sql`${t.roles} <@ array['contributor', 'maintainer']::text[]`),
  ],
);

// Compte de forge rattaché à un utilisateur, par son identifiant numérique (jamais par le login, qui change).
export const identities = pgTable(
  'identities',
  {
    provider: text('provider').notNull(),
    subject: text('subject').notNull(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    login: text('login').notNull(),
    createdAt: at('created_at').notNull().defaultNow(),
    updatedAt: at('updated_at').notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.provider, t.subject] }),
    index('identities_user_id_idx').on(t.userId),
    check('identities_provider_check', sql`${t.provider} in ('github')`),
    check('identities_subject_check', sql`${t.subject} ~ '^[0-9]+$'`),
  ],
);

// Session d'un humain : seul le condensat du jeton opaque est conservé.
export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    tokenHash: text('token_hash').notNull().unique(),
    createdAt: at('created_at').notNull().defaultNow(),
    expiresAt: at('expires_at').notNull(),
    revokedAt: at('revoked_at'),
  },
  (t) => [index('sessions_user_id_idx').on(t.userId)],
);

// État OAuth à usage unique (condensat) et vérificateur PKCE, supprimés à la consommation.
export const oauthStates = pgTable('oauth_states', {
  stateHash: text('state_hash').primaryKey(),
  provider: text('provider').notNull(),
  codeVerifier: text('code_verifier').notNull(),
  returnTo: text('return_to').notNull(),
  lang: text('lang').notNull(),
  createdAt: at('created_at').notNull().defaultNow(),
  expiresAt: at('expires_at').notNull(),
});

// Acceptation horodatée d'un document dans une version donnée ; jamais modifiée ni supprimée.
export const documentAcceptances = pgTable(
  'document_acceptances',
  {
    id: uuid('id').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    document: text('document').notNull(),
    version: integer('version').notNull(),
    acceptedAt: at('accepted_at').notNull().defaultNow(),
  },
  (t) => [
    unique('document_acceptances_user_document_version_key').on(t.userId, t.document, t.version),
    index('document_acceptances_user_id_idx').on(t.userId, t.id),
  ],
);
