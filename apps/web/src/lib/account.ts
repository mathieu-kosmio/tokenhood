// Rubriques de l'espace Compte, sans menu central : chaque dossier src/routes/account/<rubrique>/ déclare la
// sienne dans un fichier rubrique.ts (libellé, ordre, lien).
import type { MessageKey } from '@tokenhood/i18n';

export interface Rubrique {
  label: MessageKey;
  order: number;
  href: () => string;
}

const modules = import.meta.glob<{ rubrique: Rubrique }>('/src/routes/account/*/rubrique.ts', {
  eager: true,
});

export function rubriques(): (Rubrique & { id: string })[] {
  return Object.entries(modules)
    .map(([file, mod]) => ({ ...mod.rubrique, id: file.split('/').at(-2) ?? file }))
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}
