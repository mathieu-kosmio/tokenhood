// Génère le site statique de la landing dans dist/.
// Usage : node build.mjs   (BREVO_FORM_ACTION=<url> pour activer le formulaire)
import { readFile, writeFile, mkdir, rm, copyFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { localize } from './src/typo.mjs';
import { layout } from './src/layout.mjs';
import { home } from './src/home.mjs';
import { prose, notFound } from './src/prose.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(ROOT, '..');
const require = createRequire(import.meta.url);

const FONTS = [
  { pkg: '@fontsource-variable/lexend', preload: true },
  { pkg: '@fontsource-variable/public-sans', preload: true },
  { pkg: '@fontsource-variable/jetbrains-mono', preload: false },
];
const SUBSETS = ['latin', 'latin-ext'];
const NAMESPACES = ['landing', 'legal'];

const hash = (buf) => createHash('sha256').update(buf).digest('hex').slice(0, 10);
const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));

export async function loadConfig(env = process.env) {
  const config = await readJson(path.join(ROOT, 'site.config.json'));
  if (env.BREVO_FORM_ACTION) config.form.action = env.BREVO_FORM_ACTION.trim();
  if (config.form.action) {
    const url = new URL(config.form.action);
    // La CSP de nginx.conf n'autorise l'envoi que vers les formulaires hébergés par Brevo.
    if (url.protocol !== 'https:' || !url.hostname.endsWith('.sibforms.com')) {
      throw new Error(`URL d'action du formulaire refusée (attendu https://*.sibforms.com) : ${config.form.action}`);
    }
  }
  return config;
}

export async function loadLocales(config) {
  const locales = {};
  for (const lang of config.langs) {
    locales[lang] = {};
    for (const ns of NAMESPACES) {
      Object.assign(locales[lang], await readJson(path.join(ROOT, 'locales', lang, `${ns}.json`)));
    }
  }
  return locales;
}

async function buildFonts(outDir) {
  const faces = [];
  const preload = [];
  await mkdir(path.join(outDir, 'assets/fonts'), { recursive: true });
  for (const font of FONTS) {
    const dir = path.dirname(require.resolve(`${font.pkg}/package.json`));
    const css = await readFile(path.join(dir, 'index.css'), 'utf8');
    const family = font.pkg.split('/')[1];
    await copyFile(path.join(dir, 'LICENSE'), path.join(outDir, `assets/fonts/LICENSE-${family}.txt`));
    for (const [, name, body] of css.matchAll(/\/\* ([\w-]+) \*\/\s*@font-face\s*\{([^}]*)\}/g)) {
      const subset = SUBSETS.find((s) => name === `${family}-${s}-wght-normal`);
      if (!subset) continue;
      const file = body.match(/url\(\.\/files\/([^)]+\.woff2)\)/)[1];
      const data = await readFile(path.join(dir, 'files', file));
      const target = `/assets/fonts/${file.replace(/\.woff2$/, `.${hash(data)}.woff2`)}`;
      await writeFile(path.join(outDir, target), data);
      faces.push(`/* ${name} */\n@font-face {${body.replace(/url\([^)]+\)/, `url(${target})`)}}`);
      if (font.preload && subset === 'latin') preload.push(target);
    }
  }
  return { css: faces.join('\n'), preload };
}

async function writeAsset(outDir, name, ext, content) {
  const file = `/assets/${name}.${hash(content)}.${ext}`;
  await writeFile(path.join(outDir, file), content);
  return file;
}

async function writePage(outDir, route, content) {
  const dir = path.join(outDir, route);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'index.html'), content);
  return path.posix.join(route, 'index.html');
}

export async function build({ outDir = path.join(ROOT, 'dist'), env = process.env } = {}) {
  const config = await loadConfig(env);
  const locales = await loadLocales(config);

  await rm(outDir, { recursive: true, force: true });
  await mkdir(path.join(outDir, 'assets'), { recursive: true });

  const fonts = await buildFonts(outDir);
  const css = [
    '/* Tokenhood · landing. Généré par landing/build.mjs, ne pas modifier. */',
    fonts.css,
    await readFile(path.join(REPO, 'design/kosmio.css'), 'utf8'),
    await readFile(path.join(REPO, 'design/tokenhood.css'), 'utf8'),
    await readFile(path.join(ROOT, 'src/styles.css'), 'utf8'),
  ].join('\n\n');
  const assets = {
    css: await writeAsset(outDir, 'site', 'css', css),
    js: await writeAsset(outDir, 'site', 'js', await readFile(path.join(ROOT, 'src/site.js'))),
    preload: fonts.preload,
  };

  for (const file of await readdir(path.join(ROOT, 'public'))) {
    await copyFile(path.join(ROOT, 'public', file), path.join(outDir, file));
  }

  const ctxFor = (lang, page) => ({ lang, page, config, assets, t: localize(lang, locales[lang]) });
  const pages = [];
  for (const lang of config.langs) {
    const r = config.routes;
    let ctx = ctxFor(lang, 'home');
    pages.push(await writePage(outDir, r.home[lang], layout(ctx, { title: ctx.t.meta.title, description: ctx.t.meta.description, body: home(ctx) })));
    for (const page of ['legal', 'privacy']) {
      ctx = ctxFor(lang, page);
      const doc = ctx.t[page];
      pages.push(await writePage(outDir, r[page][lang], layout(ctx, { title: doc.metaTitle, description: doc.metaDescription, body: prose(doc) })));
    }
  }

  const ctx404 = config.langs.map((lang) => ctxFor(lang, '404'));
  const main = ctx404[0];
  await writeFile(
    path.join(outDir, '404.html'),
    layout(main, { title: main.t.notFound.metaTitle, description: main.t.notFound.text, noindex: true, body: notFound(ctx404) }),
  );
  pages.push('/404.html');

  const urls = Object.values(config.routes).flatMap((byLang) => config.langs.map((lang) => config.siteUrl + byLang[lang]));
  await writeFile(
    path.join(outDir, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`,
  );
  await writeFile(path.join(outDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${config.siteUrl}/sitemap.xml\n`);

  return { outDir, pages, config, locales };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { outDir, pages, config } = await build();
  console.log(`Landing générée dans ${path.relative(process.cwd(), outDir) || '.'} : ${pages.length} pages.`);
  console.log(config.form.action ? `Formulaire relié à ${config.form.action}` : 'Formulaire non configuré : repli sur GitHub Discussions.');
}
