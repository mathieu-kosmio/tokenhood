#!/usr/bin/env node
// TH-015 : contrôle d'absence de SDK de fournisseur de LLM (principe « orchestrateur sans modèle »).
// Parcourt les package.json et les lockfiles d'un dossier (hors node_modules) et échoue si l'un d'eux
// déclare ou résout un paquet interdit, y compris en dépendance transitive, en alias (npm:openai@4)
// ou en override. Sans dépendance : Node 22 suffit.
//   node tools/no-llm-sdk/check.mjs [dossier]
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Paquets interdits : nom exact, ou portée entière quand l'entrée finit par « /* ».
export const DENIED = [
  // OpenAI
  'openai',
  '@openai/*',
  '@azure/openai',
  // Anthropic
  '@anthropic-ai/*',
  // Google
  '@google/genai',
  '@google/generative-ai',
  '@google-cloud/vertexai',
  '@google-cloud/aiplatform',
  'genkit',
  '@genkit-ai/*',
  // Mistral, Cohere et autres fournisseurs
  '@mistralai/*',
  'cohere-ai',
  'groq-sdk',
  'together-ai',
  'replicate',
  'voyageai',
  '@cerebras/*',
  '@huggingface/inference',
  // Clouds : AWS Bedrock, Azure AI
  '@aws-sdk/client-bedrock',
  '@aws-sdk/client-bedrock-runtime',
  '@aws-sdk/client-bedrock-agent-runtime',
  '@azure-rest/ai-inference',
  // Agrégateurs et routeurs qui appellent les fournisseurs
  'ai',
  '@ai-sdk/*',
  '@vercel/ai',
  'langchain',
  '@langchain/*',
  'llamaindex',
  '@llamaindex/*',
  '@openrouter/*',
  'portkey-ai',
  // Modèles exécutés sur le serveur
  'ollama',
  'node-llama-cpp',
  '@huggingface/transformers',
  '@xenova/transformers',
];

const SKIPPED_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.svelte-kit', 'coverage']);
const LOCKFILES = new Set([
  'pnpm-lock.yaml',
  'package-lock.json',
  'npm-shrinkwrap.json',
  'yarn.lock',
  'bun.lock',
]);
const DEP_FIELDS = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];

export function isDenied(name) {
  const n = name.toLowerCase();
  return DENIED.some((d) => (d.endsWith('/*') ? n.startsWith(d.slice(0, -1)) : n === d));
}

// « @scope/nom@1.2.3 », « nom@^4 », « nom@npm:4.0.0 » -> nom du paquet.
export function stripVersion(spec) {
  const s = spec.trim().replace(/^['"]|['"]$/g, '');
  const at = s.indexOf('@', s.startsWith('@') ? 1 : 0);
  return at > 0 ? s.slice(0, at) : s;
}

// Valeur de dépendance : un alias « npm:openai@^4 » désigne openai.
function aliasTarget(value) {
  return typeof value === 'string' && value.startsWith('npm:') ? stripVersion(value.slice(4)) : null;
}

// Clés d'override : « openai », « foo@1>openai », « foo>@anthropic-ai/sdk@0.1 ».
function namesFromOverrideKey(key) {
  return key.split('>').map(stripVersion);
}

function fromOverrides(overrides, out) {
  if (!overrides || typeof overrides !== 'object') return;
  for (const [key, value] of Object.entries(overrides)) {
    out.push(...namesFromOverrideKey(key));
    if (typeof value === 'object') fromOverrides(value, out);
    const alias = aliasTarget(value);
    if (alias) out.push(alias);
  }
}

export function namesFromPackageJson(text) {
  const pkg = JSON.parse(text);
  const names = [];
  for (const field of DEP_FIELDS) {
    for (const [name, value] of Object.entries(pkg[field] ?? {})) {
      names.push(name);
      const alias = aliasTarget(value);
      if (alias) names.push(alias);
    }
  }
  for (const field of ['bundleDependencies', 'bundledDependencies']) {
    if (Array.isArray(pkg[field])) names.push(...pkg[field]);
  }
  fromOverrides(pkg.overrides, names);
  fromOverrides(pkg.resolutions, names);
  fromOverrides(pkg.pnpm?.overrides, names);
  return names;
}

// pnpm-lock.yaml : toute clé YAML (importateurs, packages, snapshots, overrides), qu'elle s'écrive « nom »,
// « nom@version », « '@scope/nom@version(pairs)' » ou « parent>nom », plus les alias « specifier: npm:nom@... »
// et « version: nom@... ».
const PNPM_KEY = /^\s*(['"]?)([^\s'"]+?)\1:(?:\s|$)/;
const PNPM_VALUE = /^\s*(?:specifier|version):\s*['"]?(?:npm:)?((?:@[^\s'"/@]+\/)?[^\s'"@:/()]+)@/;

export function namesFromPnpmLock(text) {
  const names = [];
  for (const line of text.split('\n')) {
    const key = PNPM_KEY.exec(line);
    if (key) names.push(...namesFromOverrideKey(key[2]));
    const value = PNPM_VALUE.exec(line);
    if (value) names.push(value[1]);
  }
  return names;
}

// package-lock.json et npm-shrinkwrap.json, formats 1 à 3.
export function namesFromNpmLock(text) {
  const lock = JSON.parse(text);
  const names = [];
  for (const [key, entry] of Object.entries(lock.packages ?? {})) {
    const at = key.lastIndexOf('node_modules/');
    if (at >= 0) names.push(key.slice(at + 'node_modules/'.length));
    if (entry?.name) names.push(entry.name);
    for (const field of DEP_FIELDS) names.push(...Object.keys(entry?.[field] ?? {}));
  }
  const walk = (deps) => {
    for (const [name, entry] of Object.entries(deps ?? {})) {
      names.push(name, ...Object.keys(entry?.requires ?? {}));
      const alias = aliasTarget(entry?.version);
      if (alias) names.push(alias);
      walk(entry?.dependencies);
    }
  };
  walk(lock.dependencies);
  return names;
}

// yarn.lock (v1 et Berry) : en-têtes « nom@range, nom@range: » et lignes « resolution: "nom@npm:..." ».
// bun.lock : chaînes « "nom@version" » et clés de la table packages.
export function namesFromOtherLock(text) {
  const names = [];
  for (const line of text.split('\n')) {
    if (/^\S.*:$/.test(line)) names.push(...line.slice(0, -1).split(/,\s*/).map(stripVersion));
    const resolution = /^\s+resolution:\s*"([^"]+)"/.exec(line);
    if (resolution) names.push(stripVersion(resolution[1]));
    for (const m of line.matchAll(/"((?:@[^"\s/@]+\/)?[^"\s/@]+)(?:@[^"\s]*)?"\s*[:,\]]/g)) names.push(m[1]);
  }
  return names;
}

function extract(file, text) {
  const base = path.basename(file);
  if (base === 'package.json') return namesFromPackageJson(text);
  if (base === 'pnpm-lock.yaml') return namesFromPnpmLock(text);
  if (base === 'package-lock.json' || base === 'npm-shrinkwrap.json') return namesFromNpmLock(text);
  return namesFromOtherLock(text);
}

export function listManifests(root) {
  const files = [];
  const visit = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!SKIPPED_DIRS.has(entry.name)) visit(path.join(dir, entry.name));
      } else if (entry.name === 'package.json' || LOCKFILES.has(entry.name)) {
        files.push(path.join(dir, entry.name));
      }
    }
  };
  visit(root);
  return files.sort();
}

// Renvoie les fichiers contrôlés et, par fichier, les paquets interdits trouvés. Un fichier illisible
// est une anomalie : le contrôle échoue plutôt que de l'ignorer.
export function check(root) {
  const files = listManifests(root);
  const findings = [];
  for (const file of files) {
    let names;
    try {
      names = extract(file, readFileSync(file, 'utf8'));
    } catch (error) {
      findings.push({ file: path.relative(root, file), packages: [`fichier illisible (${error.message})`] });
      continue;
    }
    const denied = [...new Set(names.filter(isDenied))].sort();
    if (denied.length) findings.push({ file: path.relative(root, file), packages: denied });
  }
  return { files: files.map((f) => path.relative(root, f)), findings };
}

function main() {
  const root = path.resolve(process.argv[2] ?? '.');
  const { files, findings } = check(root);
  if (findings.length) {
    console.error('✗ SDK de fournisseur de LLM détecté (principe « orchestrateur sans modèle ») :');
    for (const { file, packages } of findings) console.error(`  ${file} : ${packages.join(', ')}`);
    process.exit(1);
  }
  console.log(`✓ Aucun SDK de fournisseur de LLM : ${files.length} fichiers contrôlés.`);
  for (const file of files) console.log(`  ${file}`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) main();
