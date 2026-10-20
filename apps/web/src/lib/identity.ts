// Représentation, côté interface, du profil servi par l'API (/v1/users/me) et règles d'accès des pages.
import type { Lang } from '@tokenhood/i18n';

export const ROLES = ['contributor', 'maintainer'] as const;
export type Role = (typeof ROLES)[number];
export type DocumentId = 'charter' | 'terms' | 'privacy';

export interface DocumentStatus {
  id: DocumentId;
  version: number;
  url: Record<Lang, string>;
  accepted: { version: number; at: string } | null;
  current: boolean;
}

export interface Me {
  id: string;
  display_name: string;
  roles: Role[];
  lang: Lang;
  timezone: string | null;
  admin: boolean;
  github: { id: string; login: string } | null;
  registration: {
    complete: boolean;
    missing: ('timezone' | 'roles' | 'documents')[];
    documents: DocumentStatus[];
  };
}

export const DISPLAY_NAME_MAX = 80;
export const DEFAULT_TIMEZONE = 'Europe/Paris';

// Pages ouvertes pendant une inscription incomplète : le parcours d'inscription, la déconnexion, la sonde.
const DURING_REGISTRATION = ['/registration', '/logout', '/healthz'];

export function allowedDuringRegistration(pathname: string): boolean {
  return DURING_REGISTRATION.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

// Adresse de retour après connexion : un chemin de cette interface, jamais une autre origine.
export function safeReturnTo(value: string | null): string {
  if (
    !value ||
    value.length > 512 ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    /[\\\s]/.test(value)
  )
    return '/account';
  return value;
}

export function timezones(): string[] {
  return [...new Set([...Intl.supportedValuesOf('timeZone'), 'UTC'])].sort();
}
