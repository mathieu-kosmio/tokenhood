-- Migration inverse de 0000_foundation : supprime les tables du socle (identité, audit, idempotence) et
-- leurs données. Le schéma exploitation et le schéma drizzle ne sont pas touchés.
DROP TABLE IF EXISTS "document_acceptances";
--> statement-breakpoint
DROP TABLE IF EXISTS "identities";
--> statement-breakpoint
DROP TABLE IF EXISTS "sessions";
--> statement-breakpoint
DROP TABLE IF EXISTS "oauth_states";
--> statement-breakpoint
DROP TABLE IF EXISTS "users";
--> statement-breakpoint
DROP TABLE IF EXISTS "idempotency_keys";
--> statement-breakpoint
DROP TABLE IF EXISTS "audit_events";
