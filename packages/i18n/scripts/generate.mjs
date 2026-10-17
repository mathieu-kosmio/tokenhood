// Génère src/messages.ts depuis locales/<lang>.json (racine du dépôt), après contrôle :
// mêmes clés dans toutes les langues, syntaxe ICU valide, mêmes arguments d'une langue à l'autre.
import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, TYPE } from '@formatjs/icu-messageformat-parser';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LOCALES = path.resolve(HERE, '../../../locales');
const OUT = path.resolve(HERE, '../src/messages.ts');

function argumentsOf(elements, found = new Set()) {
  for (const el of elements) {
    if (
      el.type === TYPE.argument ||
      el.type === TYPE.number ||
      el.type === TYPE.date ||
      el.type === TYPE.time
    )
      found.add(el.value);
    if (el.type === TYPE.plural || el.type === TYPE.select) {
      found.add(el.value);
      for (const option of Object.values(el.options)) argumentsOf(option.value, found);
    }
    if (el.type === TYPE.tag) argumentsOf(el.children, found);
  }
  return found;
}

export async function loadLocales() {
  const files = (await readdir(LOCALES)).filter((f) => /^[a-z]{2}\.json$/.test(f)).sort();
  const messages = {};
  for (const file of files)
    messages[file.slice(0, 2)] = JSON.parse(await readFile(path.join(LOCALES, file), 'utf8'));
  return messages;
}

export function check(messages) {
  const errors = [];
  const langs = Object.keys(messages);
  if (!langs.includes('fr') || !langs.includes('en')) errors.push('fr et en sont obligatoires');
  const [ref] = langs;
  const refKeys = Object.keys(messages[ref] ?? {}).sort();
  const args = {};
  for (const lang of langs) {
    const keys = Object.keys(messages[lang]).sort();
    for (const k of refKeys.filter((k) => !keys.includes(k))) errors.push(`${lang} : clé manquante « ${k} »`);
    for (const k of keys.filter((k) => !refKeys.includes(k))) errors.push(`${lang} : clé en trop « ${k} »`);
    for (const [key, value] of Object.entries(messages[lang])) {
      if (typeof value !== 'string' || !value.trim()) {
        errors.push(`${lang} : « ${key} » doit être une chaîne non vide`);
        continue;
      }
      try {
        const found = [...argumentsOf(parse(value))].sort().join(',');
        args[key] ??= { lang, found };
        if (args[key].found !== found)
          errors.push(
            `${lang} : « ${key} » utilise {${found}} au lieu de {${args[key].found}} (${args[key].lang})`,
          );
      } catch (e) {
        errors.push(`${lang} : « ${key} » n'est pas un message ICU valide (${e.message})`);
      }
    }
  }
  return errors;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const messages = await loadLocales();
  const errors = check(messages);
  if (errors.length) {
    console.error(`locales/ invalides :\n- ${errors.join('\n- ')}`);
    process.exit(1);
  }
  const body = `// Généré par scripts/generate.mjs depuis locales/*.json. Ne pas modifier.\nexport const messages = ${JSON.stringify(messages, null, 2)} as const;\n`;
  await writeFile(OUT, body);
}
