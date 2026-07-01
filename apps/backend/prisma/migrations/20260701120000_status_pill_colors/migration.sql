-- Colores personalizados de pastillas de estado (clientes y eventos)
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "pill_color" TEXT;
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "status_pill_color" TEXT;
