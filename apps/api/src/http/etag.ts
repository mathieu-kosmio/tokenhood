// Verrou optimiste : l'ETag d'une ressource versionnée est « "v<version>" » ; une modification exige If-Match.
export const etagOf = (version: number): string => `"v${version}"`;

// Version attendue d'après If-Match : null si l'en-tête manque, -1 s'il ne désigne aucune version connue.
export function versionFromIfMatch(header: string | string[] | undefined): number | null {
  if (header === undefined) return null;
  const value = Array.isArray(header) ? header.join(',') : header;
  const match = /^\s*(?:W\/)?"v(\d{1,9})"\s*$/.exec(value);
  return match ? Number(match[1]) : -1;
}
