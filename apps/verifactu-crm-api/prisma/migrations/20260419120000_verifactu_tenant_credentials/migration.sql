-- CreateEnum
CREATE TYPE "VerifactuCredentialEnvironment" AS ENUM ('TEST', 'PRODUCTION');

-- CreateTable
CREATE TABLE "verifactu_tenant_credentials" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "environment" "VerifactuCredentialEnvironment" NOT NULL,
    "cert_encrypted" TEXT NOT NULL,
    "key_encrypted" TEXT NOT NULL,
    "cert_subject" VARCHAR(512),
    "cert_valid_to" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verifactu_tenant_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uq_verifactu_cred_tenant_env" ON "verifactu_tenant_credentials"("tenant_id", "environment");

-- AddForeignKey
ALTER TABLE "verifactu_tenant_credentials" ADD CONSTRAINT "verifactu_tenant_credentials_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
