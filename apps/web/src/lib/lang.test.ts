import { describe, expect, it } from 'vitest';
import { resolveLang } from './lang.js';

describe('resolveLang', () => {
  it('le choix explicite prime et se mémorise', () => {
    expect(resolveLang({ query: 'en', cookie: 'fr', acceptLanguage: 'fr' })).toEqual({
      lang: 'en',
      remember: true,
    });
  });

  it('le cookie prime sur le navigateur', () => {
    expect(resolveLang({ query: null, cookie: 'en', acceptLanguage: 'fr-FR' })).toEqual({
      lang: 'en',
      remember: false,
    });
  });

  it('sans choix, la langue du navigateur décide', () => {
    expect(resolveLang({ query: null, cookie: undefined, acceptLanguage: 'en-US,en;q=0.9' }).lang).toBe('en');
  });

  it('une valeur inconnue est ignorée', () => {
    expect(resolveLang({ query: 'de', cookie: 'xx', acceptLanguage: null })).toEqual({
      lang: 'fr',
      remember: false,
    });
  });
});
