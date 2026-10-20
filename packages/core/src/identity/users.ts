// Profil de l'utilisateur connecté, documents acceptés. Chaque modification et chaque acceptation est inscrite
// au journal d'audit ; le profil porte une version qui sert de verrou optimiste (ETag, If-Match).
import { and, desc, eq, lt, sql } from 'drizzle-orm';
import type { Executor } from '@tokenhood/db';
import { documentAcceptances, identities, users } from '@tokenhood/db/schema/identity';
import { DEFAULT_LANG, isLang, type Lang } from '@tokenhood/i18n';
import { record } from '../audit/index.js';
import { authorize, type Actor } from '../common/actor.js';
import { decodeCursor, pageLimit, pageOf, type Page } from '../common/cursor.js';
import { DomainError, validationFailed } from '../common/errors.js';
import { isUuidV7, uuidv7 } from '../common/uuid.js';
import type { IdentityContext } from './context.js';
import { DOCUMENTS, type LegalDocument } from './documents.js';
import { identityOperations as ops } from './operations.js';
import { ROLES, validateProfile, type ProfileInput, type Role } from './profile.js';
import { registrationStatus, type RegistrationStatus } from './registration.js';

export interface Me {
  id: string;
  displayName: string;
  roles: Role[];
  lang: Lang;
  timezone: string | null;
  admin: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  github: { id: string; login: string } | null;
  registration: RegistrationStatus;
}

export async function loadMe(
  db: Executor,
  userId: string,
  documents: readonly LegalDocument[] = DOCUMENTS,
): Promise<Me | null> {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return null;
  const [github] = await db
    .select({ id: identities.subject, login: identities.login })
    .from(identities)
    .where(and(eq(identities.userId, userId), eq(identities.provider, 'github')))
    .limit(1);
  const acceptances = await db
    .select({
      document: documentAcceptances.document,
      version: documentAcceptances.version,
      acceptedAt: documentAcceptances.acceptedAt,
    })
    .from(documentAcceptances)
    .where(eq(documentAcceptances.userId, userId));
  const roles = ROLES.filter((r) => user.roles.includes(r));
  return {
    id: user.id,
    displayName: user.displayName,
    roles,
    lang: isLang(user.lang) ? user.lang : DEFAULT_LANG,
    timezone: user.timezone,
    admin: user.admin,
    version: user.version,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    github: github ?? null,
    registration: registrationStatus({ timezone: user.timezone, roles }, acceptances, documents),
  };
}

const gone = () => new DomainError('unauthenticated', 401, 'errors.unauthenticated');

export async function getMe(ctx: IdentityContext, actor: Actor | null): Promise<Me> {
  const human = authorize(actor, ops.readProfile);
  const me = await loadMe(ctx.db, human.userId, ctx.documents);
  if (!me) throw gone();
  return me;
}

const FIELD_NAMES = {
  displayName: 'display_name',
  roles: 'roles',
  lang: 'lang',
  timezone: 'timezone',
} as const;

// expectedVersion : version lue dans If-Match ; null si l'en-tête manque.
export async function updateMe(
  ctx: IdentityContext,
  actor: Actor | null,
  input: ProfileInput,
  expectedVersion: number | null,
): Promise<Me> {
  const human = authorize(actor, ops.updateProfile);
  const { changes, errors } = validateProfile(input);
  if (errors.length) throw validationFailed(errors);
  if (expectedVersion === null)
    throw new DomainError('precondition_required', 428, 'errors.preconditionRequired');
  const now = ctx.clock();
  const fields = (Object.keys(changes) as (keyof typeof FIELD_NAMES)[]).map((k) => FIELD_NAMES[k]);
  return ctx.db.transaction(async (tx) => {
    if (fields.length) {
      const [row] = await tx
        .update(users)
        .set({ ...changes, version: sql`${users.version} + 1`, updatedAt: now })
        .where(and(eq(users.id, human.userId), eq(users.version, expectedVersion)))
        .returning({ id: users.id });
      if (!row) throw new DomainError('precondition_failed', 412, 'errors.preconditionFailed');
      await record(tx, {
        actor: human,
        action: 'identity.profile.updated',
        subject: { type: 'user', id: human.userId },
        data: { fields },
        at: now,
      });
    }
    const me = await loadMe(tx, human.userId, ctx.documents);
    if (!me) throw gone();
    if (!fields.length && me.version !== expectedVersion)
      throw new DomainError('precondition_failed', 412, 'errors.preconditionFailed');
    return me;
  });
}

export interface AcceptanceRecord {
  id: string;
  document: string;
  version: number;
  acceptedAt: Date;
}

export async function acceptDocument(
  ctx: IdentityContext,
  actor: Actor | null,
  input: { document: string; version: number },
): Promise<{ acceptance: AcceptanceRecord; created: boolean }> {
  const human = authorize(actor, ops.acceptDocument);
  const doc = (ctx.documents ?? DOCUMENTS).find((d) => d.id === input.document);
  if (!doc)
    throw new DomainError('unknown_document', 404, 'identity.documents.errors.unknown', {
      document: input.document,
    });
  if (input.version !== doc.version)
    throw new DomainError('document_version_outdated', 409, 'identity.documents.errors.outdated', {
      document: doc.id,
      current: doc.version,
    });
  const now = ctx.clock();
  return ctx.db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(documentAcceptances)
      .values({
        id: uuidv7(now.getTime()),
        userId: human.userId,
        document: doc.id,
        version: doc.version,
        acceptedAt: now,
      })
      .onConflictDoNothing()
      .returning();
    if (inserted) {
      await record(tx, {
        actor: human,
        action: 'identity.document.accepted',
        subject: { type: 'user', id: human.userId },
        data: { document: doc.id, version: doc.version },
        at: now,
      });
      return { acceptance: inserted, created: true };
    }
    const [existing] = await tx
      .select()
      .from(documentAcceptances)
      .where(
        and(
          eq(documentAcceptances.userId, human.userId),
          eq(documentAcceptances.document, doc.id),
          eq(documentAcceptances.version, doc.version),
        ),
      )
      .limit(1);
    if (!existing) throw new Error('acceptation introuvable après conflit');
    return { acceptance: existing, created: false };
  });
}

const isIdPosition = (p: Record<string, string | number>): p is { id: string } => isUuidV7(p.id);

// Historique des acceptations, de la plus récente à la plus ancienne (UUID v7 : ordre de création).
export async function listAcceptances(
  ctx: IdentityContext,
  actor: Actor | null,
  params: { limit?: unknown; cursor?: string | undefined },
): Promise<Page<AcceptanceRecord>> {
  const human = authorize(actor, ops.listAcceptances);
  const limit = pageLimit(params.limit);
  const after = params.cursor ? decodeCursor(params.cursor, isIdPosition) : null;
  const rows = await ctx.db
    .select({
      id: documentAcceptances.id,
      document: documentAcceptances.document,
      version: documentAcceptances.version,
      acceptedAt: documentAcceptances.acceptedAt,
    })
    .from(documentAcceptances)
    .where(
      and(
        eq(documentAcceptances.userId, human.userId),
        after ? lt(documentAcceptances.id, after.id) : undefined,
      ),
    )
    .orderBy(desc(documentAcceptances.id))
    .limit(limit + 1);
  return pageOf(rows, limit, (row) => ({ id: row.id }));
}
