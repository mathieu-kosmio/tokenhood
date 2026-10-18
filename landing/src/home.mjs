// Page d'accueil : intégration de design/maquettes/landing.dc.html.
// La structure vit ici, tous les textes viennent de locales/<lang>/landing.json.
import { html, attr } from './html.mjs';
import { heroArt, principleIcons, swapSmall } from './icons.mjs';
import { anchor } from './layout.mjs';

// États de la carte d'exemple et des lots : de la structure, pas du texte.
const CARD_STATES = ['done', 'done', 'done', 'now', 'todo'];
const LOT_STATES = ['live', 'next', 'next', 'next', 'next'];
const ROLES = ['contributor', 'maintainer', 'governance'];

const sectionHead = (eyebrow, title) => html`<div class="th-section-head">
<p class="th-eyebrow">${eyebrow}</p>
<h2 class="th-h2">${title}</h2>
</div>`;

// Nombres au format de la langue : 2,6 M en français, 2.6M en anglais.
const LOCALE = { fr: 'fr-FR', en: 'en-US' };
const compact = (lang, n) => new Intl.NumberFormat(LOCALE[lang], { notation: 'compact', maximumFractionDigits: 1 }).format(n);

function stats(ctx) {
  const { t, lang, config, stats: s } = ctx;
  if (!s?.tokens) return '';
  return html`<div class="th-stats">
<dl class="th-stats__list" aria-label="${t.hero.statsLabel}">
<div class="th-stat"><dt>${t.hero.statTokens}</dt><dd><data value="${s.tokens}">${compact(lang, s.tokens)}</data></dd></div>
<div class="th-stat"><dt>${t.hero.statMissions}</dt><dd><data value="${s.integrated}">${s.integrated}</data></dd></div>
</dl>
<p class="th-stats__note">${t.hero.statNote} <a href="${config.links.usageReports}">${t.hero.statLink}</a></p>
</div>`;
}

function hero(ctx) {
  const { t } = ctx;
  return html`<section class="th-hero">
<div class="th-hero__inner">
<div class="th-hero__text">
<p class="th-eyebrow">${t.hero.eyebrow}</p>
<h1 class="th-hero__title">${t.hero.title}</h1>
<p class="th-lead">${t.hero.lead}</p>
<div class="th-actions">
<a class="th-btn th-btn--primary" href="${anchor(ctx, 'join')}" data-th-role="contributor">${t.hero.cta1}</a>
<a class="th-btn th-btn--outline" href="${anchor(ctx, 'who')}">${t.hero.cta2}</a>
</div>
${stats(ctx)}
<p class="th-hero__note">${swapSmall(20)}<span>${t.hero.note}</span></p>
</div>
<div class="th-hero__art">${heroArt(t.hero.artLabel)}</div>
</div>
</section>`;
}

function how({ t }) {
  return html`<section class="th-section" id="how">
${sectionHead(t.how.eyebrow, t.how.title)}
<ol class="th-steps">
${t.how.steps.map((s) => html`<li class="th-card">
<span class="th-step__n">${s.n}</span>
<h3 class="th-card__title">${s.title}</h3>
<p>${s.text}</p>
</li>`)}
</ol>
</section>`;
}

function mission({ t }) {
  const c = t.mission.card;
  const stateLabel = { done: c.stateDone, now: c.stateNow, todo: c.stateTodo };
  return html`<section class="th-section">
<div class="th-split">
<div class="th-split__text">
<p class="th-eyebrow">${t.mission.eyebrow}</p>
<h2 class="th-h2">${t.mission.title}</h2>
<p class="th-split__lead">${t.mission.text}</p>
</div>
<div class="th-split__aside">
<article class="th-card th-mission">
<div class="th-mission__top"><span class="th-mission__id">${c.id}</span><span class="th-badge th-badge--review">${swapSmall(14)}${c.badge}</span></div>
<h3 class="th-card__title">${c.title}</h3>
<ol class="th-track" aria-label="${c.stepsLabel}">
${c.steps.map((label, i) => html`<li class="th-track__step th-track__step--${CARD_STATES[i]}"${attr('aria-current', CARD_STATES[i] === 'now' && 'step')}><span class="th-track__bar"></span><span class="th-track__label">${label} <span class="sr-only">${stateLabel[CARD_STATES[i]]}</span></span></li>`)}
</ol>
<p class="th-mission__foot">${c.foot}</p>
</article>
<p class="th-note">${t.mission.note}</p>
</div>
</div>
</section>`;
}

function principles({ t }) {
  return html`<section class="th-section" id="principles">
${sectionHead(t.principles.eyebrow, t.principles.title)}
<div class="th-grid th-grid--4">
${t.principles.items.map((p, i) => html`<article class="th-card">
${principleIcons[i]}
<h3 class="th-card__title th-card__title--sm">${p.title}</h3>
<p>${p.text}</p>
</article>`)}
</div>
</section>`;
}

function who(ctx) {
  const { t } = ctx;
  return html`<section class="th-section" id="who">
${sectionHead(t.who.eyebrow, t.who.title)}
<div class="th-grid th-grid--3">
${t.who.items.map((w, i) => html`<article class="th-who">
<h3 class="th-who__title">${w.title}</h3>
<p>${w.text}</p>
<a class="th-who__cta" href="${anchor(ctx, 'join')}" data-th-role="${ROLES[i]}">${w.cta}</a>
</article>`)}
</div>
</section>`;
}

function roadmap({ t, config }) {
  return html`<section class="th-roadmap-wrap" id="roadmap">
<div class="th-roadmap">
<div class="th-roadmap__text">
<p class="th-eyebrow th-eyebrow--accent">${t.roadmap.eyebrow}</p>
<h2 class="th-h2">${t.roadmap.title}</h2>
<p>${t.roadmap.text}</p>
<a class="th-btn th-btn--accent" href="${config.links.repository}">${t.roadmap.cta}</a>
</div>
<ol class="th-lots">
${t.roadmap.lots.map((l, i) => html`<li class="th-lot">
<span class="th-lot__n">${l.n}</span>
<span class="th-lot__name">${l.name}</span>
<span class="th-pill th-pill--${LOT_STATES[i]}">${l.status}</span>
</li>`)}
</ol>
</div>
</section>`;
}

function faq({ t }) {
  return html`<section class="th-faq" id="faq">
<p class="th-eyebrow">${t.faq.eyebrow}</p>
<h2 class="th-h2">${t.faq.title}</h2>
<div class="th-faq__list">
${t.faq.items.map((q) => html`<details>
<summary><span>${q.q}</span></summary>
<p>${q.a}</p>
</details>`)}
</div>
</section>`;
}

function form(ctx) {
  const { t, lang, config } = ctx;
  const f = config.form;
  const j = t.join;
  if (!f.action) {
    return html`<div class="th-form th-form--soon">
<p>${j.soon}</p>
<a class="th-btn th-btn--primary" href="${config.links.discussions}">${j.soonCta}</a>
</div>`;
  }
  const hidden = Object.entries({ [f.fields.locale]: lang, ...(f.hidden ?? {}) });
  return html`<form class="th-form" method="post" action="${f.action}" data-th-form data-msg-sending="${j.sending}" data-msg-thanks="${f.doubleOptIn ? j.thanks : j.thanksSimple}" data-msg-error="${j.error}">
<label class="th-label" for="th-email">${j.label}</label>
<div class="th-form__row">
<input class="th-input" id="th-email" name="${f.fields.email}" type="email" autocomplete="email" required placeholder="${j.placeholder}">
<button class="th-btn th-btn--primary" type="submit">${j.cta}</button>
</div>
<fieldset class="th-roles">
<legend>${j.roleLegend}</legend>
${ROLES.map((role, i) => html`<label class="th-check"><input type="checkbox" name="${f.fields.role}" value="${f.roleValues[role]}" data-role="${role}"${attr('checked', i === 0 && 'checked')}>${j.roles[role]}</label>`)}
</fieldset>
<div class="th-hp" aria-hidden="true"><label>${j.honeypot}<input type="text" name="${f.fields.honeypot}" value="" tabindex="-1" autocomplete="off"></label></div>
${hidden.map(([name, value]) => html`<input type="hidden" name="${name}" value="${value}">`)}
<p class="th-status" role="status" data-th-status></p>
<p class="th-privacy">${j.privacy} <a href="${config.routes.privacy[lang]}">${j.privacyLink}</a></p>
</form>`;
}

function join(ctx) {
  const { t } = ctx;
  return html`<section class="th-section th-section--last" id="join">
<div class="th-join">
<div class="th-join__text">
<h2 class="th-h2">${t.join.title}</h2>
<p>${t.join.text}</p>
</div>
${form(ctx)}
</div>
</section>`;
}

export function home(ctx) {
  return html`${hero(ctx)}
${how(ctx)}
${mission(ctx)}
${principles(ctx)}
${who(ctx)}
${roadmap(ctx)}
${faq(ctx)}
${join(ctx)}`;
}
