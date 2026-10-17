[V2.1 specifications](../README.md) › Module 19/28 · [Version française](../architecture-technique.md)\
*Translation of the French source (translation status: `machine`, pending review).*

# Technical architecture

A modular monolith in TypeScript, a PostgreSQL database and a few self-hosted services are enough for the MVP; sobriety comes first, and no component runs an AI model. This stack is a proposal, to be confirmed by the first `roadmap.priority` decision (ADR-002).

| Layer | Proposal | Rationale |
| --- | --- | --- |
| Language | TypeScript, Node.js 22 LTS, pnpm monorepo | A single language from the MCP server to the interface; official MCP SDK available |
| API | Fastify, shared JSON schemas, OpenAPI generation | Performance, strict validation |
| MCP server | TypeScript MCP SDK, Streamable HTTP transport, same service layer as the API | No duplicated logic |
| Database | PostgreSQL 16, Drizzle ORM, versioned migrations | Uniqueness constraints for leases, serialisable transactions |
| Background jobs | pg-boss (queue in PostgreSQL) | No Redis to operate |
| Web interface | SvelteKit, server-side rendering, ICU i18n via FormatJS | Lightweight, accessible, little client-side JavaScript |
| Storage | S3-compatible object storage (European host or self-hosted Garage) | Artefacts, signed agreements |
| Forges | GitHub App (Octokit) in the MVP; GitLab, Forgejo afterwards | Minimal permissions, webhooks |
| Signature | Self-hosted DocuSeal (Docker), API and webhooks | Free software, no licence cost |
| KYB | Connectors: API Recherche d'entreprises, documented manual entry for other countries | Public data |
| Coordination (bootstrap) | tokenpool instance | Immediately available |
| Observability | OpenTelemetry, structured logs | Audit and incidents |
| Hosting | European cloud, containers, one region | GDPR, sobriety |

**Modules of the monolith**: `identity`, `capacity`, `selection` (KYB, assessment, contracts, signature), `projects`, `missions`, `coordination`, `verification`, `skills`, `governance`, `dashboard`, `i18n`, `notifications`, `audit`, `forge-integrations`. Each module exposes internal services, consumed by the REST API, the MCP server and the background jobs.

**Organisation of the `tokenhood` repository**: `apps/api`, `apps/mcp`, `apps/web`, `packages/core` (modules), `packages/schemas` (YAML and JSON Schema), `packages/client` (CLI and local companion), `skills/`, `locales/`, `docs/specs/`, `decisions/`, `.tokenhood/` (the project registers itself).

---

← [Data model](modele-de-donnees.md) · [Contents](../README.md) · [Security and compliance](securite-et-conformite.md) →
