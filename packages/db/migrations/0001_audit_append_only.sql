-- Journal d'audit en ajout seul (TH-102) : la base refuse toute mise à jour, suppression ou troncature
-- de audit_events venue d'une requête. Le propriétaire de la table (aujourd'hui le compte de l'application)
-- peut retirer les déclencheurs : protection contre l'erreur, pas contre la compromission de ce compte.
-- Migration personnalisée créée par drizzle-kit generate --custom : les déclencheurs n'ont pas d'équivalent
-- dans le schéma Drizzle.
CREATE FUNCTION "audit_events_append_only"() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'audit_events est en ajout seul : % refusé', TG_OP USING ERRCODE = 'insufficient_privilege';
END;
$$;
--> statement-breakpoint
CREATE TRIGGER "audit_events_no_update_delete" BEFORE UPDATE OR DELETE ON "audit_events" FOR EACH ROW EXECUTE FUNCTION "audit_events_append_only"();
--> statement-breakpoint
CREATE TRIGGER "audit_events_no_truncate" BEFORE TRUNCATE ON "audit_events" FOR EACH STATEMENT EXECUTE FUNCTION "audit_events_append_only"();
