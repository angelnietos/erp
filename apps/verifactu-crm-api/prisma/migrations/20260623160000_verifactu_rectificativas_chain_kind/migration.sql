-- AlterTable
ALTER TABLE "invoices" ADD COLUMN "invoice_kind" TEXT NOT NULL DEFAULT 'NORMAL';
ALTER TABLE "invoices" ADD COLUMN "rectifies_invoice_id" UUID;
ALTER TABLE "invoices" ADD COLUMN "rectification_type" TEXT;
ALTER TABLE "invoices" ADD COLUMN "rectification_reason" TEXT;

-- AlterTable
ALTER TABLE "verifactu_chain_blocks" ADD COLUMN "record_kind" TEXT NOT NULL DEFAULT 'INVOICE';

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_rectifies_invoice_id_fkey" FOREIGN KEY ("rectifies_invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;
