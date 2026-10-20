// Documents à accepter pour terminer l'inscription : liste versionnée. Changer le texte d'un document en fait
// une nouvelle version ; tant qu'un utilisateur ne l'a pas acceptée, son inscription redevient incomplète.
// Le texte des documents est hors de ce module : seuls l'identifiant, la version et les adresses FR et EN y sont.
import type { Lang } from '@tokenhood/i18n';

export type DocumentId = 'charter' | 'terms' | 'privacy';

export interface LegalDocument {
  id: DocumentId;
  version: number;
  url: Record<Lang, string>;
}

const REPO = 'https://github.com/mathieu-kosmio/tokenhood/blob/main';

export const DOCUMENTS: readonly LegalDocument[] = [
  {
    id: 'charter',
    version: 1,
    url: { fr: `${REPO}/docs/charte/charte-amorcage.md`, en: `${REPO}/docs/charte/en/charte-amorcage.md` },
  },
  {
    id: 'terms',
    version: 1,
    url: {
      fr: 'https://tokenhood.kosm.io/conditions-utilisation/',
      en: 'https://tokenhood.kosm.io/en/terms-of-use/',
    },
  },
  {
    id: 'privacy',
    version: 1,
    url: { fr: 'https://tokenhood.kosm.io/confidentialite/', en: 'https://tokenhood.kosm.io/en/privacy/' },
  },
];
