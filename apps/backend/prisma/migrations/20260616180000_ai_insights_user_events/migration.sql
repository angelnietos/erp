-- AI Insights: trazabilidad por usuario y tipo de evento (dataset de entrenamiento)
ALTER TABLE "ai_insights" ADD COLUMN IF NOT EXISTS "user_id" UUID;
ALTER TABLE "ai_insights" ADD COLUMN IF NOT EXISTS "user_email" TEXT;
ALTER TABLE "ai_insights" ADD COLUMN IF NOT EXISTS "session_id" TEXT;
ALTER TABLE "ai_insights" ADD COLUMN IF NOT EXISTS "event_type" TEXT NOT NULL DEFAULT 'system';

CREATE INDEX IF NOT EXISTS "idx_ai_insights_tenant_user" ON "ai_insights"("tenant_id", "user_id");
CREATE INDEX IF NOT EXISTS "idx_ai_insights_tenant_event" ON "ai_insights"("tenant_id", "event_type");
