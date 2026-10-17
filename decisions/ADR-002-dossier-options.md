# ADR-002 · Dossier d'options : stack technique et découpage des services

- Mission : TH-007 (`governance.instruction`)
- Date : 2026-10-18
- Statut : instruction terminée, aucune décision prise par l'agent. La décision est consignée dans `ADR-002-stack.md`.
- Sources : `docs/specs/architecture-technique.md`, `docs/specs/api-et-mcp.md`, `docs/specs/modele-de-donnees.md`, `docs/specs/non-code-et-i18n.md`, `docs/specs/plan-de-developpement.md` (section Infrastructure Coolify), `docs/specs/etude-de-faisabilite.md`.

## Ce qu'il faut trancher

1. Le langage et les cadres de l'API, du serveur MCP et de l'interface web.
2. Le découpage en services déployés sur Coolify : combien de conteneurs, construits comme, migrés quand.
3. Les outils transverses : base de données et migrations, tâches de fond, i18n, tests, qualité.

## Contraintes qui pèsent sur le choix

| Contrainte | Source | Effet |
|---|---|---|
| Aucun appel à un fournisseur de LLM côté serveur | Principes, `securite-et-conformite.md` | Interdit les SDK de fournisseurs ; TH-015 le contrôle en CI |
| Même couche de services pour l'API REST et le serveur MCP | `api-et-mcp.md` | Logique métier dans un paquet partagé, pas dans les applications |
| Transport MCP Streamable HTTP, outils typés | `api-et-mcp.md` | SDK MCP officiel nécessaire |
| Réservations atomiques, générations, unicité partielle | `coordination.md`, `modele-de-donnees.md` | PostgreSQL, transactions sérialisables, contraintes d'unicité |
| ICU MessageFormat, parité FR/EN, aucune chaîne en dur | `non-code-et-i18n.md` | Bibliothèque ICU côté web et côté API (messages d'erreur) |
| Une machine Coolify pour staging et production, Docker Compose depuis le dépôt | `plan-de-developpement.md` | Une image, plusieurs commandes ; healthchecks et migrations avant démarrage |
| Deux vérificateurs TypeScript au cercle de départ | Porte du lot 0 | Un seul langage limite la file de revue |
| Sobriété | Principes | Pas de Redis, pas d'orchestrateur, peu de JavaScript côté client |

## Options

### Option A · Monolithe modulaire TypeScript, trois services issus d'une image (proposition de la spécification)

- **Langage** : TypeScript strict, Node.js 22 LTS, monorepo pnpm.
- **Applications** : `apps/api` (Fastify, schémas TypeBox partagés, OpenAPI 3.1 généré), `apps/mcp` (SDK MCP TypeScript, Streamable HTTP), `apps/web` (SvelteKit, rendu serveur, `adapter-node`).
- **Paquets** : `packages/core` (modules métier), `packages/db` (Drizzle, migrations), `packages/i18n` (messages ICU via `intl-messageformat`), `packages/schemas`.
- **Données et tâches** : PostgreSQL 16, Drizzle ORM et drizzle-kit, pg-boss pour les tâches de fond.
- **Qualité** : Vitest, ESLint et Prettier (support Svelte), `tsc --noEmit`.
- **Coolify** : une ressource Docker Compose par environnement. Une image multi-étapes, trois services (`api`, `web`, `mcp`) lancés avec des commandes différentes, un service `migrate` à exécution unique dont dépendent les autres, PostgreSQL et stockage S3 (Garage) sur le réseau interne. Domaines `api.`, `app.`, `mcp.` par service. Le service `mcp` n'est ajouté qu'avec les premiers outils MCP (TH-112).
- **Effort d'amorçage** : TH-013 (M), TH-015 (M), TH-101 (M) ; environ 600 000 à 1 200 000 tokens-équivalents pour un socle déployable.
- **Forces** : conforme à la spécification ; les trois entrées passent par `packages/core`, ce qui empêche la duplication ; chaque service peut redémarrer ou monter en charge seul ; une panne du serveur MCP n'emporte pas l'interface.
- **Faiblesses** : trois conteneurs Node à surveiller (environ 3 × 80 Mo de mémoire au repos) ; compose plus long à lire ; trois domaines à déclarer.

### Option B · Même code, un seul processus Node

- Mêmes langage, paquets et outils que l'option A.
- **Différence** : un seul serveur Fastify héberge l'API (`/v1`), le serveur MCP (`/mcp`) et l'interface SvelteKit (gestionnaire `adapter-node` monté dans Fastify).
- **Coolify** : une application (Dockerfile) ou un compose à un service applicatif, plus PostgreSQL et S3 ; un seul domaine, les chemins séparent les usages.
- **Effort d'amorçage** : TH-013 (S), TH-015 (M), TH-101 (M) ; environ 450 000 à 900 000 tokens-équivalents.
- **Forces** : le plus sobre à exploiter ; un seul healthcheck ; aucune configuration CORS.
- **Faiblesses** : un pic d'appels MCP ralentit l'interface ; un plantage coupe tout ; le passage à l'option A plus tard coûte une mission M (séparer les points d'entrée, revoir le compose et les domaines) ; s'écarte du plan de domaines (`app.`, `api.`, `mcp.`) déjà annoncé.

### Option C · Python (FastAPI, SDK MCP Python, gabarits serveur et HTMX)

- **Coolify** : équivalent à l'option A (image unique, compose).
- **Effort d'amorçage** : comparable à l'option A ; un surcoût de 1 à 2 missions M pour l'i18n ICU côté gabarits et la génération des types clients.
- **Forces** : SDK MCP officiel disponible ; écosystème données solide.
- **Faiblesses** : contredit la spécification et le cercle de départ (vérificateurs TypeScript) ; la landing et l'outillage existants (`tools/validate`) sont en JavaScript ; deux langages dès que le compagnon local (TH-207, Node) arrive.

## Comparaison

| Critère | A | B | C |
|---|---|---|---|
| Conformité à la spécification | Totale | Partielle (domaines, isolation) | Faible |
| Effort d'amorçage (tokens-équivalents) | 0,6 à 1,2 M | 0,45 à 0,9 M | 0,8 à 1,5 M |
| Conteneurs applicatifs | 2 puis 3 | 1 | 2 puis 3 |
| Isolation MCP / interface | Oui | Non | Oui |
| Compatibilité Coolify | Compose, une image, migrations en service unique | Dockerfile ou compose minimal | Compose, une image |
| File de revue | TypeScript seul | TypeScript seul | Python et JavaScript |
| Réversibilité | Fusionner en B reste simple | Séparer en A coûte une mission M | Changement de langage coûteux |

## Points de vigilance, quelle que soit l'option

- **Versions** : à la date du dossier, TypeScript 7 (compilateur natif), SvelteKit 3, Vitest 5 et pnpm 12 sont les dernières versions majeures. TH-101 doit épingler des versions exactes et vérifier que l'outillage Svelte suit TypeScript 7 ; sinon, rester sur TypeScript 5.9 jusqu'à ce qu'il suive.
- **Migrations** : jamais au démarrage de chaque réplique ; un service unique, puis les applications (`depends_on: service_completed_successfully`).
- **Prévisualisations de PR** : Coolify les gère pour les applications ; pour une ressource Compose, prévoir le staging comme environnement de recette et des prévisualisations limitées à `web`.
- **Contrôle d'absence de SDK de LLM** : liste de paquets interdits vérifiée en CI (TH-015) sur tous les `package.json` du monorepo.

## Recommandation de l'instruction

Option A, conforme à la spécification, en démarrant avec deux services applicatifs (`api`, `web`) et en ajoutant `mcp` avec TH-112. Elle coûte un peu plus que B à l'amorçage mais évite une mission de séparation plus tard et garde l'interface à l'abri des pics MCP. La décision appartient aux mainteneurs compétents (catégorie 2).

---

**EN summary** · Three options were assessed for ADR-002. A: modular TypeScript monolith, pnpm monorepo, Fastify API, TypeScript MCP SDK, SvelteKit web, PostgreSQL with Drizzle and pg-boss, one image running several services in a Coolify Docker Compose resource (spec proposal). B: same code in a single Node process. C: Python stack. The instruction recommends A, starting with `api` and `web` and adding `mcp` with TH-112. No decision is taken by the agent.
