// Contrôles d'accessibilité sur le HTML rendu côté serveur (tests de rendu) : chaque champ a son étiquette,
// chaque référence aria-describedby existe, une erreur est reliée à son champ, aucun ordre de tabulation forcé.
export type Attributes = Record<string, string>;

export function elements(html: string, tag: string): Attributes[] {
  return [...html.matchAll(new RegExp(`<${tag}\\b([^>]*)>`, 'g'))].map((m) => {
    const attrs: Attributes = {};
    for (const a of (m[1] ?? '').matchAll(/([:\w-]+)(?:="([^"]*)")?/g)) attrs[a[1]!] = a[2] ?? '';
    return attrs;
  });
}

export function textOf(html: string, id: string): string | null {
  const match = new RegExp(`<(\\w+)\\b[^>]*\\bid="${id}"[^>]*>([\\s\\S]*?)</\\1>`).exec(html);
  return match ? match[2]!.replace(/<[^>]+>/g, '').trim() : null;
}

export function problems(html: string): string[] {
  const found: string[] = [];
  const ids = new Set(
    elements(html, '[a-z]+')
      .map((a) => a.id)
      .filter(Boolean),
  );
  const labels = new Set(elements(html, 'label').map((a) => a.for));
  const fields = [
    ...elements(html, 'input'),
    ...elements(html, 'select'),
    ...elements(html, 'textarea'),
  ].filter((a) => !['hidden', 'submit'].includes(a.type ?? ''));
  for (const field of fields) {
    if (!field.id) found.push(`champ sans identifiant : ${field.name}`);
    else if (!labels.has(field.id)) found.push(`champ sans étiquette : ${field.id}`);
  }
  for (const el of elements(html, '[a-z]+')) {
    for (const ref of (el['aria-describedby'] ?? '').split(' ').filter(Boolean))
      if (!ids.has(ref)) found.push(`aria-describedby vers un identifiant absent : ${ref}`);
    if (el.tabindex && Number(el.tabindex) > 0) found.push(`tabindex positif : ${el.id ?? '?'}`);
    if (el['aria-invalid'] === 'true' && !(el['aria-describedby'] ?? '').includes('-error'))
      found.push(`erreur non reliée à son champ : ${el.id}`);
  }
  for (const link of elements(html, 'a'))
    if (link.href?.startsWith('#') && link.href.length > 1 && !ids.has(link.href.slice(1)))
      found.push(`lien vers une ancre absente : ${link.href}`);
  return found;
}
