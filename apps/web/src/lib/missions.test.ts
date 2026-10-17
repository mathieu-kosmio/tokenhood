import { describe, expect, it } from 'vitest';
import { titleIn } from './mission.js';
import { missionsOfLot, parseMissions, progress } from './missions.server.js';

const files = {
  'b.yaml':
    'id: TH-010\nlot: 0\ntype: research\nstatus: integrated\ntitle: {fr: Protocole pilote, en: Pilot protocol}\n',
  'a.yaml': 'id: TH-002\nlot: 0\ntype: code\nstatus: in_progress\ntitle: Schémas\n',
  'c.yaml': 'id: TH-101\nlot: 1\ntype: code\ntitle: {fr: Squelette}\n',
};

describe('missions', () => {
  it('lit, trie numériquement et normalise les contrats', () => {
    const missions = parseMissions(files);
    expect(missions.map((m) => m.id)).toEqual(['TH-002', 'TH-010', 'TH-101']);
    expect(missions[2]?.status).toBe('open');
  });

  it('choisit le titre dans la langue demandée, avec repli', () => {
    const [schemas, pilote, squelette] = parseMissions(files);
    expect(titleIn(pilote!, 'en')).toBe('Pilot protocol');
    expect(titleIn(schemas!, 'en')).toBe('Schémas');
    expect(titleIn(squelette!, 'en')).toBe('Squelette');
  });

  it('compte les missions intégrées', () => {
    expect(progress(parseMissions(files).filter((m) => m.lot === 0))).toEqual({ total: 2, integrated: 1 });
  });

  it('trouve les missions du lot 0 dans le dépôt', () => {
    const lot0 = missionsOfLot(0);
    expect(lot0.length).toBeGreaterThanOrEqual(16);
    expect(lot0[0]?.id).toBe('TH-001');
  });
});
