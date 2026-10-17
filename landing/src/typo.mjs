// Typographie appliquée aux chaînes des locales au moment du build, pour que les
// fichiers de traduction restent saisissables au clavier sans caractères invisibles.

const NNBSP = ' '; // espace fine insécable
const NBSP = ' ';

export function typo(lang, text) {
  let out = text.replace(/'/g, '’');
  if (lang === 'fr') {
    out = out
      .replace(/ ([?!;])/g, `${NNBSP}$1`)
      .replace(/ :/g, `${NBSP}:`)
      .replace(/« /g, `«${NBSP}`)
      .replace(/ »/g, `${NBSP}»`);
  }
  return out;
}

export function localize(lang, value) {
  if (typeof value === 'string') return typo(lang, value);
  if (Array.isArray(value)) return value.map((v) => localize(lang, v));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, localize(lang, v)]));
  }
  return value;
}
