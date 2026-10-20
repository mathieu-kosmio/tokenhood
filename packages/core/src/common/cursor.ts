// Pagination par curseur : un curseur opaque (JSON en base64url) désigne la dernière ligne d'une page.
// Chaque module choisit sa clé de tri, toujours complétée par un identifiant unique.
import { DomainError } from './errors.js';

export type Position = Record<string, string | number>;

export interface Page<T> {
  items: T[];
  next_cursor: string | null;
}

export const PAGE_SIZE = { default: 20, max: 100 } as const;

export function pageLimit(raw: unknown): number {
  if (raw === undefined || raw === null || raw === '') return PAGE_SIZE.default;
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > PAGE_SIZE.max)
    throw new DomainError('invalid_limit', 400, 'errors.invalidLimit', { max: PAGE_SIZE.max });
  return n;
}

export function encodeCursor(position: Position): string {
  return Buffer.from(JSON.stringify(position), 'utf8').toString('base64url');
}

const invalid = () => new DomainError('invalid_cursor', 400, 'errors.invalidCursor');

export function decodeCursor<T extends Position>(cursor: string, valid: (value: Position) => value is T): T {
  let value: unknown;
  try {
    value = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
  } catch {
    throw invalid();
  }
  if (
    typeof value !== 'object' ||
    value === null ||
    Array.isArray(value) ||
    !Object.values(value).every((v) => typeof v === 'string' || typeof v === 'number') ||
    !valid(value as Position)
  )
    throw invalid();
  return value as T;
}

// Les lignes sont lues avec limit + 1 : la ligne en trop indique qu'une page suivante existe.
export function pageOf<T>(rows: T[], limit: number, position: (row: T) => Position): Page<T> {
  const items = rows.slice(0, limit);
  const last = items.at(-1);
  return {
    items,
    next_cursor: rows.length > limit && last !== undefined ? encodeCursor(position(last)) : null,
  };
}
