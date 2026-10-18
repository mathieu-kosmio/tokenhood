// Tests de la feuille de route : lecture du plan, règles de calcul sur un dépôt fictif,
// page générée à partir du dépôt réel.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build, loadConfig, loadLocales } from '../build.mjs';
import { PLAN, parsePlan, loadRoadmap } from '../src/roadmap-data.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

async function fixture(files) {
  const dir = await mkdtemp(path.join(tmpdir(), 'th-repo-'));
  for (const [file, content] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(dir, file)), { recursive: true });
    await writeFile(path.join(dir, file), content);
  }
  return dir;
}

const contract = (id, lot, status, extra = '') => `schema_version: "2.1"
id: ${id}
version: 1
lot: ${lot}
title:
  fr: "Titre ${id}"
  en: "Title ${id}"
type: code
estimate: {size: M, tokens_eq: null, source: plan}
${extra}
status: ${status}
`;

const report = (missions, kind, end, counted) => `schema_version: "2.1"
missions: [${missions.join(', ')}]
contribution: {kind: ${kind}}
period: {start: "2026-10-01T00:00:00Z", end: "${end}"}
counted: ${counted}
`;

const PLAN_FIXTURE = `# Plan

## Lot 0 : amorçage

| ID | Type | Mission | Dépend de | Taille | Risque |
| --- | --- | --- | --- | --- | --- |
| TH-001 | docs | Premier | Jour 0 | M | low |
| TH-002 | code | Deuxième | TH-001 | S | low |
| TH-003 | code | Troisième | TH-002 | L | medium |
| TH-004 | docs | Quatrième | TH-001 | M | low |
| TH-005 | docs | Cinquième | ADR-009 | M | low |

## Lot 1 : gouvernance

| ID | Type | Mission | Dépend de | Taille | Risque |
| --- | --- | --- | --- | --- | --- |
| TH-101 | code | Socle | TH-001 | M | medium |
| TH-102 | code | Identité | TH-101 | M | medium |

## Chemin critique

| TH-999 | code | Hors lot | TH-001 | M | low |
`;

const deps = (...ids) => `dependencies:\n${ids.map((d) => (d.startsWith('ADR') ? `  - decision: ${d}` : `  - mission: ${d}\n    type: integrated`)).join('\n')}`;

test('le plan de développement donne 56 missions réparties en 5 lots', async () => {
  const plan = parsePlan(await readFile(path.join(REPO, PLAN), 'utf8'));
  assert.deepEqual([0, 1, 2, 3, 4].map((n) => plan.filter((m) => m.lot === n).length), [16, 15, 10, 8, 7]);
  assert.equal(new Set(plan.map((m) => m.id)).size, 56);
  assert.ok(plan.every((m) => ['S', 'M', 'L'].includes(m.size)), 'taille absente ou inconnue');
});

test('chaque mission du plan a un résumé fonctionnel en FR et en EN, et chaque résumé une mission', async () => {
  const config = await loadConfig({});
  const locales = await loadLocales(config);
  const plan = parsePlan(await readFile(path.join(REPO, PLAN), 'utf8'));
  const { missions } = await loadRoadmap(REPO);
  for (const lang of config.langs) {
    const summaries = locales[lang].roadmapPage.missions;
    for (const m of plan) assert.ok(summaries[m.id], `${lang} : résumé manquant pour ${m.id}`);
    for (const id of Object.keys(summaries)) assert.ok(missions.some((m) => m.id === id), `${lang} : résumé sans mission ${id}`);
  }
});

test('règles de calcul : dates, tokens, priorité, dépendances, états des lots', async () => {
  const repo = await fixture({
    [PLAN]: PLAN_FIXTURE,
    'decisions/ADR-009-exemple.md': '# ADR-009\n',
    '.tokenhood/missions/TH-001.yaml': contract('TH-001', 0, 'integrated'),
    '.tokenhood/missions/TH-002.yaml': contract('TH-002', 0, 'open', deps('TH-001')),
    '.tokenhood/missions/TH-003.yaml': contract('TH-003', 0, 'open', deps('TH-002')),
    '.tokenhood/missions/TH-004.yaml': contract('TH-004', 0, 'open', `${deps('TH-001')}\npriority: high`),
    '.tokenhood/missions/TH-005.yaml': contract('TH-005', 0, 'open', deps('ADR-009')),
    '.tokenhood/missions/TH-090.yaml': contract('TH-090', 0, 'open', 'priority: low'),
    '.tokenhood/missions/TH-007.yaml': contract('TH-007', 0, 'integrated'),
    '.tokenhood/missions/TH-008.yaml': contract('TH-008', 0, 'cancelled'),
    '.tokenhood/missions/TH-101.yaml': contract('TH-101', 1, 'in_progress'),
    '.tokenhood/usage/a.yaml': report(['TH-001'], 'production', '2026-10-10T10:00:00Z', 100),
    '.tokenhood/usage/b.yaml': report(['TH-001', 'TH-007'], 'integration', '2026-10-12T22:30:00Z', 300),
    '.tokenhood/usage/c.yaml': report(['TH-001'], 'integration', '2026-10-20T09:00:00Z', 50),
  });
  try {
    const r = await loadRoadmap(repo);
    const get = (id) => r.missions.find((m) => m.id === id);
    assert.equal(get('TH-999'), undefined, 'ligne hors section de lot');
    assert.equal(get('TH-008'), undefined, 'mission annulée affichée');
    // Date : fin du premier rapport d'intégration, pas du dernier ; tokens : rapport commun partagé.
    assert.equal(get('TH-001').date, '2026-10-12T22:30:00.000Z');
    assert.equal(get('TH-001').tokens, 100 + 150 + 50);
    assert.equal(get('TH-007').tokens, 150);
    assert.deepEqual(r.next.map((m) => m.id), ['TH-004', 'TH-002', 'TH-005']);
    assert.equal(get('TH-003').state, 'waiting');
    assert.equal(get('TH-090').state, 'open');
    assert.equal(get('TH-101').state, 'progress');
    assert.equal(get('TH-102').state, 'planned');
    assert.deepEqual(r.active.map((m) => m.id), ['TH-101']);
    assert.deepEqual(r.lots.map((l) => [l.total, l.done, l.state]).slice(0, 2), [[7, 2, 'live'], [2, 0, 'next']]);
    assert.equal(r.current, 0);
    assert.equal(r.asOf, '2026-10-20T09:00:00.000Z');
    assert.deepEqual(r.counts, { done: 2, total: 9, active: 1, open: 5 });

    // Page : jour civil de Paris, lien Contribuer prérempli, repli sur le titre du contrat.
    const b = await build({ outDir: await mkdtemp(path.join(tmpdir(), 'th-landing-')), env: {}, repo });
    try {
      const doc = await readFile(path.join(b.outDir, 'feuille-de-route/index.html'), 'utf8');
      assert.match(doc, /<time class="th-tl-date" datetime="2026-10-13">13 oct\. 2026<\/time>/);
      // TH-090 est hors du plan et sans résumé : la page reprend le titre du contrat.
      assert.match(doc, /Titre TH-090/);
      const links = [...doc.matchAll(/href="(https:\/\/github\.com\/[^"]+\/discussions\/new\?[^"]+)"/g)].map((m) => new URL(m[1].replace(/&amp;/g, '&')));
      assert.deepEqual(links.map((u) => u.searchParams.get('title')), ['Contribuer à TH-004', 'Contribuer à TH-002', 'Contribuer à TH-005']);
      for (const u of links) {
        assert.equal(u.searchParams.get('category'), b.config.contribute.discussionCategory);
        assert.match(u.searchParams.get('body'), /\/blob\/main\/\.tokenhood\/missions\/TH-00\d\.yaml/);
      }
      const en = await readFile(path.join(b.outDir, 'en/roadmap/index.html'), 'utf8');
      assert.match(en, /Title TH-090/);
      assert.match(en, /datetime="2026-10-13">Oct 13, 2026</);
    } finally {
      await rm(b.outDir, { recursive: true, force: true });
    }
  } finally {
    await rm(repo, { recursive: true, force: true });
  }
});

test('la page suit le dépôt : missions intégrées, état actuel, prochaines missions', async () => {
  const outDir = await mkdtemp(path.join(tmpdir(), 'th-landing-'));
  try {
    const b = await build({ outDir, env: {} });
    const r = b.roadmap;
    assert.ok(r.done.length > 0 && r.next.length > 0 && r.next.length <= 3);
    for (const m of r.next) {
      assert.equal(m.status, 'open');
      for (const d of m.dependencies.filter((x) => x.mission)) {
        assert.ok(['integrated', 'closed'].includes(r.missions.find((x) => x.id === d.mission)?.status), `${m.id} : ${d.mission} non intégrée`);
      }
    }
    for (const [lang, page] of [['fr', 'feuille-de-route'], ['en', 'en/roadmap']]) {
      const doc = await readFile(path.join(outDir, page, 'index.html'), 'utf8');
      const t = b.locales[lang].roadmapPage;
      for (const m of r.done) assert.match(doc, new RegExp(`<span class="th-tl-id">${m.id}</span>`));
      assert.equal((doc.match(/class="th-card th-next"/g) ?? []).length, r.next.length);
      assert.equal((doc.match(/discussions\/new\?category=/g) ?? []).length, r.next.length);
      assert.match(doc, /id="maintenant"/);
      assert.ok(doc.includes(`>${t.next.contribute}</a>`));
      assert.match(doc, new RegExp(`<a href="${b.config.routes.roadmap[lang]}" aria-current="page">`));
    }
    // L'accueil tire l'état des lots des mêmes données et mène à la page.
    const home = await readFile(path.join(outDir, 'index.html'), 'utf8');
    assert.match(home, new RegExp(`<span class="th-pill th-pill--live">${b.locales.fr.roadmap.states.live}</span>`));
    assert.match(home, /class="th-btn th-btn--accent" href="\/feuille-de-route\/"/);
  } finally {
    await rm(outDir, { recursive: true, force: true });
  }
});

test('sans plan ni contrat, la page se construit avec ses messages d\'attente', async () => {
  const empty = await mkdtemp(path.join(tmpdir(), 'th-repo-vide-'));
  const outDir = await mkdtemp(path.join(tmpdir(), 'th-landing-'));
  try {
    const b = await build({ outDir, env: {}, repo: empty });
    const doc = await readFile(path.join(outDir, 'feuille-de-route/index.html'), 'utf8');
    const t = b.locales.fr.roadmapPage;
    assert.equal(b.roadmap.missions.length, 0);
    assert.doesNotMatch(doc, /undefined|NaN|\[object /);
    for (const text of [t.done.empty, t.next.empty]) assert.ok(doc.includes(text.replace(/'/g, '’').slice(0, 20)), text);
  } finally {
    await rm(outDir, { recursive: true, force: true });
    await rm(empty, { recursive: true, force: true });
  }
});
