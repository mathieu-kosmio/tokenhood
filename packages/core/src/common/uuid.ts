// UUID v7 (RFC 9562) : 48 bits d'horodatage en millisecondes, puis un compteur de 12 bits qui garde l'ordre
// des identifiants créés dans la même milliseconde, puis de l'aléa. Triés comme leur date de création.
import { randomBytes, randomInt } from 'node:crypto';

// Au-delà de ce recul de l'horloge (horloge injectée, réglage système), l'ordre repart de la nouvelle date.
const MAX_CLOCK_REGRESSION_MS = 10_000;

let lastMs = -1;
let counter = 0;

export function uuidv7(clockMs: number = Date.now()): string {
  let ms = Math.floor(clockMs);
  if (ms <= lastMs && lastMs - ms <= MAX_CLOCK_REGRESSION_MS) {
    ms = lastMs;
    counter += 1;
    if (counter > 0xfff) {
      ms += 1;
      counter = 0;
    }
  } else {
    counter = randomInt(0, 0x800);
  }
  lastMs = ms;
  const b = randomBytes(16);
  for (let i = 0; i < 6; i += 1) b[i] = Math.floor(ms / 2 ** (8 * (5 - i))) & 0xff;
  b[6] = 0x70 | ((counter >> 8) & 0x0f);
  b[7] = counter & 0xff;
  b[8] = 0x80 | (b[8]! & 0x3f);
  const hex = b.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

const UUID_V7 = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export function isUuidV7(value: unknown): value is string {
  return typeof value === 'string' && UUID_V7.test(value);
}

// Horodatage (ms) porté par un UUID v7.
export function uuidv7Time(id: string): number {
  return parseInt(id.replaceAll('-', '').slice(0, 12), 16);
}
