// Chargement des modules de routes sans liste centrale : chaque dossier apps/api/src/routes/<module>/ exporte par
// défaut un plugin Fastify depuis son index. Ajouter un module, c'est ajouter son dossier.
import { existsSync, readdirSync } from 'node:fs';
import type { FastifyInstance, FastifyPluginAsync } from 'fastify';

export const ROUTES_DIR = new URL('../routes/', import.meta.url);

export async function loadRouteModules(app: FastifyInstance, dir: URL = ROUTES_DIR): Promise<string[]> {
  const modules = readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const loaded: string[] = [];
  for (const name of modules) {
    // Sources (.ts) en développement et en test, compilées (.js) dans l'image.
    const file = ['index.ts', 'index.js']
      .map((f) => new URL(`${name}/${f}`, dir))
      .find((url) => existsSync(url));
    if (!file) continue;
    const mod = (await import(file.href)) as { default?: FastifyPluginAsync };
    if (typeof mod.default !== 'function')
      throw new Error(`routes/${name} : aucun plugin exporté par défaut`);
    await app.register(mod.default);
    loaded.push(name);
  }
  return loaded;
}
