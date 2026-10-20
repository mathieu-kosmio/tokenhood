// Point d'entrée du service api : configuration par l'environnement, écoute, arrêt propre sur SIGTERM
// (Coolify, Docker).
import { connect } from '@tokenhood/db';
import { buildApp } from './app.js';
import { configFromEnv } from './config.js';

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? '0.0.0.0';

const config = configFromEnv(process.env);
const connection = process.env.DATABASE_URL ? connect(process.env.DATABASE_URL) : null;
const app = await buildApp({
  logger: { level: process.env.LOG_LEVEL ?? 'info' },
  db: connection?.db ?? null,
  config,
});

if (!connection) app.log.warn('DATABASE_URL absente : identité et données indisponibles');
if (!config.auth)
  app.log.warn(
    'connexion GitHub indisponible : GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET ou SESSION_SECRET (32 caractères ou plus) absents',
  );

for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.once(signal, async () => {
    app.log.info({ signal }, 'arrêt demandé');
    await app.close();
    await connection?.close();
    process.exit(0);
  });
}

await app.listen({ port, host });
