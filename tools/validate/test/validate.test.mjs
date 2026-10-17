import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, copyFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadValidators, validateRepository, validateExamples, validateFile } from '../validate.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
let validators;

before(async () => {
  validators = await loadValidators(ROOT);
});

const failures = (report) => report.filter((r) => r.errors.length);

test('le manifeste, les politiques et les missions du dépôt sont conformes', async () => {
  const report = await validateRepository(ROOT, validators);
  assert.ok(report.length >= 3);
  assert.deepEqual(failures(report), []);
});

test('chaque exemple valide passe et chaque exemple invalide est rejeté', async () => {
  const report = await validateExamples(ROOT, validators);
  assert.deepEqual(failures(report), []);
});

// Chaque exemple invalide doit échouer pour la raison qu'il illustre, pas par accident.
const EXPECTED = {
  'project/invalid/push-direct.yaml': ['/contributions/direct_push', '/contributions/require_human_merge'],
  'project/invalid/chemin-remontant.yaml': ['/missions/directory', '/project/languages/0'],
  'mission/invalid/sans-critere.yaml': ['/type', '/acceptance/requirements', '/verification/maintainer_approval'],
  'mission/invalid/risque-eleve-un-verificateur.yaml': ['/verification/reviewers'],
  'attempt/invalid/generation-zero.yaml': ['/attempt/generation', '/attempt/lease_expires_at', '/attempt/budget/level'],
  'review-report/invalid/sans-limites.yaml': ["must have required property 'limits'", '/reviewed_state'],
  'review-report/invalid/pass-avec-echec.yaml': ['/criteria/0/result'],
  'arbitration-request/invalid/option-par-defaut-inconnue.yaml': ['/default_option'],
  'arbitration-request/invalid/continuer-en-bloquant.yaml': ['/blocking'],
  'policy-security/invalid/secrets-montes.yaml': ['/execution/secrets_mounted', '/forbidden'],
  'policy-review/invalid/revue-facultative.yaml': ['/cross_review/required', '/approval/merge_by'],
};

test('les exemples invalides échouent pour la raison attendue', async () => {
  for (const [rel, expected] of Object.entries(EXPECTED)) {
    const kind = rel.split('/')[0];
    const errors = await validateFile(validators, kind, path.join(ROOT, 'examples', rel));
    for (const fragment of expected) {
      assert.ok(errors.some((e) => e.includes(fragment)), `${rel} : « ${fragment} » absent de ${JSON.stringify(errors)}`);
    }
  }
});

async function fakeRepo(missions) {
  const root = await mkdtemp(path.join(tmpdir(), 'th-validate-'));
  await mkdir(path.join(root, '.tokenhood/missions'), { recursive: true });
  await mkdir(path.join(root, '.tokenhood/policies'), { recursive: true });
  for (const f of ['project.yaml', 'policies/security.yaml', 'policies/review.yaml']) {
    await copyFile(path.join(ROOT, '.tokenhood', f), path.join(root, '.tokenhood', f));
  }
  const template = await readFile(path.join(ROOT, 'examples/mission/valid/TH-104.yaml'), 'utf8');
  for (const [file, { id, deps = [], extra = '' }] of Object.entries(missions)) {
    let body = template.replace('id: TH-104', `id: ${id}`).replace(/dependencies:\n {2}- mission: TH-103\n {4}type: integrated\n/, '');
    if (deps.length) body += `dependencies:\n${deps.map((d) => `  - mission: ${d}\n    type: integrated\n`).join('')}`;
    await writeFile(path.join(root, '.tokenhood/missions', file), body + extra);
  }
  return root;
}

test('incohérences entre missions détectées', async () => {
  const root = await fakeRepo({
    'TH-001.yaml': { id: 'TH-001', deps: ['TH-002'] },
    'TH-002.yaml': { id: 'TH-002', deps: ['TH-001'] },
    'TH-003.yaml': { id: 'TH-099' },
    'TH-004.yaml': { id: 'TH-004', deps: ['TH-404'] },
    'TH-005.yaml': { id: 'TH-005', extra: 'risk: low\n' },
  });
  try {
    const all = failures(await validateRepository(root, validators)).flatMap((r) => r.errors.map((e) => `${r.file} ${e}`));
    const has = (fragment) => assert.ok(all.some((e) => e.includes(fragment)), `« ${fragment} » absent de ${JSON.stringify(all, null, 2)}`);
    has('cycle de dépendances : TH-001 → TH-002 → TH-001');
    has('TH-003.yaml /id « TH-099 » ne correspond pas au nom du fichier');
    has('TH-004.yaml /dependencies mission(s) inconnue(s) : TH-404');
    has('TH-005.yaml YAML');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
