// Langue d'une requête : choix explicite (?lang=), puis langue du profil une fois connecté, puis cookie,
// puis Accept-Language. Un choix explicite d'un utilisateur connecté met son profil à jour.
import { isLang, negotiate, type Lang } from '@tokenhood/i18n';

export const LANG_COOKIE = 'lang';

export interface LangSources {
  query: string | null;
  profile?: Lang | null;
  cookie: string | undefined;
  acceptLanguage: string | null;
}

export function resolveLang({ query, profile = null, cookie, acceptLanguage }: LangSources): {
  lang: Lang;
  remember: boolean;
  updateProfile: boolean;
} {
  if (isLang(query))
    return { lang: query, remember: query !== cookie, updateProfile: profile !== null && query !== profile };
  if (profile) return { lang: profile, remember: profile !== cookie, updateProfile: false };
  if (isLang(cookie)) return { lang: cookie, remember: false, updateProfile: false };
  return { lang: negotiate(acceptLanguage), remember: false, updateProfile: false };
}
