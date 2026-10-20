// Profil : nom affiché, rôles (contributeur, porteur ou les deux), langue d'interface et fuseau horaire.
// L'organisation d'appartenance se déclare avec les liens d'intérêt (TH-103).
import { isLang, type Lang } from '@tokenhood/i18n';
import type { FieldError } from '../common/errors.js';

export const ROLES = ['contributor', 'maintainer'] as const;
export type Role = (typeof ROLES)[number];

export const DISPLAY_NAME_MAX = 80;

export interface ProfileInput {
  displayName?: unknown;
  roles?: unknown;
  lang?: unknown;
  timezone?: unknown;
}

export interface ProfileChanges {
  displayName?: string;
  roles?: Role[];
  lang?: Lang;
  timezone?: string;
}

let zones: Set<string> | undefined;

export function timezones(): string[] {
  zones ??= new Set([...Intl.supportedValuesOf('timeZone'), 'UTC']);
  return [...zones].sort();
}

export function isTimezone(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  if (!zones) timezones();
  return zones!.has(value);
}

// Caractères de contrôle et de mise en forme invisibles (bidi compris) refusés dans un nom affiché.
const INVISIBLE = /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/u;

export function normalizeDisplayName(value: string): string {
  return value.normalize('NFC').trim().replace(/\s+/g, ' ');
}

export function validateProfile(input: ProfileInput): { changes: ProfileChanges; errors: FieldError[] } {
  const changes: ProfileChanges = {};
  const errors: FieldError[] = [];
  if (input.displayName !== undefined) {
    const name = typeof input.displayName === 'string' ? normalizeDisplayName(input.displayName) : '';
    if (!name || [...name].length > DISPLAY_NAME_MAX || INVISIBLE.test(name))
      errors.push({
        field: 'display_name',
        key: 'identity.profile.errors.displayName',
        values: { max: DISPLAY_NAME_MAX },
      });
    else changes.displayName = name;
  }
  if (input.roles !== undefined) {
    const roles = Array.isArray(input.roles) ? input.roles : [];
    if (!roles.length || !roles.every((r): r is Role => (ROLES as readonly unknown[]).includes(r)))
      errors.push({ field: 'roles', key: 'identity.profile.errors.roles' });
    else changes.roles = ROLES.filter((r) => roles.includes(r));
  }
  if (input.lang !== undefined) {
    if (!isLang(input.lang)) errors.push({ field: 'lang', key: 'identity.profile.errors.lang' });
    else changes.lang = input.lang;
  }
  if (input.timezone !== undefined) {
    if (!isTimezone(input.timezone))
      errors.push({ field: 'timezone', key: 'identity.profile.errors.timezone' });
    else changes.timezone = input.timezone;
  }
  return { changes, errors };
}
