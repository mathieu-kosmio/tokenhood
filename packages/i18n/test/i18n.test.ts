import { describe, expect, it } from 'vitest';
import { LANGS, catalog, negotiate, translate } from '../src/index.js';
// @ts-expect-error script JavaScript sans déclaration de types
import { check, loadLocales } from '../scripts/generate.mjs';

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
