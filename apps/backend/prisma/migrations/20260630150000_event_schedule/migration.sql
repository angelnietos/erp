-- Varias fechas/horas por evento (Figma «Nuevo evento»)

ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "event_schedule" JSONB;
