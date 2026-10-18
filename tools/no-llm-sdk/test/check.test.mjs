import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  check,
  isDenied,
  namesFromNpmLock,
  namesFromOtherLock,
  namesFromPackageJson,
  namesFromPnpmLock,
} from '../check.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const SCRIPT = path.join(ROOT, 'tools/no-llm-sdk/check.mjs');

// Les fixtures sont écrites dans un dossier temporaire : versées dans le dépôt, elles feraient échouer le contrôle.
function fixture(files) {
  const dir = mkdtempSync(path.join(tmpdir(), 'no-llm-sdk-'));
  for (const [file, content] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    writeFileSync(path.join(dir, file), typeof content === 'string' ? content : JSON.stringify(content));
  }
  return dir;
}

const denied = (names) => [...new Set(names.filter(isDenied))].sort();

test('le dépôt ne contient aucun SDK de fournisseur de LLM', () => {
  const { files, findings } = check(ROOT);
  assert.ok(files.includes('pnpm-lock.yaml'));
  assert.ok(files.includes('package.json'));
  assert.deepEqual(findings, []);
});

test('noms exacts et portées entières', () => {
  for (const name of [
    'openai',
    '@anthropic-ai/sdk',
    '@google/genai',
    '@mistralai/mistralai',
    'cohere-ai',
    'ollama',
  ]) {
    assert.ok(isDenied(name), name);
  }
  assert.ok(isDenied('@anthropic-ai/claude-agent-sdk'));
  assert.ok(isDenied('@langchain/openai'));
  assert.ok(isDenied('OpenAI'));
});

test('aucun faux positif sur des noms voisins', () => {
  const allowed = [
    '@modelcontextprotocol/sdk',
    'openapi-types',
    '@fastify/swagger',
    'openai-compatible-mock',
    '@openai-compat/client',
    'aim',
    'ai-utils',
    '@langchainx/core',
    'ollama-ui',
    '@google/maps',
    '@aws-sdk/client-s3',
  ];
  assert.deepEqual(allowed.filter(isDenied), []);
});

test('package.json : dépendances, alias npm:, overrides et resolutions', () => {
  const names = namesFromPackageJson(
    JSON.stringify({
      dependencies: { fastify: '5.0.0', llm: 'npm:@anthropic-ai/sdk@0.60.0' },
      devDependencies: { openai: '^4.0.0' },
      optionalDependencies: { ollama: '0.5.0' },
      overrides: { foo: { '@google/genai': '1.0.0' }, bar: 'npm:cohere-ai@7' },
      resolutions: { 'baz@1>@mistralai/mistralai': '1.0.0' },
      pnpm: { overrides: { 'qux>groq-sdk': '0.1.0' } },
    }),
  );
  assert.deepEqual(denied(names), [
    '@anthropic-ai/sdk',
    '@google/genai',
    '@mistralai/mistralai',
    'cohere-ai',
    'groq-sdk',
    'ollama',
    'openai',
  ]);
});

test('pnpm-lock.yaml : importateurs, alias, packages, snapshots et overrides', () => {
  const lock = [
    "lockfileVersion: '9.0'",
    'overrides:',
    '  foo>@mistralai/mistralai: 1.0.0',
    'importers:',
    '  .:',
    '    dependencies:',
    '      llm:',
    '        specifier: npm:@anthropic-ai/sdk@0.30.0',
    "        version: '@anthropic-ai/sdk@0.30.0'",
    '      fastify:',
    '        specifier: 5.0.0',
    '        version: 5.0.0',
    'packages:',
    "  '@langchain/core@0.3.80':",
    '    resolution: {integrity: sha512-ai/openai+ollama==}',
    'snapshots:',
    "  '@langchain/core@0.3.80(openai@4.104.0(zod@3.25.76))':",
    '    dependencies:',
    '      openai: 4.104.0(zod@3.25.76)',
  ].join('\n');
  assert.deepEqual(denied(namesFromPnpmLock(lock)), [
    '@anthropic-ai/sdk',
    '@langchain/core',
    '@mistralai/mistralai',
    'openai',
  ]);
});

test('package-lock.json : dépendance transitive imbriquée et alias (formats 1 et 3)', () => {
  const v3 = {
    lockfileVersion: 3,
    packages: {
      '': { dependencies: { yaml: '2.0.0' } },
      'node_modules/yaml': { version: '2.0.0' },
      'node_modules/llm': { name: '@google/genai', version: '1.0.0' },
      'node_modules/foo/node_modules/@anthropic-ai/sdk': { version: '0.1.0' },
    },
  };
  assert.deepEqual(denied(namesFromNpmLock(JSON.stringify(v3))), ['@anthropic-ai/sdk', '@google/genai']);
  const v1 = {
    lockfileVersion: 1,
    dependencies: {
      foo: {
        version: '1.0.0',
        requires: { 'cohere-ai': '7.0.0' },
        dependencies: { ollama: { version: '0.5.0' } },
      },
      llm: { version: 'npm:openai@4.0.0' },
    },
  };
  assert.deepEqual(denied(namesFromNpmLock(JSON.stringify(v1))), ['cohere-ai', 'ollama', 'openai']);
});

test('yarn.lock et bun.lock', () => {
  const yarn = [
    '"@anthropic-ai/sdk@^0.60.0", "@anthropic-ai/sdk@^0.61.0":',
    '  version "0.61.0"',
    'llm@npm:^4:',
    '  resolution: "openai@npm:4.0.0"',
  ].join('\n');
  assert.deepEqual(denied(namesFromOtherLock(yarn)), ['@anthropic-ai/sdk', 'openai']);
  const bun = '{\n  "packages": {\n    "ollama": ["ollama@0.5.0", "", {}, "sha512-x"],\n  }\n}';
  assert.deepEqual(denied(namesFromOtherLock(bun)), ['ollama']);
});

test('node_modules et les dossiers de build sont ignorés', () => {
  const dir = fixture({
    'package.json': { name: 'ok', dependencies: { fastify: '5.0.0' } },
    'node_modules/openai/package.json': { name: 'openai', dependencies: { openai: '4.0.0' } },
    'dist/package.json': { dependencies: { openai: '4.0.0' } },
  });
  assert.deepEqual(check(dir), { files: ['package.json'], findings: [] });
});

test('un fichier illisible fait échouer le contrôle', () => {
  const dir = fixture({ 'apps/x/package.json': '{ pas du json' });
  const { findings } = check(dir);
  assert.equal(findings.length, 1);
  assert.match(findings[0].packages[0], /^fichier illisible/);
});

test('la commande sort en erreur et nomme le fichier et le paquet', () => {
  const dir = fixture({
    'package.json': { name: 'racine' },
    'apps/api/package.json': { name: '@x/api', dependencies: { openai: '4.0.0' } },
  });
  const ko = spawnSync(process.execPath, [SCRIPT, dir], { encoding: 'utf8' });
  assert.equal(ko.status, 1);
  assert.match(ko.stderr, /apps\/api\/package\.json : openai/);

  const ok = spawnSync(process.execPath, [SCRIPT, ROOT], { encoding: 'utf8' });
  assert.equal(ok.status, 0, ok.stderr);
  assert.match(ok.stdout, /Aucun SDK de fournisseur de LLM/);
});
