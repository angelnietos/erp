# Build context: raíz del monorepo
# Uso: docker build -f docker/backend/Dockerfile --build-arg NX_PROJECT=backend .
# Proyectos: backend | verifactu-api | verifactu-worker
ARG NX_PROJECT=backend

FROM node:20-bookworm-slim AS builder
ARG NX_PROJECT
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
ENV NX_DAEMON=false
ENV CI=true
ENV NODE_OPTIONS=--max-old-space-size=8192
RUN pnpm exec nx run "${NX_PROJECT}:build:production"

FROM node:20-bookworm-slim AS runner
ARG NX_PROJECT
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY --from=builder "/app/dist/apps/${NX_PROJECT}" ./

# Schema compartido (backend + verifactu)
COPY --from=builder /app/apps/backend/prisma ./prisma

RUN if [ -f package.json ]; then npm install --omit=dev; fi

EXPOSE 3000
CMD ["node", "main.js"]
