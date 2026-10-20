-- Migration inverse de 0001_audit_append_only : retire les déclencheurs d'ajout seul du journal d'audit.
DROP TRIGGER IF EXISTS "audit_events_no_truncate" ON "audit_events";
--> statement-breakpoint
DROP TRIGGER IF EXISTS "audit_events_no_update_delete" ON "audit_events";
--> statement-breakpoint
DROP FUNCTION IF EXISTS "audit_events_append_only"();
