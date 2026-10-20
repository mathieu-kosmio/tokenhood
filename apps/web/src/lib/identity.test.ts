import { describe, expect, it } from 'vitest';
import { rubriques } from './account.js';
import { allowedDuringRegistration, safeReturnTo, timezones } from './identity.js';

describe('accès pendant l’inscription', () => {
  it.each([
    ['/registration', true],
    ['/logout', true],
    ['/healthz', true],
    ['/', false],
    ['/account/profile', false],
    ['/login', false],
    ['/registrationx', false],
  ])('%s → %s', (path, allowed) => {
    expect(allowedDuringRegistration(path)).toBe(allowed);
  });
});

describe('adresse de retour', () => {
  it.each([
    ['/account/profile', '/account/profile'],
    [null, '/account'],
    ['https://evil.example', '/account'],
    ['//evil.example', '/account'],
    ['/\\evil', '/account'],
  ])('%s → %s', (value, expected) => {
    expect(safeReturnTo(value)).toBe(expected);
  });
});

describe('espace Compte', () => {
  it('liste les rubriques déclarées par leur dossier, sans menu central', () => {
    expect(rubriques().map((r) => [r.id, r.label, r.href()])).toEqual([
      ['profile', 'identity.account.rubrique.profile', '/account/profile'],
    ]);
  });

  it('propose les fuseaux IANA et UTC', () => {
    expect(timezones()).toEqual(expect.arrayContaining(['UTC', 'Europe/Paris']));
  });
});
