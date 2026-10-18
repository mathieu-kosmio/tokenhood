// Mesure les tokens d'une session Claude Code à partir de sa transcription locale
// (~/.claude/projects/<dossier>/<session>.jsonl), pour remplir un rapport de consommation.
//
//   node tools/usage/claude-code.mjs --transcript <fichier.jsonl>
//        [--since ISO] [--until ISO] [--exclude ISO/ISO ...]
//        [--mission TH-xxx ...] [--kind production] [--contributor login] [--pr 12 ...]
//
// Sans --mission : affiche le décompte en JSON. Avec --mission : produit un rapport YAML
// conforme à schemas/usage-report.schema.json, à enregistrer dans .tokenhood/usage/.
//
// Une réponse est souvent écrite sur plusieurs lignes portant le même compteur : chaque
// message est compté une seule fois (identifiant du message, dernière valeur lue).
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export function parseArgs(argv) {
  const opts = { exclude: [], mission: [], pr: [] };
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i].replace(/^--/, '');
    const value = argv[i + 1];
    if (['exclude', 'mission', 'pr'].includes(key)) opts[key].push(value);
    else opts[key] = value;
    i++;
  }
  return opts;
}

const inWindow = (ts, { since, until, exclude = [] }) => {
  if (since && ts < since) return false;
  if (until && ts >= until) return false;
  return !exclude.some((range) => {
    const [from, to] = range.split('/');
    return ts >= from && ts < to;
  });
};

// Additionne les tokens des messages d'assistant d'une transcription, dans la fenêtre donnée.
export function measure(text, window = {}) {
  const messages = new Map();
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    let entry;
    try {
      entry = JSON.parse(line);
    } catch {
      continue;
    }
    const message = entry.message;
    const usage = message?.usage;
    if (entry.type !== 'assistant' || !usage || !entry.timestamp) continue;
    const id = message.id ?? entry.uuid;
    const first = messages.get(id)?.timestamp ?? entry.timestamp;
    messages.set(id, { timestamp: first, usage, model: message.model, version: entry.version });
  }
  const tokens = { input: 0, output: 0, cache_creation: 0, cache_read: 0 };
  const models = new Set();
  const versions = new Set();
  let start = null;
  let end = null;
  let count = 0;
  for (const { timestamp, usage, model, version } of messages.values()) {
    if (!inWindow(timestamp, window)) continue;
    count++;
    tokens.input += usage.input_tokens ?? 0;
    tokens.output += usage.output_tokens ?? 0;
    tokens.cache_creation += usage.cache_creation_input_tokens ?? 0;
    tokens.cache_read += usage.cache_read_input_tokens ?? 0;
    if (model && !model.startsWith('<')) models.add(model);
    if (version) versions.add(version);
    if (!start || timestamp < start) start = timestamp;
    if (!end || timestamp > end) end = timestamp;
  }
  return {
    messages: count,
    tokens,
    counted: tokens.input + tokens.cache_creation + tokens.output,
    period: { start, end },
    models: [...models].sort(),
    client_versions: [...versions].sort(),
  };
}

const quote = (s) => JSON.stringify(s);

export function toReport(result, { mission, kind = 'production', contributor, pr = [], note }) {
  const model = result.models.at(-1);
  return [
    'schema_version: "2.1"',
    `missions: [${mission.join(', ')}]`,
    'contribution:',
    `  kind: ${kind}`,
    ...(pr.length ? [`  pull_requests: [${pr.join(', ')}]`] : []),
    `contributor: ${contributor}`,
    'agent:',
    '  client: claude-code',
    ...(result.client_versions.length ? [`  client_version: ${quote(result.client_versions.at(-1))}`] : []),
    '  model_family: claude',
    ...(model ? [`  model: ${model}`] : []),
    'period:',
    `  start: ${quote(result.period.start)}`,
    `  end: ${quote(result.period.end)}`,
    'tokens:',
    `  input: ${result.tokens.input}`,
    `  output: ${result.tokens.output}`,
    `  cache_creation: ${result.tokens.cache_creation}`,
    `  cache_read: ${result.tokens.cache_read}`,
    `counted: ${result.counted}`,
    'method: client_transcript',
    'nature: declared',
    `evidence: ${quote(`Transcription Claude Code de la session, ${result.messages} réponses comptées une fois chacune (tools/usage/claude-code.mjs).`)}`,
    ...(note ? [`notes: ${quote(note)}`] : []),
    '',
  ].join('\n');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.transcript) {
    console.error('Usage : node tools/usage/claude-code.mjs --transcript <fichier.jsonl> [--since ISO] [--until ISO] [--exclude ISO/ISO] [--mission TH-xxx --contributor login]');
    process.exit(2);
  }
  const result = measure(await readFile(path.resolve(opts.transcript), 'utf8'), opts);
  if (opts.mission.length) {
    if (!opts.contributor) throw new Error('--contributor est requis avec --mission');
    process.stdout.write(toReport(result, opts));
  } else {
    console.log(JSON.stringify(result, null, 2));
  }
}

