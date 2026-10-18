// Données de la feuille de route, tirées du dépôt au build : tableaux de lots du plan de
// développement, contrats de .tokenhood/missions/, rapports de .tokenhood/usage/ et
// registre decisions/. Rien n'est saisi à la main : un contrat qui passe à `integrated`
// et son rapport de consommation suffisent à faire avancer la page au déploiement suivant.
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';

export const PLAN = 'docs/specs/plan-de-developpement.md';
export const LOTS = [0, 1, 2, 3, 4];
export const NEXT_COUNT = 3;

const DONE = new Set(['integrated', 'closed']);
const HIDDEN = new Set(['cancelled']);
// État affiché d'une mission publiée qui n'est ni intégrée ni ouverte.
const ACTIVE = { in_progress: 'progress', accepted: 'review', awaiting_decision: 'waiting', blocked: 'waiting' };
const PRIORITY = { urgent: 0, high: 1, normal: 2, low: 3 };

export async function readYamlDir(repo, dir) {
  const full = path.join(repo, dir);
  let files = [];
  try {
    files = (await readdir(full)).filter((f) => /\.ya?ml$/.test(f)).sort();
  } catch {
    return [];
  }
  return Promise.all(files.map(async (f) => parseYaml(await readFile(path.join(full, f), 'utf8'))));
}

// Lignes des tableaux « ## Lot N » du plan : | ID | Type | Mission | Dépend de | Taille | Risque |
export function parsePlan(markdown) {
  const missions = [];
  let lot = null;
  for (const line of markdown.split('\n')) {
    if (line.startsWith('## ')) {
      const head = line.match(/^## Lot (\d)\b/);
      lot = head ? Number(head[1]) : null;
      continue;
    }
    const row = lot !== null && line.match(/^\|\s*(TH-\d{3})\s*\|([^|]*)\|[^|]*\|[^|]*\|([^|]*)\|/);
    if (row) missions.push({ id: row[1], lot, type: row[2].trim(), size: row[3].trim() || null });
  }
  return missions;
}

const time = (iso) => {
  const t = Date.parse(iso);
  return Number.isNaN(t) ? null : t;
};

// Par mission : date d'intégration (fin du premier rapport `integration` qui la cite, à défaut
// fin de son dernier rapport) et tokens comptés (un rapport commun à plusieurs missions est
// réparti à parts égales).
function usageByMission(reports) {
  const by = new Map();
  for (const r of reports) {
    const end = time(r?.period?.end);
    const ids = Array.isArray(r?.missions) ? r.missions : [];
    if (!ids.length) continue;
    const share = Number.isInteger(r.counted) ? r.counted / ids.length : 0;
    for (const id of ids) {
      const u = by.get(id) ?? { integration: null, last: null, tokens: 0 };
      u.tokens += share;
      if (end !== null) {
        if (r.contribution?.kind === 'integration') u.integration = u.integration === null ? end : Math.min(u.integration, end);
        u.last = u.last === null ? end : Math.max(u.last, end);
      }
      by.set(id, u);
    }
  }
  return by;
}

const byId = (a, b) => a.id.localeCompare(b.id);

export async function loadRoadmap(repo) {
  let plan = [];
  try {
    plan = parsePlan(await readFile(path.join(repo, PLAN), 'utf8'));
  } catch {
    plan = [];
  }
  const contracts = (await readYamlDir(repo, '.tokenhood/missions')).filter((m) => typeof m?.id === 'string');
  const reports = await readYamlDir(repo, '.tokenhood/usage');
  let decisions = [];
  try {
    decisions = await readdir(path.join(repo, 'decisions'));
  } catch {
    decisions = [];
  }

  // Le plan fixe la liste et l'ordre ; un contrat publié fait foi pour tout ce qu'il déclare.
  const missions = new Map(plan.map((p) => [p.id, { ...p, status: 'planned', title: null, priority: null, dependencies: [] }]));
  for (const c of contracts) {
    const base = missions.get(c.id) ?? { id: c.id, lot: null, type: null, size: null };
    missions.set(c.id, {
      ...base,
      lot: Number.isInteger(c.lot) ? c.lot : base.lot,
      type: c.type ?? base.type,
      size: c.estimate?.size ?? base.size,
      status: c.status ?? 'open',
      title: c.title ?? null,
      priority: c.priority ?? null,
      dependencies: Array.isArray(c.dependencies) ? c.dependencies : [],
    });
  }

  const usage = usageByMission(reports);
  const all = [...missions.values()].filter((m) => LOTS.includes(m.lot) && !HIDDEN.has(m.status)).sort(byId);
  const status = new Map(all.map((m) => [m.id, m.status]));
  // Une décision compte comme prise dès que son fichier est sur main (decisions/ADR-002-*.md) :
  // elle est adoptée à la fusion de la PR qui l'introduit.
  const decided = (id) => decisions.some((f) => f === `${id}.md` || f.startsWith(`${id}-`));
  const ready = (m) =>
    m.dependencies.every((d) => (d.mission ? DONE.has(status.get(d.mission)) : d.decision ? decided(d.decision) : true));

  for (const m of all) {
    const u = usage.get(m.id);
    if (DONE.has(m.status)) {
      m.state = 'done';
      const at = u?.integration ?? u?.last ?? null;
      m.date = at === null ? null : new Date(at).toISOString();
      m.tokens = Math.round(u?.tokens ?? 0);
    } else if (m.status === 'open') {
      m.state = ready(m) ? 'open' : 'waiting';
    } else {
      m.state = ACTIVE[m.status] ?? 'planned';
    }
  }

  const rank = (m) => PRIORITY[m.priority] ?? PRIORITY.normal;
  const next = all
    .filter((m) => m.state === 'open')
    .sort((a, b) => rank(a) - rank(b) || byId(a, b))
    .slice(0, NEXT_COUNT);
  for (const m of next) m.next = true;

  const lots = LOTS.map((n) => {
    const list = all.filter((m) => m.lot === n);
    const done = list.filter((m) => m.state === 'done').length;
    return { n, total: list.length, done, complete: list.length > 0 && done === list.length };
  });
  const current = lots.find((l) => !l.complete)?.n ?? null;
  for (const l of lots) l.state = l.complete ? 'done' : l.n === current ? 'live' : 'next';

  const ends = reports.map((r) => time(r?.period?.end)).filter((t) => t !== null);
  const doneList = all.filter((m) => m.state === 'done').sort((a, b) => (a.date ?? '').localeCompare(b.date ?? '') || byId(a, b));
  return {
    missions: all,
    lots,
    current,
    done: doneList,
    active: all.filter((m) => ['progress', 'review'].includes(m.state)),
    next,
    later: all.filter((m) => !['done', 'progress', 'review'].includes(m.state) && !m.next),
    asOf: ends.length ? new Date(Math.max(...ends)).toISOString() : null,
    counts: {
      done: doneList.length,
      total: all.length,
      active: all.filter((m) => ['progress', 'review', 'waiting'].includes(m.state) && m.status !== 'open').length,
      open: all.filter((m) => m.status === 'open').length,
    },
  };
}
