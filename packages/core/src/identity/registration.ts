// État de l'inscription : complète quand le fuseau et au moins un rôle sont renseignés et que chaque document
// est accepté dans sa version courante. Tant qu'elle ne l'est pas, le compte n'accède qu'au parcours d'inscription.
import { DOCUMENTS, type DocumentId, type LegalDocument } from './documents.js';
import type { Lang } from '@tokenhood/i18n';

export interface Acceptance {
  document: string;
  version: number;
  acceptedAt: Date;
}

export interface DocumentStatus {
  id: DocumentId;
  version: number;
  url: Record<Lang, string>;
  // Dernière version acceptée par l'utilisateur, et quand.
  accepted: { version: number; at: Date } | null;
  current: boolean;
}

export type Missing = 'timezone' | 'roles' | 'documents';

export interface RegistrationStatus {
  complete: boolean;
  missing: Missing[];
  documents: DocumentStatus[];
}

export function registrationStatus(
  profile: { timezone: string | null; roles: readonly string[] },
  acceptances: readonly Acceptance[],
  documents: readonly LegalDocument[] = DOCUMENTS,
): RegistrationStatus {
  const statuses = documents.map((doc): DocumentStatus => {
    const latest = acceptances
      .filter((a) => a.document === doc.id)
      .sort((a, b) => b.version - a.version || b.acceptedAt.getTime() - a.acceptedAt.getTime())[0];
    return {
      id: doc.id,
      version: doc.version,
      url: doc.url,
      accepted: latest ? { version: latest.version, at: latest.acceptedAt } : null,
      current: latest?.version === doc.version,
    };
  });
  const missing: Missing[] = [];
  if (!profile.timezone) missing.push('timezone');
  if (!profile.roles.length) missing.push('roles');
  if (statuses.some((s) => !s.current)) missing.push('documents');
  return { complete: missing.length === 0, missing, documents: statuses };
}
