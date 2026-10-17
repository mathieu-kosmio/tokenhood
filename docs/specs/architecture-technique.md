[Spécifications V2.1](README.md) › Module 19/28 · [English version](en/architecture-technique.md)

# Architecture technique

Un monolithe modulaire en TypeScript, une base PostgreSQL et quelques services auto-hébergés suffisent au MVP ; la sobriété prime, et aucun composant n'exécute de modèle d'IA. Cette stack est une proposition, à confirmer par la première décision `roadmap.priority` (ADR-002).

| Couche | Proposition | Justification |
| --- | --- | --- |
| Langage | TypeScript, Node.js 22 LTS, monorepo pnpm | Un seul langage du serveur MCP à l'interface ; SDK MCP officiel disponible |
| API | Fastify, schémas JSON partagés, génération OpenAPI | Performances, validation stricte |
| Serveur MCP | SDK MCP TypeScript, transport Streamable HTTP, même couche de services que l'API | Pas de logique dupliquée |
| Base de données | PostgreSQL 16, ORM Drizzle, migrations versionnées | Contraintes d'unicité pour les leases, transactions sérialisables |
| Tâches de fond | pg-boss (file dans PostgreSQL) | Pas de Redis à exploiter |
| Interface web | SvelteKit, rendu serveur, i18n ICU via FormatJS | Légère, accessible, peu de JavaScript client |
| Stockage | Objet compatible S3 (hébergeur européen ou Garage auto-hébergé) | Artefacts, conventions signées |
| Forges | GitHub App (Octokit) au MVP ; GitLab, Forgejo ensuite | Permissions minimales, webhooks |
| Signature | DocuSeal auto-hébergé (Docker), API et webhooks | Libre, sans coût de licence |
| KYB | Connecteurs : API Recherche d'entreprises, saisie justifiée pour les autres pays | Données publiques |
| Coordination (amorçage) | Instance tokenpool | Disponible immédiatement |
| Observabilité | OpenTelemetry, journaux structurés | Audit et incidents |
| Hébergement | Cloud européen, conteneurs, une région | RGPD, sobriété |

**Modules du monolithe** : `identity`, `capacity`, `selection` (KYB, instruction, contrats, signature), `projects`, `missions`, `coordination`, `verification`, `skills`, `governance`, `dashboard`, `i18n`, `notifications`, `audit`, `forge-integrations`. Chaque module expose des services internes, consommés par l'API REST, le serveur MCP et les tâches de fond.

**Organisation du dépôt `tokenhood`** : `apps/api`, `apps/mcp`, `apps/web`, `packages/core` (modules), `packages/schemas` (YAML et JSON Schema), `packages/client` (CLI et compagnon local), `skills/`, `locales/`, `docs/specs/`, `decisions/`, `.tokenhood/` (le projet s'inscrit lui-même).

---

← [Modèle de données](modele-de-donnees.md) · [Sommaire](README.md) · [Sécurité et conformité](securite-et-conformite.md) →
