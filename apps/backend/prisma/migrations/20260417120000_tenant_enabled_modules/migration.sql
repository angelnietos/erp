-- AlterTable
ALTER TABLE "tenants" ADD COLUMN "enabled_module_ids" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Backfill: todos los módulos por defecto (coincide con DEFAULT_TENANT_MODULE_IDS)
UPDATE "tenants"
SET "enabled_module_ids" = ARRAY[
  'dashboard','clients','projects','events','identity','availability','services',
  'reports','audit','inventory','budgets','delivery','fleet','rentals','billing','verifactu'
]::TEXT[]
WHERE cardinality("enabled_module_ids") = 0;
