# ADR-002 · Stack technique et découpage des services

- Type : `architecture.choice`, catégorie 2
- Instruction : TH-007, `decisions/ADR-002-dossier-options.md`
- Statut : **proposée**. Adoptée par le porteur à la fusion de la PR qui l'introduit ; la date de fusion fait foi. Recours possible en gouvernance.

## Décision proposée

Option A du dossier : monolithe modulaire TypeScript, plusieurs services issus d'une même image.

| Couche | Choix |
|---|---|
| Langage | TypeScript strict, Node.js 22 LTS, modules ES, monorepo pnpm |
| API | Fastify, schémas TypeBox partagés, OpenAPI 3.1 généré |
| Serveur MCP | SDK MCP TypeScript, transport Streamable HTTP, ajouté avec TH-112 |
| Interface web | SvelteKit, rendu serveur, `adapter-node` |
| i18n | ICU MessageFormat via `intl-messageformat`, `locales/fr` et `locales/en` |
| Données | PostgreSQL 16, Drizzle ORM et drizzle-kit (migrations versionnées) |
| Tâches de fond | pg-boss |
| Tests et qualité | Vitest, ESLint, Prettier, `tsc --noEmit` |
| Organisation | `apps/api`, `apps/web`, `apps/mcp`, `packages/core`, `packages/db`, `packages/i18n`, `packages/schemas` |
| Déploiement | Coolify, une ressource Docker Compose par environnement ; une image multi-étapes ; service `migrate` à exécution unique ; PostgreSQL et S3 sur le réseau interne ; domaines `api.`, `app.`, `mcp.` |

## Conséquences

- TH-013 (image et compose), TH-015 (CI et scans) et TH-101 (squelette du monorepo) peuvent démarrer.
- Les versions exactes sont épinglées par TH-101 ; si l'outillage Svelte ne suit pas TypeScript 7, le dépôt reste sur TypeScript 5.9.
- La landing (`landing/`, DEC-2026-003) reste un site statique indépendant ; elle pourra rejoindre `apps/web` plus tard.
- Aucun SDK de fournisseur de LLM n'entre dans le monorepo ; TH-015 le contrôle en CI.
