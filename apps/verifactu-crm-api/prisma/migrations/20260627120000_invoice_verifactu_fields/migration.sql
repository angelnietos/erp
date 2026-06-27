-- Columnas de factura añadidas al schema sin migración previa
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "budget_id" UUID;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "verifactu_status" TEXT NOT NULL DEFAULT 'PENDING';
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "current_hash" TEXT;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "previous_hash" TEXT;
