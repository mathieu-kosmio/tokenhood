// Validation des fichiers Tokenhood : parseur YAML strict, JSON Schema (schemas/)
// et contrôles sémantiques que le schéma ne sait pas exprimer.
// Usage : node validate.mjs [racine-du-dépôt]
import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { parseDocument } from 'yaml';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = path.resolve(HERE, '../..');

// Dossier d'exemples -> schéma.
export const KINDS = {
  project: 'project.schema.json',
  mission: 'mission.schema.json',
  attempt: 'attempt.schema.json',
  'review-report': 'review-report.schema.json',
  'arbitration-request': 'arbitration-request.schema.json',
  'policy-security': 'policy-security.schema.json',
  'policy-review': 'policy-review.schema.json',
};

export async function loadValidators(root = DEFAULT_ROOT) {
  const ajv = new Ajv2020({ allErrors: true, strict: true, strictTypes: false, strictRequired: false });
  addFormats(ajv);
  const dir = path.join(root, 'schemas');
  for (const file of (await readdir(dir)).filter((f) => f.endsWith('.schema.json'))) {
    ajv.addSchema(JSON.parse(await readFile(path.join(dir, file), 'utf8')));
  }
  const validators = {};
  for (const [kind, file] of Object.entries(KINDS)) {
    validators[kind] = ajv.getSchema(`https://tokenhood.kosm.io/schemas/2.1/${file}`);
    if (!validators[kind]) throw new Error(`Schéma introuvable : ${file}`);
  }
  return validators;
}

// YAML strict : clés dupliquées, alias et erreurs de syntaxe refusés.
export async function readYaml(file) {
  const doc = parseDocument(await readFile(file, 'utf8'), { uniqueKeys: true, prettyErrors: true });
  const problems = [...doc.errors, ...doc.warnings].map((e) => e.message.split('\n')[0]);
  return { data: problems.length ? undefined : doc.toJS({ maxAliasCount: 0 }), problems };
}

function schemaErrors(validate, data) {
  if (validate(data)) return [];
  return validate.errors.map((e) => `${e.instancePath || '/'} ${e.message}${e.params?.allowedValues ? ` (${e.params.allowedValues.join(', ')})` : ''}`);
}

// Contrôles propres à chaque format, au-delà du schéma.
const SEMANTIC = {
  'arbitration-request': (d) =>
    d.options.some((o) => o.id === d.default_option) ? [] : [`/default_option « ${d.default_option} » ne désigne aucune option`],
  'review-report': (d) =>
    d.verdict !== 'pass' && d.criteria.every((c) => c.result === 'pass') && d.remarks === undefined
      ? ['/verdict un verdict défavorable sans critère en échec doit être motivé dans remarks']
      : [],
  mission: (d) => {
    const errors = [];
    const est = d.estimate?.tokens_eq;
    if (est && est.low > est.high) errors.push('/estimate/tokens_eq low dépasse high');
    if ((d.dependencies ?? []).some((dep) => dep.mission === d.id)) errors.push('/dependencies une mission ne peut dépendre d\'elle-même');
    return errors;
  },
};

export async function validateFile(validators, kind, file) {
  const { data, problems } = await readYaml(file);
  if (problems.length) return problems.map((p) => `YAML : ${p}`);
  const errors = schemaErrors(validators[kind], data);
  if (!errors.length && SEMANTIC[kind]) errors.push(...SEMANTIC[kind](data));
  return errors;
}

const yamlFiles = async (dir) =>
  existsSync(dir) ? (await readdir(dir)).filter((f) => /\.ya?ml$/.test(f)).sort().map((f) => path.join(dir, f)) : [];

function findCycle(graph) {
  const state = new Map();
  const stack = [];
  const visit = (node) => {
    state.set(node, 'en cours');
    stack.push(node);
    for (const next of graph.get(node) ?? []) {
      if (state.get(next) === 'en cours') return [...stack.slice(stack.indexOf(next)), next];
      if (!state.has(next)) {
        const cycle = visit(next);
        if (cycle) return cycle;
      }
    }
    stack.pop();
    state.set(node, 'fait');
    return null;
  };
  for (const node of graph.keys()) {
    if (!state.has(node)) {
      const cycle = visit(node);
      if (cycle) return cycle;
    }
  }
  return null;
}

// Valide le manifeste, les politiques et les missions du dépôt.
export async function validateRepository(root = DEFAULT_ROOT, validators) {
  validators ??= await loadValidators(root);
  const report = [];
  const add = (file, errors) => report.push({ file: path.relative(root, file), errors });
  const base = path.join(root, '.tokenhood');

  const manifestFile = path.join(base, 'project.yaml');
  if (!existsSync(manifestFile)) {
    add(manifestFile, ['fichier absent']);
    return report;
  }
  add(manifestFile, await validateFile(validators, 'project', manifestFile));
  const { data: manifest } = await readYaml(manifestFile);

  for (const [kind, key] of [['policy-security', 'security'], ['policy-review', 'review']]) {
    const rel = manifest?.policies?.[key];
    if (!rel) continue;
    const file = path.join(root, rel);
    add(file, existsSync(file) ? await validateFile(validators, kind, file) : ['politique déclarée dans project.yaml mais absente']);
  }

  const missionsDir = path.join(root, manifest?.missions?.directory ?? '.tokenhood/missions/');
  const missions = new Map();
  for (const file of await yamlFiles(missionsDir)) {
    const errors = await validateFile(validators, 'mission', file);
    const { data } = await readYaml(file);
    if (data?.id) {
      const expected = path.basename(file).replace(/\.ya?ml$/, '');
      if (data.id !== expected) errors.push(`/id « ${data.id} » ne correspond pas au nom du fichier (${expected})`);
      if (missions.has(data.id)) errors.push(`/id « ${data.id} » déjà utilisé`);
      missions.set(data.id, { file, data });
    }
    add(file, errors);
  }

  const graph = new Map();
  for (const [id, { file, data }] of missions) {
    const deps = (data.dependencies ?? []).filter((d) => d.mission).map((d) => d.mission);
    const unknown = deps.filter((d) => !missions.has(d));
    if (unknown.length) report.find((r) => r.file === path.relative(root, file)).errors.push(`/dependencies mission(s) inconnue(s) : ${unknown.join(', ')}`);
    graph.set(id, deps.filter((d) => missions.has(d)));
  }
  const cycle = findCycle(graph);
  if (cycle) add(missionsDir, [`cycle de dépendances : ${cycle.join(' → ')}`]);
  return report;
}

// Vérifie que examples/<kind>/valid/* passent et examples/<kind>/invalid/* échouent.
export async function validateExamples(root = DEFAULT_ROOT, validators) {
  validators ??= await loadValidators(root);
  const report = [];
  for (const kind of Object.keys(KINDS)) {
    const dir = path.join(root, 'examples', kind);
    const valid = await yamlFiles(path.join(dir, 'valid'));
    const invalid = await yamlFiles(path.join(dir, 'invalid'));
    if (!valid.length) report.push({ file: `examples/${kind}/valid/`, errors: ['aucun exemple valide'] });
    if (!invalid.length) report.push({ file: `examples/${kind}/invalid/`, errors: ['aucun exemple invalide'] });
    for (const file of valid) report.push({ file: path.relative(root, file), errors: await validateFile(validators, kind, file) });
    for (const file of invalid) {
      const errors = await validateFile(validators, kind, file);
      report.push({ file: path.relative(root, file), errors: errors.length ? [] : ['exemple invalide accepté à tort'], rejectedWith: errors });
    }
  }
  return report;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = path.resolve(process.argv[2] ?? DEFAULT_ROOT);
  const validators = await loadValidators(root);
  const report = [...(await validateRepository(root, validators)), ...(await validateExamples(root, validators))];
  const failed = report.filter((r) => r.errors.length);
  for (const r of report) {
    console.log(`${r.errors.length ? '✗' : '✓'} ${r.file}`);
    for (const e of r.errors) console.log(`    ${e}`);
  }
  console.log(failed.length ? `\n${failed.length} fichier(s) en erreur sur ${report.length}.` : `\n${report.length} fichiers conformes.`);
  process.exit(failed.length ? 1 : 0);
}
