# Railway service: verifactu-worker
FROM node:20-bookworm-slim AS builder
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml ./
COPY scripts ./scripts
COPY apps/backend/prisma ./apps/backend/prisma
RUN pnpm install --frozen-lockfile

COPY . .
ENV NX_DAEMON=false
ENV CI=true
ENV NODE_OPTIONS=--max-old-space-size=8192
RUN pnpm exec nx run verifactu-worker:build:production

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/dist/apps/verifactu-worker ./
COPY --from=builder /app/apps/backend/prisma ./prisma
RUN if [ -f package.json ]; then npm install --omit=dev; fi

EXPOSE 3120
CMD ["sh", "-c", "export VERIFACTU_WORKER_PORT=${PORT:-3120}; node main.js"]
