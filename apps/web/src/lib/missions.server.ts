// Catalogue en lecture seule des contrats de mission du dépôt (.tokenhood/missions/), lus au build.
// Le dépôt fait autorité pour les contrats ; l'état vivra sur la plateforme à partir du lot 2.
import { parse } from 'yaml';
import { STATUSES, type Mission, type Status } from './mission.js';

const sources = import.meta.glob<string>('../../../../.tokenhood/missions/*.yaml', {
  query: '?raw',
  import: 'default',
  eager: true,
});

export function parseMissions(files: Record<string, string>): Mission[] {
  return Object.values(files)
    .map((text) => parse(text) as Record<string, unknown>)
    .map((m) => ({
      id: String(m.id),
      lot: typeof m.lot === 'number' ? m.lot : null,
      type: String(m.type),
      status: STATUSES.includes(m.status as Status) ? (m.status as Status) : 'open',
      title: m.title as Mission['title'],
    }))
    .sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }));
}

export function missionsOfLot(lot: number): Mission[] {
  return parseMissions(sources).filter((m) => m.lot === lot);
}

export function progress(missions: Mission[]): { total: number; integrated: number } {
  return {
    total: missions.length,
    integrated: missions.filter((m) => m.status === 'integrated' || m.status === 'closed').length,
  };
}
