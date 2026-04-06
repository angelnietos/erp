-- Fase 4: recibos ERP, eventos de dominio, webhooks de integración

CREATE TABLE "erp_receipts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "payment_method" TEXT,
    "payment_date" TIMESTAMP(3),
    "due_date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "erp_receipts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_erp_receipts_tenant_status" ON "erp_receipts"("tenant_id", "status");
CREATE INDEX "idx_erp_receipts_tenant_due" ON "erp_receipts"("tenant_id", "due_date");

ALTER TABLE "erp_receipts" ADD CONSTRAINT "erp_receipts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "domain_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "event_type" TEXT NOT NULL,
    "aggregate_type" TEXT NOT NULL,
    "aggregate_id" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "created_by_user_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "domain_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_domain_events_tenant_created" ON "domain_events"("tenant_id", "created_at" DESC);

ALTER TABLE "domain_events" ADD CONSTRAINT "domain_events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "integration_webhooks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "event_types" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "integration_webhooks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_integration_webhooks_tenant" ON "integration_webhooks"("tenant_id");

ALTER TABLE "integration_webhooks" ADD CONSTRAINT "integration_webhooks_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "integration_webhook_deliveries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "webhook_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "domain_event_id" UUID,
    "event_type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "status_code" INTEGER NOT NULL DEFAULT 0,
    "response_body" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "integration_webhook_deliveries_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_webhook_deliveries_tenant_created" ON "integration_webhook_deliveries"("tenant_id", "created_at" DESC);

ALTER TABLE "integration_webhook_deliveries" ADD CONSTRAINT "integration_webhook_deliveries_webhook_id_fkey" FOREIGN KEY ("webhook_id") REFERENCES "integration_webhooks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "integration_webhook_deliveries" ADD CONSTRAINT "integration_webhook_deliveries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "integration_webhook_deliveries" ADD CONSTRAINT "integration_webhook_deliveries_domain_event_id_fkey" FOREIGN KEY ("domain_event_id") REFERENCES "domain_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;
