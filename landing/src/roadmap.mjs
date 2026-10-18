// Page « Feuille de route » : timeline des missions, du passé vers les prochaines missions.
// Les données viennent de src/roadmap-data.mjs (dépôt lu au build), les textes de
// locales/<lang>/roadmap.json ; le résumé fonctionnel d'une mission est la clé de son identifiant.
import { html, attr } from './html.mjs';
import { arrowMark, growthRings, stateIcon } from './icons.mjs';

const LOCALE = { fr: 'fr-FR', en: 'en-US' };
const compact = (lang, n) => new Intl.NumberFormat(LOCALE[lang], { notation: 'compact', maximumSignificantDigits: 3 }).format(n);
const TZ = 'Europe/Paris';

// Jour civil à Paris : « 18 oct. 2026 », « Oct 18, 2026 » ; attribut datetime AAAA-MM-JJ.
export const formatDay = (lang, iso) =>
  new Intl.DateTimeFormat(LOCALE[lang], { day: 'numeric', month: 'short', year: 'numeric', timeZone: TZ }).format(new Date(iso));
const isoDay = (iso) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date(iso));

// Résumé fonctionnel de la locale ; à défaut, titre bilingue du contrat (mission hors plan
// publiée sans résumé), puis identifiant seul.
export const summaryOf = (ctx, m) => ctx.t.roadmapPage.missions[m.id] ?? m.title?.[ctx.lang] ?? m.id;

const typeOf = (ctx, m) => (m.type ? ctx.t.roadmapPage.types[m.type.split('.')[0]] : null);

function contributeUrl(ctx, m) {
  const { config, t } = ctx;
  const c = t.roadmapPage.next;
  const fill = (s) =>
    s.replaceAll('{id}', m.id).replaceAll('{summary}', summaryOf(ctx, m)).replaceAll('{contract}', contractUrl(ctx, m));
  const url = new URL(config.links.discussionsNew);
  url.searchParams.set('category', config.contribute.discussionCategory);
  url.searchParams.set('title', fill(c.discussionTitle));
  url.searchParams.set('body', fill(c.discussionBody));
  return url.href;
}

const contractUrl = (ctx, m) => ctx.config.links.missionContract.replace('{id}', m.id);

// Pastille d'état : forme et couleur, jamais la couleur seule (design/tokens.md).
const statePill = (ctx, state) => html`<span class="th-state th-state--${state}">${stateIcon(state)}${ctx.t.roadmapPage.states[state]}</span>`;

// Ligne de la timeline : rail (date, libellé), nœud sur l'axe, contenu.
const row = (kind, rail, main) => html`<li class="th-tl-row th-tl-row--${kind}">
<div class="th-tl-rail">${rail}</div>
<div class="th-tl-main">${main}</div>
</li>`;

const head = (key, s, id) => html`<div class="th-tl-row th-tl-row--head th-tl-row--${key}">
<p class="th-tl-rail th-eyebrow">${s.eyebrow}</p>
<div class="th-tl-main th-section-head">
<h2 class="th-h2" id="${id}">${s.title}</h2>
${s.text ? html`<p class="th-tl-lead">${s.text}</p>` : ''}
</div>
</div>`;

function intro(ctx) {
  const { t, config, lang, roadmap: r } = ctx;
  const p = t.roadmapPage;
  const live = r.lots.find((l) => l.state === 'live');
  const frac = live?.total ? live.done / live.total : 0;
  const art = growthRings(p.art.label, r.lots, live ? live.n : null, frac, html`<g class="th-art-counter" aria-hidden="true">
<text class="th-art-counter__value" x="452" y="414" text-anchor="end">${r.counts.done}</text>
<text class="th-art-counter__label" x="452" y="442" text-anchor="end">${p.art.integrated}</text>
<text class="th-art-counter__missions" x="452" y="464" text-anchor="end"><tspan>${p.art.of}</tspan> <tspan class="th-art-counter__number">${r.counts.total}</tspan></text>
</g>`);
  return html`<section class="th-hero th-rm-hero">
<div class="th-hero__inner">
<div class="th-hero__text">
<p class="th-eyebrow">${p.eyebrow}</p>
<h1 class="th-hero__title th-rm-title">${p.title}</h1>
<p class="th-lead">${p.lead}</p>
<div class="th-actions">
<a class="th-btn th-btn--primary" href="#ensuite">${p.ctaNext}</a>
<a class="th-btn th-btn--outline" href="${config.links.repository}">${p.ctaRepo}</a>
</div>
</div>
<figure class="th-hero__art th-rm-art">${art}</figure>
</div>
<div class="th-wrap">
<ol class="th-rm-index" aria-label="${p.index.label}">
${r.lots.map((l) => html`<li class="th-rm-index__lot th-rm-index__lot--${l.state}">
<span class="th-rm-index__top"><span class="th-rm-index__n">${t.roadmap.lots[l.n].n}</span><span class="th-pill th-pill--${l.state}">${t.roadmap.states[l.state]}</span></span>
<span class="th-rm-index__name">${t.roadmap.lots[l.n].name}</span>
<svg class="th-rm-bar" aria-hidden="true" viewBox="0 0 100 6" preserveAspectRatio="none"><rect class="th-rm-bar__track" width="100" height="6" rx="3"/>${l.done ? html`<rect class="th-rm-bar__fill" width="${Math.max(6, (100 * l.done) / l.total).toFixed(1)}" height="6" rx="3"/>` : ''}</svg>
<span class="th-rm-index__count"><data value="${l.done}">${l.done}</data> <span>${p.index.of}</span> <data value="${l.total}">${l.total}</data> <span class="sr-only">${p.index.missions}</span></span>
</li>`)}
</ol>
<nav class="th-rm-jump" aria-label="${p.jumpLabel}">
<a href="#realise">${p.done.eyebrow}</a>
<a href="#maintenant">${p.now.eyebrow}</a>
<a href="#ensuite">${p.next.eyebrow}</a>
<a href="#programme">${p.later.eyebrow}</a>
</nav>
</div>
</section>`;
}

// Passé : missions intégrées, groupées par lot, datées, avec les tokens déclarés.
function done(ctx) {
  const { t, lang, config, roadmap: r } = ctx;
  const p = t.roadmapPage;
  const groups = r.lots.map((l) => ({ lot: l, list: r.done.filter((m) => m.lot === l.n) })).filter((g) => g.list.length);
  return html`<section class="th-tl-section th-tl-section--done" id="realise" aria-labelledby="realise-titre">
${head('done', p.done, 'realise-titre')}
${groups.length
    ? html`<ol class="th-tl">
${groups.map(({ lot, list }) => html`<li class="th-tl-group">
<div class="th-tl-row th-tl-row--lot th-tl-row--lot-${lot.state}">
<p class="th-tl-rail th-tl-lotn">${t.roadmap.lots[lot.n].n}</p>
<div class="th-tl-main">
<h3 class="th-tl-lotname">${t.roadmap.lots[lot.n].name}</h3>
<p class="th-tl-promise">${p.lots[lot.n].promise}</p>
</div>
</div>
<ol class="th-tl-items">
${list.map((m, i) => {
    const same = i > 0 && list[i - 1].date && m.date && isoDay(list[i - 1].date) === isoDay(m.date);
    return row(
      'done',
      m.date ? html`<time class="th-tl-date${same ? ' th-tl-date--same' : ''}" datetime="${isoDay(m.date)}">${formatDay(lang, m.date)}</time>` : '',
      html`<span class="th-tl-id">${m.id}</span>
<p class="th-tl-text">${summaryOf(ctx, m)} <span class="sr-only">${p.states.done}</span></p>
${m.tokens ? html`<span class="th-tl-tokens"><data value="${m.tokens}">${compact(lang, m.tokens)}</data> <span>${p.done.tokens}</span></span>` : ''}`,
    );
  })}
</ol>
</li>`)}
</ol>
<p class="th-tl-note">${p.done.note} <a href="${config.links.usageReports}">${p.done.reports}</a></p>`
    : html`<p class="th-tl-note">${p.done.empty}</p>`}
</section>`;
}

// Présent : le lot en cours, les chiffres du dépôt et les missions en cours ou en revue.
function now(ctx) {
  const { t, lang, roadmap: r, stats } = ctx;
  const p = t.roadmapPage;
  const n = p.now;
  const lot = r.current === null ? null : t.roadmap.lots[r.current];
  const figures = [
    [r.counts.done, n.stats.done],
    [r.counts.active, n.stats.active],
    [r.counts.open, n.stats.open],
    ...(stats?.tokens ? [[stats.tokens, n.stats.tokens]] : []),
  ];
  return html`<section class="th-tl-section th-tl-section--now" id="maintenant" aria-labelledby="maintenant-titre">
<div class="th-tl-row th-tl-row--now">
<span class="th-tl-mark">${arrowMark(30)}</span>
<div class="th-tl-main th-now">
<div class="th-now__top">
<p class="th-eyebrow th-eyebrow--accent">${n.eyebrow}</p>
${r.asOf ? html`<p class="th-now__asof">${n.asOf} <time datetime="${isoDay(r.asOf)}">${formatDay(lang, r.asOf)}</time></p>` : ''}
</div>
${lot
    ? html`<div class="th-now__head"><h2 class="th-h2" id="maintenant-titre"><span class="th-now__lot">${lot.n}</span> <span>${lot.name}</span></h2><span class="th-pill th-pill--live">${t.roadmap.states.live}</span></div>
<p class="th-now__promise">${p.lots[r.current].promise}</p>`
    : html`<h2 class="th-h2" id="maintenant-titre">${n.allDone}</h2>`}
<dl class="th-now__stats">
${figures.map(([value, label]) => html`<div><dt>${label}</dt><dd><data value="${value}">${value >= 10000 ? compact(lang, value) : value}</data></dd></div>`)}
</dl>
${r.active.length
    ? html`<div class="th-now__active">
<p class="th-now__label">${n.activeLabel}</p>
<ul>
${r.active.map((m) => html`<li><span class="th-tl-id">${m.id}</span><span class="th-now__text">${summaryOf(ctx, m)}</span>${statePill(ctx, m.state)}</li>`)}
</ul>
</div>`
    : ''}
</div>
</div>
</section>`;
}

// Prochaines missions : ouvertes, dépendances satisfaites, classées par priorité.
function next(ctx) {
  const { t, roadmap: r } = ctx;
  const p = t.roadmapPage;
  return html`<section class="th-tl-section th-tl-section--next" id="ensuite" aria-labelledby="ensuite-titre">
${head('next', p.next, 'ensuite-titre')}
${r.next.length
    ? html`<div class="th-tl-row th-tl-row--cards">
<div class="th-tl-rail"></div>
<ul class="th-tl-main th-next-list">
${r.next.map((m) => html`<li class="th-card th-next">
<div class="th-next__top"><span class="th-tl-id">${m.id}</span><span class="th-next__lot">${t.roadmap.lots[m.lot].n}</span>${statePill(ctx, 'open')}</div>
<h3 class="th-next__title" id="mission-${m.id}">${summaryOf(ctx, m)}</h3>
<p class="th-next__meta">${[typeOf(ctx, m), m.size && p.sizes[m.size]].filter(Boolean).map((s) => html`<span>${s}</span>`)}</p>
<div class="th-next__actions">
<a class="th-btn th-btn--primary" href="${contributeUrl(ctx, m)}" aria-describedby="mission-${m.id}">${p.next.contribute}</a>
<a class="th-next__contract" href="${contractUrl(ctx, m)}" aria-describedby="mission-${m.id}">${p.next.contract}</a>
</div>
</li>`)}
</ul>
</div>`
    : html`<p class="th-tl-note">${p.next.empty}</p>`}
</section>`;
}

// Programme : le reste du plan, lot par lot, jusqu'à la porte de sortie de chaque lot.
function later(ctx) {
  const { t, lang, config, roadmap: r } = ctx;
  const p = t.roadmapPage;
  const groups = r.lots.map((l) => ({ lot: l, list: r.later.filter((m) => m.lot === l.n) })).filter((g) => g.list.length);
  return html`<section class="th-tl-section th-tl-section--later" id="programme" aria-labelledby="programme-titre">
${head('later', p.later, 'programme-titre')}
<ol class="th-tl">
${groups.map(({ lot, list }) => html`<li class="th-tl-group">
<details class="th-later"${attr('open', lot.n === r.current && 'open')}>
<summary class="th-tl-row th-tl-row--lot th-tl-row--lot-${lot.state}">
<span class="th-tl-rail th-tl-lotn">${t.roadmap.lots[lot.n].n}</span>
<span class="th-tl-main">
<span class="th-tl-lotname">${t.roadmap.lots[lot.n].name}</span>
<span class="th-later__count"><data value="${list.length}">${list.length}</data> <span>${p.later.remaining}</span></span>
<span class="th-tl-promise">${p.lots[lot.n].promise}</span>
</span>
</summary>
<ol class="th-tl-items">
${list.map((m) => row(
    m.state,
    '',
    html`<span class="th-tl-id">${m.id}</span>
<p class="th-tl-text">${summaryOf(ctx, m)}${m.state === 'planned' ? html` <span class="sr-only">${p.states.planned}</span>` : ''}</p>
${m.state === 'planned' ? '' : statePill(ctx, m.state)}`,
  ))}
${row('gate', html`<span class="th-tl-gatelabel">${p.later.gate}</span>`, html`<p class="th-tl-text th-tl-gate"><span class="sr-only">${p.later.gate} </span>${p.lots[lot.n].gate}</p>`)}
</ol>
</details>
</li>`)}
</ol>
<p class="th-tl-note"><a href="${config.links.plan[lang]}">${p.later.plan}</a></p>
</section>`;
}

function join(ctx) {
  const { t, config } = ctx;
  const j = t.roadmapPage.join;
  return html`<section class="th-section th-section--last">
<div class="th-join">
<div class="th-join__text">
<h2 class="th-h2">${j.title}</h2>
<p>${j.text}</p>
</div>
<div class="th-actions">
<a class="th-btn th-btn--primary" href="${config.links.discussions}">${j.discussions}</a>
<a class="th-btn th-btn--outline" href="${config.links.contributing}">${j.guide}</a>
</div>
</div>
</section>`;
}

export function roadmapPage(ctx) {
  return html`${intro(ctx)}
<div class="th-flow">
${done(ctx)}
${now(ctx)}
${next(ctx)}
${later(ctx)}
</div>
${join(ctx)}`;
}

