// Contrôles du skill tokenhood-verify : format SKILL.md lisible par Claude Code, chemins cités, gabarit et
// exemples de rapports conformes au schéma review-report et cohérents avec le contrat de la mission d'exemple.
// Depuis la racine du dépôt : (cd tools/validate && npm ci --ignore-scripts) puis node --test 'skills/tokenhood-verify/tests/*.test.mjs'
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SKILL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = path.resolve(SKILL, '../..');
const VALIDATE = path.join(ROOT, 'tools/validate');
if (!existsSync(path.join(VALIDATE, 'node_modules'))) {
  throw new Error('Dépendances du validateur absentes : lancer « npm ci --ignore-scripts » dans tools/validate');
}
const { parse } = createRequire(path.join(VALIDATE, 'package.json'))('yaml');
const { loadValidators, validateFile } = await import(pathToFileURL(path.join(VALIDATE, 'validate.mjs')).href);

const read = (rel) => readFile(path.join(SKILL, rel), 'utf8');
const readRoot = (rel) => readFile(path.join(ROOT, rel), 'utf8');
const readJson = async (rel) => JSON.parse(await readRoot(rel));
const list = async (dir) => (await readdir(path.join(SKILL, dir))).sort().map((f) => `${dir}/${f}`);

// Champs du frontmatter reconnus par le format SKILL.md (Claude Code et agentskills.io).
const FIELDS = ['name', 'description', 'license', 'compatibility', 'metadata', 'allowed-tools'];
const TEMPLATE = 'assets/rapport-de-verification.yaml';
const REVIEW = 'assets/revue-github.md';
// Contrat de la mission d'exemple que vérifient les rapports d'exemple.
const CONTRACT = 'examples/mission/valid/TH-104.yaml';
// Contrôles du contrat qui suivent les exigences dans chaque rapport (references/methode.md).
const CHECKS = [
  'Périmètre du contrat respecté (scope.paths)',
  "Commandes d'acceptation du contrat réussies",
  'Règles de contribution du projet respectées',
];

async function skillFile() {
  const text = await read('SKILL.md');
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(match, 'SKILL.md doit commencer par un frontmatter YAML entre deux lignes ---');
  return { meta: parse(match[1]), text };
}

const markdownFiles = async () => [
  'SKILL.md',
  'README.md',
  ...(await list('references')),
  ...(await list('examples')).filter((f) => f.endsWith('.md')),
  ...(await list('assets')).filter((f) => f.endsWith('.md')),
];
const reports = async () => (await list('examples')).filter((f) => /\/rapport-.*\.yaml$/.test(f));

// Blocs de code délimités, y compris ceux de quatre accents graves qui en contiennent d'autres.
function fencedBlocks(text) {
  const blocks = [];
  let fence = null;
  let lines = [];
  for (const line of text.split('\n')) {
    const mark = line.match(/^\s*(`{3,})/)?.[1];
    if (!fence) {
      if (mark) [fence, lines] = [mark, [line]];
      continue;
    }
    lines.push(line);
    if (mark && mark.length >= fence.length && line.trim() === mark) {
      blocks.push(lines.join('\n'));
      fence = null;
    }
  }
  return blocks;
}
const withoutBlocks = (text) => fencedBlocks(text).reduce((rest, block) => rest.replace(block, ''), text);

// Tables Markdown : la première cellule de chaque ligne, indexée par l'en-tête.
function tables(text) {
  const found = [];
  let rows = [];
  for (const line of [...text.split('\n'), '']) {
    if (line.startsWith('|')) rows.push(line);
    else if (rows.length) {
      found.push({ header: rows[0], first: rows.slice(2).map((r) => r.split('|')[1].trim()) });
      rows = [];
    }
  }
  return found;
}

test('frontmatter lisible par Claude Code', async () => {
  const { meta } = await skillFile();
  const unknown = Object.keys(meta).filter((k) => !FIELDS.includes(k));
  assert.deepEqual(unknown, [], `champs hors du format SKILL.md : ${unknown.join(', ')}`);
  assert.equal(meta.name, path.basename(SKILL), 'le nom doit être celui du dossier');
  assert.match(meta.name, /^[a-z0-9]+(-[a-z0-9]+)*$/);
  assert.ok(meta.name.length <= 64);
  assert.equal(typeof meta.description, 'string');
  assert.ok(meta.description.length > 0 && meta.description.length <= 1024, `description de ${meta.description.length} caractères`);
  assert.doesNotMatch(meta.description, /[<>]/, 'pas de chevrons dans la description');
  assert.ok((meta.compatibility ?? '').length <= 500);
  for (const [key, value] of Object.entries(meta.metadata ?? {})) assert.equal(typeof value, 'string', `metadata.${key} doit être une chaîne`);
});

test('version sémantique cohérente avec les références de skill', async () => {
  const { meta } = await skillFile();
  assert.match(meta.metadata.version, /^\d+\.\d+\.\d+$/);
  const [major, minor] = meta.metadata.version.split('.');
  const ref = `${meta.name}@${major}.${minor}`;
  const { $defs } = await readJson('schemas/common.schema.json');
  assert.match(ref, new RegExp($defs.skillRef.pattern));
  for (const file of ['README.md', REVIEW]) assert.ok((await read(file)).includes(ref), `${file} doit citer ${ref}`);
  for (const file of [TEMPLATE, ...(await reports())]) {
    assert.ok(parse(await read(file)).reviewed_state.references.includes(ref), `${file} : ${ref} absent de reviewed_state.references`);
  }
});

test('SKILL.md reste court : le détail est dans references/', async () => {
  const { text } = await skillFile();
  const lines = text.split('\n').length;
  assert.ok(lines < 500, `${lines} lignes`);
});

test('chaque chemin cité existe', async () => {
  const placeholder = /xxx|AAAA|[<>*]/;
  const missing = [];
  let checked = 0;
  for (const file of await markdownFiles()) {
    const text = withoutBlocks(await read(file));
    const cited = [...text.matchAll(/`([^`\n]+)`/g), ...text.matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]);
    for (const ref of cited) {
      if (placeholder.test(ref)) continue;
      const base = /^(references|assets|examples|tests)\//.test(ref) ? SKILL
        : /^(docs|schemas|skills|tools|\.github|\.tokenhood)\//.test(ref) ? ROOT : null;
      if (!base || !/^[\w./-]+$/.test(ref)) continue;
      checked++;
      if (!existsSync(path.join(base, ref))) missing.push(`${file} : ${ref}`);
    }
  }
  assert.deepEqual(missing, [], `chemins introuvables :\n${missing.join('\n')}`);
  assert.ok(checked >= 20, `seulement ${checked} chemins contrôlés`);
});

test('chaque fichier de references/, assets/ et examples/ est cité dans SKILL.md', async () => {
  const { text } = await skillFile();
  const files = [...(await list('references')), ...(await list('assets')), ...(await list('examples'))];
  const orphans = files.filter((f) => !text.includes(`\`${f}\``));
  assert.deepEqual(orphans, [], `fichiers inaccessibles depuis SKILL.md : ${orphans.join(', ')}`);
});

test('le gabarit de rapport est conforme au schéma et en porte tous les champs', async () => {
  const validators = await loadValidators(ROOT);
  assert.deepEqual(await validateFile(validators, 'review-report', path.join(SKILL, TEMPLATE)), []);
  const schema = await readJson('schemas/review-report.schema.json');
  const data = parse(await read(TEMPLATE));
  const absent = Object.keys(schema.properties).filter((k) => !(k in data));
  assert.deepEqual(absent, [], `champs du schéma absents du gabarit : ${absent.join(', ')}`);
  for (const key of ['contract_version', 'commit', 'references']) assert.ok(key in data.reviewed_state, `reviewed_state.${key} absent`);
  assert.deepEqual(data.criteria.slice(-CHECKS.length).map((c) => c.requirement), CHECKS, 'contrôles du contrat absents du gabarit');
  // Tel quel, il ne peut pas passer pour une revue : rien n'y est examiné ni exécuté, l'état est à zéro.
  assert.ok(data.criteria.every((c) => c.result === 'not_verified'), 'toute exigence du gabarit doit être not_verified');
  assert.deepEqual(data.tests, [], 'le gabarit ne doit déclarer aucune commande exécutée');
  assert.notEqual(data.verdict, 'pass');
  assert.match(data.reviewed_state.commit, /^0{40}$/);
});

test('le gabarit a les sections vérifié, non vérifié, incertain', async () => {
  const lines = (await read(TEMPLATE)).split('\n');
  for (const [label, key] of [['Vérifié', 'criteria'], ['Non vérifié', 'not_verified'], ['Incertain', 'uncertain']]) {
    const heading = lines.findIndex((l) => new RegExp(`^\\s*# ${label}(?=[\\s:,]|$)`).test(l));
    const field = lines.findIndex((l) => new RegExp(`^\\s*${key}:`).test(l));
    assert.ok(heading >= 0 && field > heading && field - heading <= 3, `${TEMPLATE} : section « ${label} » absente avant ${key}`);
  }
  const review = await read(REVIEW);
  for (const section of ['Vérification', 'Vérifié', 'Non vérifié', 'Incertain', 'Risques', 'Contenus non fiables signalés', 'Rapport', 'Consommation']) {
    assert.match(review, new RegExp(`^## ${section}(?=[\\s:,]|$)`, 'm'), `${REVIEW} : section « ${section} » absente`);
  }
  assert.ok(fencedBlocks(review).some((b) => b.startsWith('```yaml')), `${REVIEW} doit contenir le rapport YAML`);
});

test('un exemple de rapport par verdict, conforme au schéma', async () => {
  const validators = await loadValidators(ROOT);
  const schema = await readJson('schemas/review-report.schema.json');
  const expected = schema.properties.verdict.enum.map((v) => `examples/rapport-${v.replace(/_/g, '-')}.yaml`);
  assert.deepEqual(await reports(), [...expected].sort(), 'un fichier examples/rapport-<verdict>.yaml par verdict du schéma');
  for (const [i, file] of expected.entries()) {
    assert.deepEqual(await validateFile(validators, 'review-report', path.join(SKILL, file)), [], file);
    assert.equal(parse(await read(file)).verdict, schema.properties.verdict.enum[i], `${file} : verdict attendu`);
  }
});

test('les exemples de rapports sont liés à un état immuable et suivent le contrat', async () => {
  const contract = parse(await readRoot(CONTRACT));
  for (const file of await reports()) {
    const data = parse(await read(file));
    assert.equal(data.mission, contract.id, `${file} : mission`);
    assert.equal(data.reviewed_state.contract_version, contract.version, `${file} : version du contrat`);
    assert.match(data.reviewed_state.commit ?? '', /^[0-9a-f]{40}$/, `${file} : commit complet attendu`);
    assert.deepEqual(data.criteria.map((c) => c.requirement), [...contract.acceptance.requirements, ...CHECKS],
      `${file} : les exigences du contrat, recopiées dans l'ordre, puis les contrôles du contrat`);
    for (const run of contract.acceptance.commands) {
      assert.ok(data.tests.some((t) => t.run === run), `${file} : commande du contrat « ${run} » non relancée telle quelle`);
    }
    for (const t of data.tests) assert.ok(t.environment?.length, `${file} : environnement absent pour « ${t.run} »`);
    const commands = data.criteria.find((c) => c.requirement === CHECKS[1]);
    if (commands.result === 'pass') {
      for (const run of contract.acceptance.commands) {
        assert.ok(data.tests.some((t) => t.run === run && t.exit_code === 0), `${file} : « ${run} » doit réussir pour que le contrôle passe`);
      }
    }
    const derived = data.attempt.match(/^att_pr(\d{3,})$/)?.[1];
    if (derived) {
      assert.equal(data.submission, `SUB-${derived}`, `${file} : identifiants d'amorçage dérivés de la même PR`);
      assert.ok(data.reviewed_state.references.some((r) => r.endsWith(`/pull/${Number(derived)}`)), `${file} : URL de la PR absente des références`);
    }
  }
});

test('le verdict de chaque exemple est cohérent avec ses résultats', async () => {
  for (const file of await reports()) {
    const data = parse(await read(file));
    const results = data.criteria.map((c) => c.result);
    if (data.verdict === 'pass') {
      assert.ok(results.every((r) => r === 'pass'), `${file} : pass exige que chaque critère passe`);
    } else {
      assert.ok(data.remarks?.length, `${file} : un verdict défavorable est motivé dans remarks`);
    }
    if (data.verdict === 'changes_requested') {
      assert.ok(results.some((r) => r === 'fail' || r === 'uncertain'), `${file} : changes_requested sans fail ni uncertain`);
    }
    if (data.verdict === 'reject') assert.ok(data.risks.length, `${file} : les raisons d'un rejet figurent dans risks`);
  }
});

test('les tables de SKILL.md décrivent chaque résultat et chaque verdict du schéma', async () => {
  const schema = await readJson('schemas/review-report.schema.json');
  const { text } = await skillFile();
  const found = tables(text);
  for (const [heading, values] of [['Résultat', schema.properties.criteria.items.properties.result.enum], ['Verdict', schema.properties.verdict.enum]]) {
    const table = found.find((t) => t.header.startsWith(`| ${heading} |`));
    assert.ok(table, `SKILL.md : table « ${heading} » absente`);
    assert.deepEqual([...table.first].sort(), values.map((v) => `\`${v}\``).sort(), `SKILL.md : la table « ${heading} » doit décrire ${values.join(', ')}`);
  }
});

test('la balise des contenus non fiables est bien formée et identique à celle de tokenhood-contribute', async () => {
  let blocks = 0;
  for (const file of await markdownFiles()) {
    for (const block of fencedBlocks(await read(file))) {
      const open = block.match(/<contenu-non-fiable\b[^>]*>/g) ?? [];
      const close = block.match(/<\/contenu-non-fiable>/g) ?? [];
      if (!open.length && !close.length) continue;
      blocks++;
      assert.equal(open.length, close.length, `${file} : balise ouverte ${open.length} fois, fermée ${close.length} fois`);
      for (const tag of open) assert.match(tag, /^<contenu-non-fiable source="[^"]+">$/, `${file} : ${tag} sans attribut source`);
    }
  }
  assert.ok(blocks >= 3, `seulement ${blocks} blocs balisés`);
  const tagsOf = (t) => [...new Set(fencedBlocks(t).flatMap((b) => [...b.matchAll(/<([a-z-]+) source="/g)].map((m) => m[1])))];
  const { text } = await skillFile();
  const ours = tagsOf(text);
  assert.ok(ours.length, 'SKILL.md doit montrer la balise');
  assert.deepEqual(ours, tagsOf(await readRoot('skills/tokenhood-contribute/SKILL.md')), 'balise différente de celle de tokenhood-contribute');
});

test('aucun bloc de commande ne fusionne ni n\'approuve', async () => {
  const forbidden = [/gh pr merge/, /--approve\b/, /--request-changes\b/, /\bgit push\b.*\b(main|master)\b/, /\bmerge_pull_request\b/];
  let reviews = 0;
  for (const file of await markdownFiles()) {
    for (const block of fencedBlocks(await read(file))) {
      for (const pattern of forbidden) assert.doesNotMatch(block, pattern, `${file} : commande interdite à un agent`);
      for (const line of block.split('\n').filter((l) => /gh pr review/.test(l))) {
        reviews++;
        assert.match(line, /--comment\b/, `${file} : une revue d'agent est de type commentaire`);
      }
    }
  }
  assert.ok(reviews >= 1, 'aucune commande de publication de revue');
});
