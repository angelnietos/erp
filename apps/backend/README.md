## Backend (NestJS)

### Environment

Create `apps/backend/.env` from `.env.example`:

```
docker compose up -d postgres redis
cp apps/backend/.env.example apps/backend/.env
```

Important variables:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL |
| `REDIS_URL` or `REDIS_HOST` | **Required for stable BFF sessions** — without Redis, sessions are lost on every backend restart |
| `BFF_SESSION_MAX_AGE_HOURS` | Cookie + server session TTL (default 24) |
| `JWT_EXPIRES` | ERP JWT lifetime (default 24h) |

On startup you should see: `BFF sessions → Redis (redis://localhost:6379)`.  
If you see the in-memory warning, Redis is not configured.

### Serve

From repo root:

```
pnpm nx run backend:serve:development
```

If port 3000 is in use, stop the other instance or change `PORT` in `.env`.
