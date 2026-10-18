// Squelette commun : <head>, en-tête, pied de page.
import { html, attr } from './html.mjs';
import { arrowMark } from './icons.mjs';

export function anchor(ctx, id) {
  return ctx.page === 'home' ? `#${id}` : `${ctx.config.routes.home[ctx.lang]}#${id}`;
}

function head(ctx, { title, description, noindex }) {
  const { config, lang, page, assets, t } = ctx;
  const routes = config.routes[page];
  const url = (path) => config.siteUrl + path;
  const alternates = routes
    ? [
        ...config.langs.map((l) => html`<link rel="alternate" hreflang="${l}" href="${url(routes[l])}">`),
        html`<link rel="alternate" hreflang="x-default" href="${url(routes[config.defaultLang])}">`,
      ]
    : [];
  return html`<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
${noindex ? html`<meta name="robots" content="noindex">` : ''}
${routes ? html`<link rel="canonical" href="${url(routes[lang])}">` : ''}
${alternates}
<meta property="og:type" content="website">
<meta property="og:site_name" content="Tokenhood">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
${routes ? html`<meta property="og:url" content="${url(routes[lang])}">` : ''}
<meta property="og:locale" content="${t.meta.ogLocale}">
<meta name="twitter:card" content="summary">
<meta name="theme-color" content="#FAFAF7">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
${assets.preload.map((href) => html`<link rel="preload" href="${href}" as="font" type="font/woff2" crossorigin>`)}
<link rel="stylesheet" href="${assets.css}">
<script src="${assets.js}" defer></script>
</head>`;
}

function header(ctx) {
  const { t, lang, config, page } = ctx;
  const routes = config.routes[page] ?? config.routes.home;
  const nav = [
    [anchor(ctx, 'how'), t.nav.how],
    [anchor(ctx, 'principles'), t.nav.principles],
    [config.routes.roadmap[lang], t.nav.roadmap, page === 'roadmap'],
    [anchor(ctx, 'faq'), t.nav.faq],
  ];
  return html`<header class="th-header">
<div class="th-header__inner">
<a class="th-brand" href="${config.routes.home[lang]}" aria-label="${t.brand.home}">${arrowMark(26)}<span aria-hidden="true">${t.brand.name}</span></a>
<nav class="th-nav" aria-label="${t.nav.label}">
${nav.map(([href, label, current]) => html`<a href="${href}"${attr('aria-current', current && 'page')}>${label}</a>`)}
</nav>
<div class="th-header__actions">
<div class="th-lang" role="group" aria-label="${t.lang.label}">
${config.langs.map((l) => html`<a href="${routes[l]}" hreflang="${l}" lang="${l}"${attr('aria-current', l === lang && 'page')}>${t.lang[l]}</a>`)}
</div>
<a class="th-btn th-btn--primary th-btn--sm" href="${anchor(ctx, 'join')}">${t.nav.cta}</a>
</div>
</div>
</header>`;
}

function footer(ctx) {
  const { t, lang, config } = ctx;
  return html`<footer class="th-footer">
<div class="th-footer__inner">
<div class="th-footer__brand">
<span class="th-footer__logo">${arrowMark(20)}${t.brand.name}</span>
<span class="th-footer__sign">${t.footer.sign} <a href="${config.links.kosmio}"><img class="th-footer__kosmio" src="/logo-kosmio.svg" alt="${t.footer.kosmioAlt}" width="84" height="28"></a></span>
</div>
<nav class="th-footer__nav" aria-label="${t.footer.nav}">
<a href="${config.links.repository}">${t.footer.github}</a>
<a href="${config.links.contributing}">${t.footer.contribute}</a>
<a href="${config.routes.legal[lang]}">${t.footer.legal}</a>
<a href="${config.routes.privacy[lang]}">${t.footer.privacy}</a>
</nav>
</div>
</footer>`;
}

export function layout(ctx, { title, description, noindex = false, body }) {
  return `<!doctype html>
${html`<html lang="${ctx.lang}" data-theme="light">
${head(ctx, { title, description, noindex })}
<body class="kos-tokenhood">
<a class="kos-evitement" href="#contenu">${ctx.t.skip}</a>
${header(ctx)}
<main id="contenu" tabindex="-1">
${body}
</main>
${footer(ctx)}
</body>
</html>`}
`;
}
