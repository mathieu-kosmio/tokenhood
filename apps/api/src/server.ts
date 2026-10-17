// Point d'entrée du service api : écoute, arrêt propre sur SIGTERM (Coolify, Docker).
import { buildApp } from './app.js';

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? '0.0.0.0';

const app = await buildApp({ logger: { level: process.env.LOG_LEVEL ?? 'info' } });

for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.once(signal, async () => {
    app.log.info({ signal }, 'arrêt demandé');
    await app.close();
    process.exit(0);
  });
}

await app.listen({ port, host });
