-- Event detail nested entities (notes, emails, attachments, budget lines)

ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "budget_address" TEXT;
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "budget_contact" TEXT;
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "budget_observations" TEXT;

CREATE TABLE IF NOT EXISTS "event_notes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "kind" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "event_notes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "event_emails" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "sent_at" TEXT,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "event_emails_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "event_attachments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "category" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "storage_key" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "event_attachments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "event_budget_lines" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "units" INTEGER NOT NULL DEFAULT 0,
    "material_name" TEXT NOT NULL DEFAULT '',
    "warehouse" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT '',
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "days" INTEGER NOT NULL DEFAULT 0,
    "coef" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "event_budget_lines_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_event_notes_event_kind" ON "event_notes"("event_id", "kind");
CREATE INDEX IF NOT EXISTS "idx_event_emails_event" ON "event_emails"("event_id");
CREATE INDEX IF NOT EXISTS "idx_event_attachments_event_category" ON "event_attachments"("event_id", "category");
CREATE INDEX IF NOT EXISTS "idx_event_budget_lines_event" ON "event_budget_lines"("event_id");

ALTER TABLE "event_notes" DROP CONSTRAINT IF EXISTS "event_notes_event_id_fkey";
ALTER TABLE "event_notes" ADD CONSTRAINT "event_notes_event_id_fkey"
    FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "event_notes" DROP CONSTRAINT IF EXISTS "event_notes_tenant_id_fkey";
ALTER TABLE "event_notes" ADD CONSTRAINT "event_notes_tenant_id_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "event_emails" DROP CONSTRAINT IF EXISTS "event_emails_event_id_fkey";
ALTER TABLE "event_emails" ADD CONSTRAINT "event_emails_event_id_fkey"
    FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "event_emails" DROP CONSTRAINT IF EXISTS "event_emails_tenant_id_fkey";
ALTER TABLE "event_emails" ADD CONSTRAINT "event_emails_tenant_id_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "event_attachments" DROP CONSTRAINT IF EXISTS "event_attachments_event_id_fkey";
ALTER TABLE "event_attachments" ADD CONSTRAINT "event_attachments_event_id_fkey"
    FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "event_attachments" DROP CONSTRAINT IF EXISTS "event_attachments_tenant_id_fkey";
ALTER TABLE "event_attachments" ADD CONSTRAINT "event_attachments_tenant_id_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "event_budget_lines" DROP CONSTRAINT IF EXISTS "event_budget_lines_event_id_fkey";
ALTER TABLE "event_budget_lines" ADD CONSTRAINT "event_budget_lines_event_id_fkey"
    FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "event_budget_lines" DROP CONSTRAINT IF EXISTS "event_budget_lines_tenant_id_fkey";
ALTER TABLE "event_budget_lines" ADD CONSTRAINT "event_budget_lines_tenant_id_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
