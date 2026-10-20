# @tokenhood/db · schéma, migrations, retour arrière

PostgreSQL 16 avec Drizzle ORM (ADR-002). Un fichier de schéma par module (`src/schema/<module>.ts`), des migrations
SQL versionnées produites par drizzle-kit (`migrations/`), une commande qui les applique et une qui revient en
arrière. Conventions de module : `packages/core/README.md`.

## Commandes

```sh
pnpm db:generate                 # nouvelle migration après une modification de src/schema/ (drizzle-kit generate)
DATABASE_URL=… pnpm db:migrate   # applique les migrations en attente
DATABASE_URL=… pnpm db:rollback  # retire la dernière migration appliquée (migration inverse)
```

Dans l'image : `node packages/db/dist/migrate.js` (service `migrate` du compose) et `node packages/db/dist/rollback.js`.

- **Rejouable** : une base à jour reste inchangée (journal `drizzle.__drizzle_migrations`). Un verrou consultatif
  empêche deux exécutions simultanées.
- **Service `migrate`** : exécution unique à chaque déploiement, avant `api` et `web`
  (`condition: service_completed_successfully`). Un échec bloque le démarrage de la nouvelle version.
- drizzle-kit ne sert qu'à **générer** : jamais de `push` ni d'introspection sur une base réelle.
- Une migration personnalisée (déclencheurs, fonctions) se crée par `pnpm --filter @tokenhood/db exec drizzle-kit
generate --custom --name <nom>`, puis son SQL s'écrit dans le fichier créé (cas de `0001_audit_append_only`).

## Schéma `exploitation`

Le schéma `exploitation` (témoin de restauration du runbook Coolify, `docs/exploitation/runbook-coolify.md`) reste
hors de l'application : drizzle-kit ne lit que `public` (`schemaFilter`), aucune migration ni migration inverse ne le
nomme, et aucune n'exécute `DROP SCHEMA`. Le test `src/migrations.test.ts` le vérifie sur le SQL, le test
d'intégration sur une base réelle où le témoin existe.

## Retour arrière

1. **Migration inverse** (cas courant) : `migrations/down/<tag>.sql`, écrite à la main avec la migration, qui défait
   exactement ses changements. `pnpm db:rollback` l'exécute dans une transaction et retire la migration du journal ;
   on la relance pour remonter d'une migration de plus. Les migrations de TH-102 (`0000_foundation`,
   `0001_audit_append_only`) ont la leur. Une migration inverse supprime des données (tables du socle, journal
   d'audit compris) : en production, sauvegarde d'abord (runbook Coolify, section sauvegardes).
2. **Sans migration inverse**, la commande refuse. Deux procédures :
   - corriger vers l'avant : une nouvelle migration qui rétablit l'état voulu (préférable dès que des données
     réelles existent) ;
   - restaurer la sauvegarde prise avant le déploiement (runbook Coolify, essai de restauration), puis redéployer la
     version précédente de l'image.
3. Après un retour arrière, redéployer la version de l'image qui correspond au schéma : une version plus récente de
   l'API attend les tables retirées.
