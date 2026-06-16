-- ISO 27001 A.8.15 / RGPD art. 30 — trazabilidad reforzada en audit_logs
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "tenant_id" UUID;
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "ip_address" VARCHAR(45);
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "user_agent" VARCHAR(512);

CREATE INDEX IF NOT EXISTS "audit_logs_tenant_id_created_at_idx"
  ON "audit_logs" ("tenant_id", "created_at" DESC);
