-- Permisos explícitamente bloqueados por usuario (restan al merge de roles + extra).
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "denied_permissions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
