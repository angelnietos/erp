-- CreateTable
CREATE TABLE "verifactu_chain_blocks" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "environment" "VerifactuCredentialEnvironment" NOT NULL,
    "block_index" INTEGER NOT NULL,
    "invoice_id" UUID NOT NULL,
    "invoice_number" TEXT,
    "invoice_total" DOUBLE PRECISION NOT NULL,
    "queue_item_id" UUID,
    "log_id" UUID,
    "previous_hash" TEXT NOT NULL,
    "current_hash" TEXT NOT NULL,
    "aeat_huella" TEXT NOT NULL,
    "aeat_id_registro" TEXT NOT NULL,
    "verification_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verifactu_chain_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uq_verifactu_chain_tenant_env_index" ON "verifactu_chain_blocks"("tenant_id", "environment", "block_index");

-- CreateIndex
CREATE INDEX "idx_verifactu_chain_tenant_env_created" ON "verifactu_chain_blocks"("tenant_id", "environment", "created_at");

-- CreateIndex
CREATE INDEX "idx_verifactu_chain_tenant_invoice" ON "verifactu_chain_blocks"("tenant_id", "invoice_id");

-- AddForeignKey
ALTER TABLE "verifactu_chain_blocks" ADD CONSTRAINT "verifactu_chain_blocks_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
