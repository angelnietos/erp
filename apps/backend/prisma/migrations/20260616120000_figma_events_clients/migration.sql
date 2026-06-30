-- Figma eventos/clientes: tipología, operador, tarifa y bloques de venue

ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "tariff_label" TEXT;

ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "operator_contact_id" UUID;
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "typology" TEXT NOT NULL DEFAULT 'EXTERNAL';
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "event_time" TEXT;
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "venue_schedule" JSONB;

ALTER TABLE "events" ALTER COLUMN "status" SET DEFAULT 'DRAFT';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'events_operator_contact_id_fkey'
  ) THEN
    ALTER TABLE "events"
      ADD CONSTRAINT "events_operator_contact_id_fkey"
      FOREIGN KEY ("operator_contact_id") REFERENCES "client_contacts"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
