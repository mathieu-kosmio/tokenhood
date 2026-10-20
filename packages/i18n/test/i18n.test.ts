import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { LANGS, catalog, negotiate, translate } from '../src/index.js';
// @ts-expect-error script JavaScript sans déclaration de types
import { check, keysOf, loadLocales, loadSources, merge } from '../scripts/generate.mjs';

// Arborescence locales/ temporaire : { 'fr.json': {...}, 'fr/identity.json': {...} } ou texte brut.
async function withLocales(files: Record<string, unknown>, run: (dir: string) => Promise<void>) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'th-locales-'));
  try {
    for (const [file, content] of Object.entries(files)) {
      mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
      writeFileSync(
        path.join(dir, file),
        typeof content === 'string' ? content : JSON.stringify(content, null, 2),
      );
    }
    await run(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe('locales', () => {
  it('fr et en ont les mêmes clés, des messages ICU valides et les mêmes arguments', async () => {
    expect(check(await loadLocales())).toEqual([]);
  });

  it('le contrôle détecte une clé manquante et un argument divergent', () => {
    const errors: string[] = check({
      fr: { a: 'Bonjour {nom}', b: 'Au revoir' },
      en: { a: 'Hello {name}' },
    });
    expect(errors).toContain('en : clé manquante « b »');
    expect(errors.some((e) => e.includes('« a » utilise {name}'))).toBe(true);
  });

  it('chaque langue prise en charge a son catalogue', () => {
    for (const lang of LANGS) expect(Object.keys(catalog(lang)).length).toBeGreaterThan(0);
  });
});

describe('fusion des fichiers de module', () => {
  it('fusionne locales/<lang>.json et locales/<lang>/<module>.json', async () => {
    await withLocales(
      {
        'fr.json': { 'app.name': 'Tokenhood' },
        'en.json': { 'app.name': 'Tokenhood' },
        'fr/identity.json': { 'identity.title': 'Profil de {name}' },
        'en/identity.json': { 'identity.title': '{name}’s profile' },
      },
      async (dir) => {
        const { messages, errors } = merge(await loadSources(dir));
        expect(errors).toEqual([]);
        expect(messages.fr).toEqual({ 'app.name': 'Tokenhood', 'identity.title': 'Profil de {name}' });
        expect(check(messages)).toEqual([]);
      },
    );
  });

  it('refuse une clé définie deux fois, entre deux fichiers ou dans le même fichier', async () => {
    await withLocales(
      {
        'fr.json': { 'identity.title': 'Commun' },
        'fr/identity.json':
          '{\n  "identity.title": "Module",\n  "identity.x": "a",\n  "identity.x": "b"\n}\n',
      },
      async (dir) => {
        const { errors } = merge(await loadSources(dir));
        expect(errors).toEqual([
          'fr/identity.json : clé « identity.title » déjà définie dans fr.json',
          'fr/identity.json : clé « identity.x » déjà définie dans fr/identity.json',
        ]);
      },
    );
  });

  it('refuse, dans un fichier de module, une clé hors de son préfixe', async () => {
    await withLocales({ 'fr.json': {}, 'fr/identity.json': { 'interests.title': 'x' } }, async (dir) => {
      expect(merge(await loadSources(dir)).errors).toEqual([
        'fr/identity.json : la clé « interests.title » doit commencer par « identity. »',
      ]);
    });
  });

  it('garde la parité des clés et des arguments entre langues, fichiers de module compris', async () => {
    await withLocales(
      {
        'fr.json': {},
        'en.json': {},
        'fr/identity.json': { 'identity.a': 'Bonjour {nom}', 'identity.b': 'Au revoir' },
        'en/identity.json': { 'identity.a': 'Hello {name}' },
      },
      async (dir) => {
        const errors: string[] = check(merge(await loadSources(dir)).messages);
        expect(errors).toContain('en : clé manquante « identity.b »');
        expect(errors.some((e) => e.includes('« identity.a » utilise {name}'))).toBe(true);
      },
    );
  });

  it('lit les clés de premier niveau dans l’ordre, doublons compris', () => {
    expect(keysOf('{"a": "x: \\"y\\"", "b": {"c": 1}, "a": "z"}')).toEqual(['a', 'b', 'a']);
  });
});

describe('negotiate', () => {
  it.each([
    [undefined, 'fr'],
    ['', 'fr'],
    ['en-GB,en;q=0.9', 'en'],
    ['de-DE,de;q=0.9,en;q=0.5,fr;q=0.4', 'en'],
    ['fr-CA;q=0.3,en;q=0.2', 'fr'],
    ['de, es', 'fr'],
    ['en;q=0, fr;q=0.1', 'fr'],
  ])('%s → %s', (header, expected) => {
    expect(negotiate(header)).toBe(expected);
  });
});

describe('translate', () => {
  it('applique les pluriels ICU dans chaque langue', () => {
    expect(translate('fr', 'home.progress', { integrated: 0, total: 16, lot: 0 })).toBe(
      'Aucune mission intégrée sur 16 au lot 0.',
    );
    expect(translate('fr', 'home.progress', { integrated: 2, total: 16, lot: 0 })).toBe(
      '2 missions intégrées sur 16 au lot 0.',
    );
    expect(translate('en', 'home.progress', { integrated: 1, total: 16, lot: 0 })).toBe(
      '1 mission merged out of 16 in lot 0.',
    );
  });

  it('remplace les variables', () => {
    expect(translate('en', 'errors.notFound', { path: '/v1/nope' })).toBe('Resource not found: /v1/nope');
  });
});
