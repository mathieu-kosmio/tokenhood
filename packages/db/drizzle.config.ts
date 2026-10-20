// drizzle-kit : une migration SQL versionnée par changement des fichiers src/schema/<module>.ts.
// pnpm --filter @tokenhood/db db:generate (jamais de push ni d'introspection sur une base réelle).
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema/*.ts',
  out: './migrations',
  // Le schéma exploitation (témoin de restauration du runbook Coolify) reste hors de l'application.
  schemaFilter: ['public'],
  strict: true,
  verbose: true,
});
