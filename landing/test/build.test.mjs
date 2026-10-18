// Tests du build : traductions alignées, aucune chaîne d'interface en dur,
// liens internes valides, aucune ressource tierce chargée.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { build, loadConfig, loadLocales, loadStats } from '../build.mjs';
import { localize } from '../src/typo.mjs';

const ACTION = 'https://example.sibforms.com/serve/TEST';
let plain;   // build sans formulaire Brevo
let withForm; // build avec formulaire Brevo

before(async () => {
  plain = await build({ outDir: await mkdtemp(path.join(tmpdir(), 'th-landing-')), env: {} });
  withForm = await build({ outDir: await mkdtemp(path.join(tmpdir(), 'th-landing-')), env: { BREVO_FORM_ACTION: ACTION } });
  process.on('exit', () => {
    for (const b of [plain, withForm]) rm(b.outDir, { recursive: true, force: true });
  });
});

const read = (b, page) => readFile(path.join(b.outDir, page), 'utf8');

const decode = (s) => s
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');

function shape(value, at = '') {
  if (Array.isArray(value)) return [`${at}[${value.length}]`, ...value.flatMap((v, i) => shape(v, `${at}[${i}]`))];
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([k, v]) => shape(v, `${at}.${k}`));
  return [`${at}:${typeof value}`];
}

function strings(value) {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
}

test('les locales FR et EN ont exactement la même structure', async () => {
  const config = await loadConfig({});
  const locales = await loadLocales(config);
  const [ref, ...others] = config.langs;
  for (const lang of others) assert.deepEqual(shape(locales[lang]), shape(locales[ref]), `structure ${lang} ≠ ${ref}`);
  for (const lang of config.langs) {
    for (const s of strings(locales[lang])) assert.ok(s.trim().length > 0, `chaîne vide dans ${lang}`);
  }
});

test('chaque page attendue est générée, avec la bonne langue', async () => {
  for (const b of [plain, withForm]) {
    for (const [page, byLang] of Object.entries(b.config.routes)) {
      for (const lang of b.config.langs) {
        const doc = await read(b, path.join(byLang[lang], 'index.html'));
        assert.match(doc, new RegExp(`<html lang="${lang}"`), `${page}/${lang}`);
        assert.doesNotMatch(doc, /undefined|\[object |\{\{|NaN/, `${page}/${lang} contient un reste de gabarit`);
      }
    }
    await stat(path.join(b.outDir, '404.html'));
  }
});

test("aucune chaîne d'interface en dur : tout texte visible vient des locales", async () => {
  for (const b of [plain, withForm]) {
    for (const lang of b.config.langs) {
      const known = strings(localize(lang, b.locales[lang]));
      const pages = Object.values(b.config.routes).map((r) => path.join(r[lang], 'index.html'));
      for (const page of pages) {
        const doc = (await read(b, page)).replace(/<(script|style|svg)\b[\s\S]*?<\/\1>/g, '');
        const body = doc.slice(doc.indexOf('<body'));
        const texts = [...body.matchAll(/>([^<]+)</g)].map((m) => decode(m[1]).trim()).filter(Boolean);
        const attrs = [...doc.matchAll(/\s(?:aria-label|placeholder|alt|title)="([^"]*)"/g)].map((m) => decode(m[1]));
        const titles = [...doc.matchAll(/<title>([^<]*)<\/title>/g)].map((m) => decode(m[1]));
        // Seule exception : un nombre mis en forme par Intl (« 2,6 M », « 2.6M », « 8 »).
        const isNumber = (text) => /^[\d\s.,\u00a0\u202f]+\s?[kKMB]?$/u.test(text);
        for (const text of [...texts, ...attrs, ...titles]) {
          if (isNumber(text)) continue;
          assert.ok(known.some((k) => k.includes(text)), `${page} : « ${text} » ne vient d'aucune locale ${lang}`);
        }
      }
    }
  }
});

test('les ancres et les liens internes pointent vers une cible existante', async () => {
  for (const b of [plain, withForm]) {
    for (const byLang of Object.values(b.config.routes)) {
      for (const lang of b.config.langs) {
        const doc = await read(b, path.join(byLang[lang], 'index.html'));
        const ids = new Set([...doc.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
        for (const [, href] of doc.matchAll(/\shref="([^"]+)"/g)) {
          if (href.startsWith('#')) assert.ok(ids.has(href.slice(1)), `${byLang[lang]} : ancre ${href} absente`);
          if (href.startsWith('/')) {
            const [file, hash] = href.split('#');
            const target = path.join(b.outDir, file.endsWith('/') ? `${file}index.html` : file);
            await stat(target);
            if (hash) {
              const other = await readFile(target, 'utf8');
              assert.match(other, new RegExp(`\\sid="${hash}"`), `${href} : ancre absente`);
            }
          }
        }
      }
    }
  }
});

test('aucune ressource tierce chargée au rendu (polices et styles auto-hébergés)', async () => {
  for (const b of [plain, withForm]) {
    const doc = await read(b, 'index.html');
    const loads = [
      ...[...doc.matchAll(/<link\b[^>]*>/g)].map((m) => m[0]).filter((tag) => !/rel="(canonical|alternate)"/.test(tag)),
      ...[...doc.matchAll(/<(script|img|iframe)\b[^>]*>/g)].map((m) => m[0]),
    ];
    for (const tag of loads) assert.doesNotMatch(tag, /(href|src)="(https?:)?\/\//, `ressource externe : ${tag}`);
    const css = doc.match(/href="(\/assets\/site\.[^"]+\.css)"/)[1];
    const sheet = await readFile(path.join(b.outDir, css), 'utf8');
    assert.doesNotMatch(sheet, /url\((["']?)(https?:)?\/\//, 'ressource externe dans le CSS');
    assert.doesNotMatch(sheet, /@import/, '@import dans le CSS');
  }
});

test('sans URL Brevo, le bloc Rejoindre renvoie vers GitHub Discussions', async () => {
  const doc = await read(plain, 'index.html');
  assert.doesNotMatch(doc, /<form/);
  assert.match(doc, new RegExp(`href="${plain.config.links.discussions}"`));
});

test('avec une URL Brevo, le formulaire poste vers Brevo avec les champs attendus', async () => {
  const { fields, roleValues } = withForm.config.form;
  for (const lang of withForm.config.langs) {
    const doc = await read(withForm, path.join(withForm.config.routes.home[lang], 'index.html'));
    assert.match(doc, new RegExp(`<form[^>]*method="post"[^>]*action="${ACTION}"`));
    assert.match(doc, new RegExp(`name="${fields.email.replace(/[[\]]/g, '\\$&')}" type="email"[^>]*required`));
    for (const value of Object.values(roleValues)) {
      assert.match(doc, new RegExp(`name="${fields.role.replace(/[[\]]/g, '\\$&')}" value="${value}"`));
    }
    assert.match(doc, new RegExp(`name="${fields.honeypot}" value="" tabindex="-1"`));
    assert.match(doc, new RegExp(`name="${fields.locale}" value="${lang}"`));
    assert.match(doc, new RegExp(`href="${withForm.config.routes.privacy[lang]}"`));
  }
});

test("une URL d'action hors sibforms.com est refusée au build", async () => {
  await assert.rejects(loadConfig({ BREVO_FORM_ACTION: 'https://evil.example.com/collect' }), /refusée/);
  await assert.rejects(loadConfig({ BREVO_FORM_ACTION: 'http://x.sibforms.com/serve/A' }), /refusée/);
});

test('les alternatives hreflang sont réciproques', async () => {
  const { config } = plain;
  for (const byLang of Object.values(config.routes)) {
    for (const lang of config.langs) {
      const doc = await read(plain, path.join(byLang[lang], 'index.html'));
      for (const other of config.langs) {
        assert.match(doc, new RegExp(`hreflang="${other}" href="${config.siteUrl}${byLang[other]}"`));
      }
    }
  }
});

test('la hero affiche les tokens déclarés et les missions intégrées du dépôt', async () => {
  const stats = await loadStats();
  assert.ok(stats.tokens > 0 && stats.reports > 0 && stats.integrated > 0, JSON.stringify(stats));
  const fr = await read(plain, 'index.html');
  const en = await read(plain, 'en/index.html');
  for (const doc of [fr, en]) {
    assert.match(doc, new RegExp(`<data value="${stats.tokens}">`));
    assert.match(doc, new RegExp(`<data value="${stats.integrated}">${stats.integrated}</data>`));
    assert.match(doc, /href="https:\/\/github\.com\/mathieu-kosmio\/tokenhood\/tree\/main\/\.tokenhood\/usage"/);
  }
  assert.match(fr, /<data value="\d+">[\d,]+\u00a0M<\/data>/);
  assert.match(en, /<data value="\d+">[\d.]+M<\/data>/);
});

test('sans rapport de consommation, la hero n\'affiche pas de compteur', async () => {
  const empty = await mkdtemp(path.join(tmpdir(), 'th-repo-vide-'));
  const b = await build({ outDir: await mkdtemp(path.join(tmpdir(), 'th-landing-')), env: {}, repo: empty });
  try {
    assert.equal(b.stats.tokens, 0);
    assert.doesNotMatch(await read(b, 'index.html'), /th-stats/);
  } finally {
    await rm(b.outDir, { recursive: true, force: true });
    await rm(empty, { recursive: true, force: true });
  }
});
