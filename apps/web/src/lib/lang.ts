// Langue d'une requête : choix explicite (?lang=), puis cookie, puis Accept-Language.
import { isLang, negotiate, type Lang } from '@tokenhood/i18n';

export const LANG_COOKIE = 'lang';

export interface LangSources {
  query: string | null;
  cookie: string | undefined;
  acceptLanguage: string | null;
}

export function resolveLang({ query, cookie, acceptLanguage }: LangSources): {
  lang: Lang;
  remember: boolean;
} {
  if (isLang(query)) return { lang: query, remember: query !== cookie };
  if (isLang(cookie)) return { lang: cookie, remember: false };
  return { lang: negotiate(acceptLanguage), remember: false };
}
