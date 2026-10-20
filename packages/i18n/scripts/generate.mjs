// Génère src/messages.ts depuis locales/ (racine du dépôt) : pour chaque langue, locales/<lang>.json (messages
// communs) fusionné avec locales/<lang>/<module>.json (un fichier par module, clés préfixées « <module>. »).
// Contrôles : aucune clé définie deux fois, mêmes clés dans toutes les langues, syntaxe ICU valide, mêmes
// arguments d'une langue à l'autre.
import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
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

// Clés de premier niveau d'un fichier JSON, dans l'ordre et doublons compris : JSON.parse garde la dernière
// en silence. Le texte a déjà été validé par JSON.parse.
export function keysOf(text) {
  const keys = [];
  let depth = 0;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (c === '"') {
      let j = i + 1;
      while (j < text.length && text[j] !== '"') j += text[j] === '\\' ? 2 : 1;
      let k = j + 1;
      while (/\s/.test(text[k] ?? '')) k += 1;
      if (depth === 1 && text[k] === ':') keys.push(JSON.parse(text.slice(i, j + 1)));
      i = j;
    } else if (c === '{' || c === '[') depth += 1;
    else if (c === '}' || c === ']') depth -= 1;
  }
  return keys;
}

const exists = (p) =>
  stat(p).then(
    () => true,
    () => false,
  );

// Sources de chaque langue : [{ file, text }], le fichier commun d'abord, puis les modules par ordre alphabétique.
export async function loadSources(dir = LOCALES) {
  const entries = await readdir(dir);
  const langs = new Set();
  for (const entry of entries) {
    if (/^[a-z]{2}\.json$/.test(entry)) langs.add(entry.slice(0, 2));
    else if (/^[a-z]{2}$/.test(entry) && (await stat(path.join(dir, entry))).isDirectory()) langs.add(entry);
  }
  const sources = {};
  for (const lang of [...langs].sort()) {
    const files = [];
    if (await exists(path.join(dir, `${lang}.json`))) files.push(`${lang}.json`);
    if (await exists(path.join(dir, lang)))
      for (const f of (await readdir(path.join(dir, lang))).filter((f) => f.endsWith('.json')).sort())
        files.push(`${lang}/${f}`);
    sources[lang] = [];
    for (const file of files)
      sources[lang].push({ file, text: await readFile(path.join(dir, file), 'utf8') });
  }
  return sources;
}

// Fusionne les sources d'une langue en refusant une clé définie deux fois (dans un fichier ou entre fichiers)
// et, dans locales/<lang>/<module>.json, une clé qui ne commence pas par « <module>. ».
export function merge(sources) {
  const messages = {};
  const errors = [];
  for (const [lang, files] of Object.entries(sources)) {
    const merged = {};
    const origin = {};
    for (const { file, text } of files) {
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        errors.push(`${file} : JSON invalide (${e.message})`);
        continue;
      }
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        errors.push(`${file} : un objet de messages est attendu`);
        continue;
      }
      const module = file.includes('/') ? path.basename(file, '.json') : null;
      for (const key of keysOf(text)) {
        if (origin[key] !== undefined) {
          errors.push(`${file} : clé « ${key} » déjà définie dans ${origin[key]}`);
          continue;
        }
        origin[key] = file;
        if (module && !key.startsWith(`${module}.`))
          errors.push(`${file} : la clé « ${key} » doit commencer par « ${module}. »`);
        merged[key] = parsed[key];
      }
    }
    messages[lang] = merged;
  }
  return { messages, errors };
}

export async function loadLocales(dir = LOCALES) {
  return merge(await loadSources(dir)).messages;
}

export function check(messages) {
  const errors = [];
  const langs = Object.keys(messages);
  if (!langs.includes('fr') || !langs.includes('en')) errors.push('fr et en sont obligatoires');
  // Le français est la langue source : les autres langues lui sont comparées.
  const ref = langs.includes('fr') ? 'fr' : langs[0];
  const refKeys = Object.keys(messages[ref] ?? {}).sort();
  const args = {};
  for (const lang of [ref, ...langs.filter((l) => l !== ref)]) {
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
  const merged = merge(await loadSources());
  const messages = merged.messages;
  const errors = [...merged.errors, ...check(messages)];
  if (errors.length) {
    console.error(`locales/ invalides :\n- ${errors.join('\n- ')}`);
    process.exit(1);
  }
  const body = `// Généré par scripts/generate.mjs depuis locales/. Ne pas modifier.\nexport const messages = ${JSON.stringify(messages, null, 2)} as const;\n`;
  await writeFile(OUT, body);
}
