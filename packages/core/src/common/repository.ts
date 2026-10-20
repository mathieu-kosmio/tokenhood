// Référence normalisée d'un dépôt GitHub (« github:owner/name », en minuscules), en attendant l'entité Project.
// GitHub ne distingue pas la casse des comptes ni des dépôts : deux écritures du même dépôt donnent la même référence.

export interface RepositoryRef {
  forge: 'github';
  owner: string;
  name: string;
  ref: string;
}

const OWNER = /^[a-z0-9](?:[a-z0-9]|-(?=[a-z0-9])){0,38}$/;
const NAME = /^[a-z0-9._-]{1,100}$/;

const FORMS = [
  /^github:([^/\s]+)\/([^/\s]+)$/i,
  /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^/\s]+)\/([^/\s?#]+?)(?:\.git)?\/?(?:[?#].*)?$/i,
  /^git@github\.com:([^/\s]+)\/([^/\s]+?)(?:\.git)?$/i,
  /^([^/\s:]+)\/([^/\s]+)$/,
];

export function parseRepository(input: string): RepositoryRef | null {
  const text = input.trim();
  for (const form of FORMS) {
    const match = form.exec(text);
    if (!match) continue;
    const owner = (match[1] ?? '').toLowerCase();
    const name = (match[2] ?? '').toLowerCase().replace(/\.git$/, '');
    if (!OWNER.test(owner) || !NAME.test(name) || name === '.' || name === '..') return null;
    return { forge: 'github', owner, name, ref: `github:${owner}/${name}` };
  }
  return null;
}
