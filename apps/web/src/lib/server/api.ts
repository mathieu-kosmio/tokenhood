// Appels de l'interface web à l'API REST, côté serveur : le cookie de session est transmis, la langue aussi
// (messages d'erreur localisés), chaque écriture porte une clé d'idempotence.
import { randomUUID } from 'node:crypto';
import type { Lang } from '@tokenhood/i18n';
import { webConfig } from './config.js';

export const SESSION_COOKIE = 'th_session';

export interface ApiError {
  error: string;
  message: string;
  fields?: { field: string; message: string }[];
}

export interface ApiResult<T> {
  // 0 : API injoignable.
  status: number;
  ok: boolean;
  body: T | null;
  error: ApiError | null;
  etag: string | null;
}

export interface ApiCall {
  method?: 'GET' | 'POST' | 'PATCH';
  body?: unknown;
  session?: string | null;
  lang: Lang;
  idempotencyKey?: string;
  ifMatch?: string | null;
}

export const newIdempotencyKey = () => randomUUID();

export async function api<T>(
  path: string,
  call: ApiCall,
  fetcher: typeof fetch = fetch,
): Promise<ApiResult<T>> {
  const headers: Record<string, string> = { accept: 'application/json', 'accept-language': call.lang };
  if (call.session) headers.cookie = `${SESSION_COOKIE}=${call.session}`;
  if (call.body !== undefined) headers['content-type'] = 'application/json';
  if (call.idempotencyKey) headers['idempotency-key'] = call.idempotencyKey;
  if (call.ifMatch) headers['if-match'] = call.ifMatch;
  let res: Response;
  try {
    res = await fetcher(`${webConfig().apiUrl}${path}`, {
      method: call.method ?? 'GET',
      headers,
      body: call.body === undefined ? null : JSON.stringify(call.body),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    return { status: 0, ok: false, body: null, error: null, etag: null };
  }
  const json: unknown = res.status === 204 ? null : await res.json().catch(() => null);
  return {
    status: res.status,
    ok: res.ok,
    body: res.ok ? (json as T) : null,
    error: res.ok ? null : ((json as ApiError | null) ?? null),
    etag: res.headers.get('etag'),
  };
}
