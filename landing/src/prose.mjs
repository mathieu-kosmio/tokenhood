// Pages de texte : mentions légales, confidentialité, page introuvable.
import { html, esc, raw } from './html.mjs';

// Rend cliquables les adresses e-mail et les URL d'un texte de locale.
const LINK = /(https?:\/\/[^\s]+?)(?=[.,;:!?)]*(?:\s|$))|([\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g;

export function linkify(text) {
  let out = '';
  let last = 0;
  for (const m of text.matchAll(LINK)) {
    out += esc(text.slice(last, m.index));
    const href = m[1] ?? `mailto:${m[2]}`;
    out += `<a href="${esc(href)}">${esc(m[0])}</a>`;
    last = m.index + m[0].length;
  }
  return raw(out + esc(text.slice(last)));
}

export function prose(doc) {
  return html`<article class="th-prose">
<p class="th-eyebrow">${doc.eyebrow}</p>
<h1 class="th-prose__title">${doc.title}</h1>
<p class="th-prose__intro">${linkify(doc.intro)}</p>
${doc.sections.map((s) => html`<section>
<h2>${s.title}</h2>
${s.rows.length ? html`<dl class="th-rows">${s.rows.map((r) => html`<div><dt>${r.label}</dt><dd>${linkify(r.value)}</dd></div>`)}</dl>` : ''}
${s.paragraphs.map((p) => html`<p>${linkify(p)}</p>`)}
</section>`)}
<p class="th-prose__updated">${doc.updated}</p>
</article>`;
}

// Page 404 bilingue : servie pour toute URL inconnue, quelle que soit la langue.
export function notFound(ctxs) {
  return html`<div class="th-prose th-notfound">
${ctxs.map((ctx) => html`<section lang="${ctx.lang}">
<h1 class="th-prose__title">${ctx.t.notFound.title}</h1>
<p>${ctx.t.notFound.text}</p>
<p><a class="th-btn th-btn--outline" href="${ctx.config.routes.home[ctx.lang]}">${ctx.t.notFound.back}</a></p>
</section>`)}
</div>`;
}
