# Runbook de despliegue — Josanz ERP (backend + frontend)

## Prerrequisitos

- Node.js y `pnpm` (alineados con el repo).
- PostgreSQL accesible.
- Variables de entorno: copiar `apps/backend/env.example` → `apps/backend/.env` y completar secretos.

## Backend

1. **Instalar dependencias** (raíz del monorepo): `pnpm install`
2. **Generar cliente Prisma**: `pnpm run db:generate`
3. **Migraciones**: `pnpm run db:migrate` (o `prisma migrate deploy` en CI/prod)
4. **Seed** (opcional, demo): tras migraciones, ejecutar el seed configurado en `package.json` → `prisma.seed`
5. **Arranque**: `pnpm run backend:dev:full` o `dotenv -e apps/backend/.env -- node dist/apps/backend/main.js` en prod tras `pnpm run backend:build:prod`

## Comprobaciones

- **Salud**: `GET /api/health` (sin `x-tenant-id`)
- **OpenAPI**: `GET /api/docs` (Swagger UI)

## Frontend

- Desarrollo: `pnpm run dev:frontend`
- Build: `nx run frontend:build` (o configuración `production`)

El frontend usa rutas `/api/*` relativas; en desarrollo `environment.apiOrigin` debe apuntar al backend (p. ej. `http://localhost:3000`).

## Docker / artefacto Node

Tras el build del backend, si usas `copy-workspace-modules`: `pnpm run backend:copy-workspace-modules` (requiere `outputPath`; ver script en `package.json`).

## Retención de datos

- `DOMAIN_EVENTS_RETENTION_DAYS`: job semanal purga filas antiguas en `domain_events` (0 = no purgar).

## CORS

- `CORS_ORIGIN`: un origen o varios separados por coma (p. ej. `https://app.ejemplo.com,https://staging.ejemplo.com`).

## Rate limiting (opcional)

- `RATE_LIMIT_HEALTH_PER_MINUTE` / `RATE_LIMIT_LOGIN_PER_MINUTE`: máximo de peticiones por IP por minuto (0 = desactivado).
