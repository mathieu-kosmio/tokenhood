// Pictogrammes et illustration, en SVG fait main (DEC-2026-001) : trait 1,75 px,
// bouts arrondis ; la flèche or est la signature de Tokenhood.
import { html } from './html.mjs';

const picto = (paths, variant = '') => html`<svg class="th-ico${variant}" aria-hidden="true" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

export const arrowMark = (size) => html`<svg class="th-mark" aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke-width="2.25" stroke-linecap="round"><path d="M4 20L20 4M20 4h-7M20 4v7M4 20h4M4 20v-4"/></svg>`;

const swapPaths = html`<path d="M4 7h14M15 4l3 3-3 3M20 17H6M9 14l-3 3 3 3"/>`;

export const swapSmall = (size) => html`<svg class="th-ico th-ico--or" aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round">${swapPaths}</svg>`;

export const principleIcons = [
  picto(html`<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>`),
  picto(swapPaths, ' th-ico--or'),
  picto(html`<path d="M12 3l6 9H6z"/><path d="M12 9l7 10H5z"/><path d="M12 19v2"/>`),
  picto(html`<rect x="4" y="7" width="16" height="12" rx="5"/><path d="M12 3v4M9 12h.01M15 12h.01M9.5 15.5c1.4 1 3.6 1 5 0"/>`),
];

// overlay : éléments ajoutés par-dessus l'illustration (compteur public).
export const heroArt = (label, overlay = '') => html`<svg class="th-hero__svg" role="img" aria-label="${label}" viewBox="0 0 480 480"><rect width="480" height="480" rx="24" fill="#0A3B38"/><g fill="none" stroke-width="1.5"><ellipse cx="320" cy="170" rx="34" ry="30" stroke="#6BAED6"/><ellipse cx="322" cy="168" rx="64" ry="56" stroke="#6BAED6" opacity="0.8"/><ellipse cx="318" cy="172" rx="96" ry="84" stroke="#6BAED6" opacity="0.6"/><ellipse cx="324" cy="166" rx="130" ry="114" stroke="#2A7A71"/><ellipse cx="320" cy="170" rx="166" ry="146" stroke="#2A7A71" opacity="0.8"/><ellipse cx="316" cy="174" rx="204" ry="180" stroke="#2A7A71" opacity="0.6"/><ellipse cx="322" cy="168" rx="244" ry="214" stroke="#2A7A71" opacity="0.4"/></g><g stroke="#E8A33D" stroke-width="4.5" stroke-linecap="round" fill="none"><path d="M64 416L320 170"/><path d="M320 170l-30 5M320 170l-7 29"/><path d="M64 416l18-3M64 416l-3-18M80 401l18-3M80 401l-3-18"/></g><circle cx="320" cy="170" r="6" fill="#E8A33D"/>${overlay}</svg>`;
