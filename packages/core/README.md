# @tokenhood/core · couche métier et conventions de module

La couche métier de Tokenhood (ADR-002) : un dossier par module, des utilitaires communs, aucune dépendance à
HTTP. L'API REST (`apps/api`), le serveur MCP (lot 2) et les tâches de fond appellent les mêmes fonctions.

## Conventions de module

Un module (`identity`, `interests`, `arbitration`, `capacity`…) occupe toujours les mêmes emplacements. **Ajouter un
module ne modifie aucun fichier écrit à la main hors de ces emplacements** : rien n'est inscrit dans une liste
centrale. Seuls les fichiers générés sont communs (migrations de `packages/db/migrations/`, `pnpm-lock.yaml`).

| Quoi                   | Où                                                                             | Comment c'est trouvé                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Tables                 | `packages/db/src/schema/<module>.ts`                                           | drizzle-kit lit `src/schema/*.ts` ; le code importe `@tokenhood/db/schema/<module>`                                                 |
| Migration              | `packages/db/migrations/`                                                      | `pnpm db:generate` (drizzle-kit), jamais retouchée à la main ; régénérée après rebase si une autre migration est arrivée sur `main` |
| Règles et services     | `packages/core/src/<module>/`                                                  | importés par `@tokenhood/core/<module>` (export `./*` du paquet)                                                                    |
| Routes REST            | `apps/api/src/routes/<module>/index.ts`                                        | chargées au démarrage, un plugin Fastify par dossier (`apps/api/src/http/routes.ts`)                                                |
| Résolution de l'acteur | `apps/api/src/auth/`                                                           | session humaine (TH-102) ; jetons d'agent (TH-109)                                                                                  |
| Rubriques du compte    | `apps/web/src/routes/account/<rubrique>/`                                      | menu construit depuis chaque `rubrique.ts` (`apps/web/src/lib/account.ts`)                                                          |
| Messages               | `locales/<lang>/<module>.json`                                                 | fusionnés par `packages/i18n` ; chaque clé commence par `<module>.`                                                                 |
| Tests                  | à côté du code : `*.test.ts` (sans base), `*.integration.test.ts` (PostgreSQL) | `pnpm test`, `pnpm test:integration`                                                                                                |

Le module `identity` (TH-102) applique ces conventions : `schema/identity.ts`, `core/src/identity/`,
`routes/identity/`, `account/profile/`, `locales/<lang>/identity.json`.

## Utilitaires communs (`@tokenhood/core/common`)

Fournis une fois, hors des modules métier :

- **Identifiants** : `uuidv7()` (RFC 9562, triés par date de création) ; aucun identifiant n'est laissé à la base.
- **Pagination par curseur** : `pageLimit()` (20 par défaut, 100 au plus), `decodeCursor()`, `pageOf()` ; un curseur
  opaque désigne la dernière ligne lue ; lire `limit + 1` lignes pour savoir s'il existe une page suivante.
- **Référence de dépôt GitHub** : `parseRepository()` renvoie `github:owner/name` en minuscules, quelle que soit
  l'écriture (URL, SSH, `owner/name`), en attendant l'entité `Project`.
- **Erreurs** : `DomainError(code, statut HTTP, clé de message, valeurs, champs)` ; l'API traduit la clé selon
  `Accept-Language`. Aucune chaîne d'interface dans ce paquet.
- **Horloge** : `Clock`, injectée dans chaque service (tests datés sans attente).
- **Acteurs et autorisations** : voir plus bas.

Côté API, les conventions HTTP communes vivent dans `apps/api/src/http/` : erreurs localisées, `Idempotency-Key`
(déclarer `config: { idempotent: true }` sur chaque écriture), `ETag` et `If-Match` (`etagOf()`,
`versionFromIfMatch()`).

## Acteurs et autorisations

Toute opération est déclarée par son module avec `operation(id, accès)` et vérifiée par `authorize(acteur, opération)`
**dans la couche métier**, quelle que soit l'entrée (REST, MCP, tâche de fond).

- Par défaut, une opération est réservée aux **humains dont l'inscription est complète**. Un acteur **agent** est refusé
  tant que l'opération ne lui est pas ouverte explicitement : `operation('x.create', { agents: 'allowed' })`.
- `humans: 'registering'` ouvre une opération pendant le parcours d'inscription (profil, documents, déconnexion) ;
  tout le reste est fermé à un compte dont l'inscription est incomplète.
- `humans: 'admin'` réserve une opération au **rôle administrateur provisoire**, autorisation de gouvernance jusqu'à
  TH-104. Une opération d'administration ne s'ouvre jamais aux agents. Le rôle s'attribue par commande d'exploitation,
  sans interface, et chaque changement est audité :

  ```sh
  docker compose exec api node apps/api/dist/cli/admin.js grant <login-github>   # revoke, list
  pnpm --filter @tokenhood/api admin grant <login-github>                        # en développement
  ```

## Journal d'audit (`@tokenhood/core/audit`)

`record(tx, { actor, action, subject, data, at })` dans la même transaction que la modification. La table
`audit_events` est en ajout seul : la base refuse mise à jour, suppression et troncature (migration
`0001_audit_append_only`). Horodatage UTC, identifiant UUID v7. `data` ne porte ni secret ni donnée personnelle :
des noms de champs et des identifiants. Actions du module identity : `identity.account.created`,
`identity.profile.updated`, `identity.document.accepted`, `identity.session.revoked`, `identity.admin.granted`,
`identity.admin.revoked`.

## Tests

- `pnpm test` : sans base de données ni réseau (`pnpm check` l'exécute).
- `pnpm test:integration` : sur la base désignée par `TEST_DATABASE_URL` ; chaque fichier crée sa propre base
  éphémère (`@tokenhood/db/testing`), la migre puis la supprime. Le compte doit pouvoir créer des bases.

  ```sh
  TEST_DATABASE_URL=postgres://tokenhood:tokenhood@localhost:5432/tokenhood_test pnpm test:integration
  ```

- GitHub simulé, sans réseau : `fakeGitHub()` de `@tokenhood/core/identity/testing` (autorisation, échange du code avec
  PKCE, compte, adresses, révocation du jeton).
