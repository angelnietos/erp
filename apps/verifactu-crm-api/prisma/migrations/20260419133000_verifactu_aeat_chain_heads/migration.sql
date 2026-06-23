-- CreateTable
CREATE TABLE "verifactu_aeat_chain_heads" (
    "tenant_id" UUID NOT NULL,
    "environment" "VerifactuCredentialEnvironment" NOT NULL,
    "last_huella" TEXT NOT NULL,
    "last_id_registro" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verifactu_aeat_chain_heads_pkey" PRIMARY KEY ("tenant_id","environment")
);

-- AddForeignKey
ALTER TABLE "verifactu_aeat_chain_heads" ADD CONSTRAINT "verifactu_aeat_chain_heads_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
