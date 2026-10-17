// Socle i18n de la plateforme : messages ICU de locales/, négociation de la langue, traduction.
import { IntlMessageFormat, type PrimitiveType } from 'intl-messageformat';
import { messages } from './messages.js';

export const LANGS = ['fr', 'en'] as const;
export type Lang = (typeof LANGS)[number];
export type MessageKey = keyof (typeof messages)['fr'];
export type Values = Record<string, PrimitiveType>;

// Langue de repli quand le navigateur n'en propose aucune de prise en charge.
export const DEFAULT_LANG: Lang = 'fr';

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (LANGS as readonly string[]).includes(value);
}

// Choisit la langue d'après un en-tête Accept-Language (q-values respectées).
export function negotiate(acceptLanguage: string | null | undefined, fallback: Lang = DEFAULT_LANG): Lang {
  if (!acceptLanguage) return fallback;
  const ranked = acceptLanguage
    .split(',')
    .map((part, index) => {
      const [tag = '', ...params] = part.trim().split(';');
      const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
      return { lang: tag.trim().toLowerCase().split('-')[0] ?? '', q: q ? Number(q.slice(2)) : 1, index };
    })
    .filter((r) => r.lang && Number.isFinite(r.q) && r.q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index);
  return ranked.map((r) => r.lang).find(isLang) ?? fallback;
}

const cache = new Map<string, IntlMessageFormat>();

export function translate(lang: Lang, key: MessageKey, values?: Values): string {
  const id = `${lang}:${key}`;
  let format = cache.get(id);
  if (!format) {
    const source: string | undefined = messages[lang][key];
    if (source === undefined) throw new Error(`Message absent : ${id}`);
    format = new IntlMessageFormat(source, lang);
    cache.set(id, format);
  }
  return String(format.format(values));
}

export type Translator = (key: MessageKey, values?: Values) => string;

export function translator(lang: Lang): Translator {
  return (key, values) => translate(lang, key, values);
}

export function catalog(lang: Lang): Readonly<Record<MessageKey, string>> {
  return messages[lang];
}
