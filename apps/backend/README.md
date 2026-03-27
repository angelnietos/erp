## Backend (NestJS)

Environment

- Create an `.env` file at `apps/backend/.env` based on the template below:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5435/josanz_erp
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=change-me
JWT_EXPIRES_IN=1d
```

Database and Redis

- Start local services (from repo root):

```
docker compose up -d postgres redis
```

Serve

- From repo root:

```
npx nx run backend:serve:development
```

If port 3000 is in use, run with a different port or stop the running instance.

