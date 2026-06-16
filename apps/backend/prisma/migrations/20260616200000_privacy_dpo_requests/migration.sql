-- Cola DPO: solicitudes de derechos RGPD (supresión, exportación, revisión)
CREATE TABLE IF NOT EXISTS "privacy_requests" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id" UUID NOT NULL,
  "requester_user_id" UUID NOT NULL,
  "type" VARCHAR(64) NOT NULL,
  "status" VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  "subject_type" VARCHAR(32),
  "subject_id" UUID,
  "user_message" TEXT,
  "dpo_notes" TEXT,
  "legal_hold" JSONB,
  "reviewed_by_user_id" UUID,
  "reviewed_at" TIMESTAMP(3),
  "completed_at" TIMESTAMP(3),
  "result_summary" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "privacy_requests_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "privacy_requests_tenant_id_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_privacy_requests_tenant_status"
  ON "privacy_requests" ("tenant_id", "status", "created_at" DESC);
