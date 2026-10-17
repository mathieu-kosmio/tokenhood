// Serveur de prévisualisation locale de dist/, sans dépendance.
// Reproduit le comportement utile de nginx.conf : index de dossier, 404.html.
// Usage : npm run build && npm run serve   (PORT=4173 par défaut)
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const PORT = Number(process.env.PORT ?? 4173);
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
};

async function resolve(urlPath) {
  const file = path.join(DIST, path.normalize(decodeURIComponent(urlPath)));
  if (!file.startsWith(DIST)) return null;
  try {
    const info = await stat(file);
    return info.isDirectory() ? resolve(path.posix.join(urlPath, 'index.html')) : file;
  } catch {
    return null;
  }
}

createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');
  if (pathname === '/healthz') return res.writeHead(200, { 'content-type': 'text/plain' }).end('ok\n');
  const file = await resolve(pathname);
  const status = file ? 200 : 404;
  const target = file ?? path.join(DIST, '404.html');
  res.writeHead(status, { 'content-type': TYPES[path.extname(target)] ?? 'application/octet-stream' });
  res.end(await readFile(target));
}).listen(PORT, () => console.log(`Landing servie sur http://localhost:${PORT}`));
