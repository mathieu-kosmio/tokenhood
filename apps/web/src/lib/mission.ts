// Types et présentation d'une mission, partagés entre serveur et navigateur.
import type { Lang } from '@tokenhood/i18n';

export const STATUSES = [
  'draft',
  'open',
  'blocked',
  'in_progress',
  'awaiting_decision',
  'accepted',
  'integrated',
  'closed',
  'cancelled',
] as const;
export type Status = (typeof STATUSES)[number];

export interface Mission {
  id: string;
  lot: number | null;
  type: string;
  status: Status;
  title: string | Partial<Record<Lang, string>>;
}

export function titleIn(mission: Mission, lang: Lang): string {
  if (typeof mission.title === 'string') return mission.title;
  return mission.title[lang] ?? mission.title.fr ?? mission.title.en ?? mission.id;
}
