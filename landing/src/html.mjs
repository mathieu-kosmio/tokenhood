// Gabarit HTML minimal : toute valeur interpolée est échappée, sauf si elle est
// déjà du HTML produit par `html` ou explicitement marquée par `raw`.

class Raw {
  constructor(value) {
    this.value = value;
  }
  toString() {
    return this.value;
  }
}

const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function esc(value) {
  return String(value).replace(/[&<>"']/g, (c) => ENTITIES[c]);
}

export function raw(value) {
  return new Raw(String(value));
}

function render(value) {
  if (value === null || value === undefined || value === false) return '';
  if (value instanceof Raw) return value.value;
  if (Array.isArray(value)) return value.map(render).join('');
  if (typeof value === 'string' || typeof value === 'number') return esc(value);
  throw new TypeError(`Valeur non interpolable dans le gabarit : ${typeof value}`);
}

export function html(strings, ...values) {
  let out = strings[0];
  for (let i = 0; i < values.length; i++) out += render(values[i]) + strings[i + 1];
  return new Raw(out);
}

// Attribut booléen ou absent : attr('aria-current', cond && 'page')
export function attr(name, value) {
  if (value === null || value === undefined || value === false) return raw('');
  return raw(` ${name}="${esc(value)}"`);
}
