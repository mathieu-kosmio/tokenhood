// Contrôles du skill tokenhood-contribute : format SKILL.md lisible par Claude Code, chemins cités,
// exemples conformes au schéma des demandes d'arbitrage et cohérents avec la règle de conduite.
// Depuis la racine du dépôt : (cd tools/validate && npm ci) puis node --test 'skills/tokenhood-contribute/tests/*.test.mjs'
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
  throw new Error('Dépendances du validateur absentes : lancer « npm ci » dans tools/validate');
}
const { parse } = createRequire(path.join(VALIDATE, 'package.json'))('yaml');
const { loadValidators, validateFile } = await import(pathToFileURL(path.join(VALIDATE, 'validate.mjs')).href);

const read = (rel) => readFile(path.join(SKILL, rel), 'utf8');
const readJson = async (rel) => JSON.parse(await readFile(path.join(ROOT, rel), 'utf8'));
const list = async (dir) => (await readdir(path.join(SKILL, dir))).sort().map((f) => `${dir}/${f}`);

// Champs du frontmatter reconnus par le format SKILL.md (Claude Code et agentskills.io).
const FIELDS = ['name', 'description', 'license', 'compatibility', 'metadata', 'allowed-tools'];

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
const fencedBlocks = (text) => text.match(/```[\s\S]*?```/g) ?? [];
const conductOf = { continuer: 'continue', 'changer-de-mission': 'switch_mission', arreter: 'stop' };

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

test('version sémantique cohérente avec les références de skill des missions', async () => {
  const { meta } = await skillFile();
  assert.match(meta.metadata.version, /^\d+\.\d+\.\d+$/);
  const [major, minor] = meta.metadata.version.split('.');
  const ref = `${meta.name}@${major}.${minor}`;
  const { $defs } = await readJson('schemas/common.schema.json');
  assert.match(ref, new RegExp($defs.skillRef.pattern));
  assert.ok((await read('assets/rapport-de-mission.md')).includes(ref), `le gabarit de rapport doit citer ${ref}`);
  assert.ok((await read('README.md')).includes(ref), `le README doit citer ${ref}`);
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
    const text = (await read(file)).replace(/```[\s\S]*?```/g, '');
    const cited = [...text.matchAll(/`([^`\n]+)`/g), ...text.matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]);
    for (const ref of cited) {
      if (placeholder.test(ref)) continue;
      const base = /^(references|assets|examples|tests)\//.test(ref) ? SKILL
        : /^(docs|schemas|tools|\.github|\.tokenhood)\//.test(ref) ? ROOT : null;
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

test('les exemples de demandes d\'arbitrage sont conformes au schéma', async () => {
  const validators = await loadValidators(ROOT);
  const examples = (await list('examples')).filter((f) => f.endsWith('.yaml'));
  assert.ok(examples.length >= 3);
  for (const file of examples) {
    assert.deepEqual(await validateFile(validators, 'arbitration-request', path.join(SKILL, file)), [], file);
  }
});

test('une demande d\'arbitrage par conduite, cohérente avec la règle', async () => {
  const schema = await readJson('schemas/arbitration-request.schema.json');
  const { text } = await skillFile();
  const seen = new Set();
  for (const file of (await list('examples')).filter((f) => /\/arbitrage-.*\.yaml$/.test(f))) {
    const data = parse(await read(file));
    const expected = conductOf[path.basename(file, '.yaml').replace(/^arbitrage-/, '')];
    assert.equal(data.conduct, expected, `${file} : conduite attendue ${expected}`);
    assert.equal(data.blocking, data.conduct !== 'continue', `${file} : seule la conduite continue est non bloquante`);
    const chosen = data.options.find((o) => o.id === data.default_option);
    if (data.conduct === 'continue') assert.equal(chosen.reversible, true, `${file} : continuer suppose une option par défaut réversible`);
    seen.add(data.conduct);
  }
  for (const conduct of schema.properties.conduct.enum) {
    assert.ok(seen.has(conduct), `aucun exemple pour la conduite ${conduct}`);
    assert.ok(text.includes(`| \`${conduct}\` |`), `la table de SKILL.md doit décrire la conduite ${conduct}`);
  }
});

test('le gabarit de demande porte les champs du schéma, et seulement eux', async () => {
  const schema = await readJson('schemas/arbitration-request.schema.json');
  const keys = Object.keys(parse(await read('assets/demande-arbitrage.yaml')));
  const absent = [...schema.required, 'conduct'].filter((k) => !keys.includes(k));
  const extra = keys.filter((k) => !(k in schema.properties));
  assert.deepEqual(absent, [], `champs requis absents : ${absent.join(', ')}`);
  assert.deepEqual(extra, [], `champs hors schéma : ${extra.join(', ')}`);
});

test('le gabarit de rapport de mission a toutes ses sections', async () => {
  const text = await read('assets/rapport-de-mission.md');
  for (const section of ['Mission', 'Livrable', 'Preuves', 'Écarts au contrat', 'Questions signalées', 'Contenus non fiables signalés', 'Agent', 'Consommation']) {
    assert.match(text, new RegExp(`^## ${section}`, 'm'), `section « ${section} » absente`);
  }
});

test('la balise des contenus non fiables est bien formée partout', async () => {
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
  const { text } = await skillFile();
  assert.ok(fencedBlocks(text).some((b) => b.includes('<contenu-non-fiable source=')), 'SKILL.md doit montrer la balise');
});
