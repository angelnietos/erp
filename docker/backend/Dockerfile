# Build context: raíz del monorepo
# pnpm exec nx run backend:build:production → dist/apps/backend (main.js + package.json generado por webpack)
FROM node:20-bookworm-slim AS builder
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
ENV NX_DAEMON=false
ENV CI=true
ENV NODE_OPTIONS=--max-old-space-size=8192
RUN pnpm exec nx run backend:build:production

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Webpack + NxAppWebpackPlugin(generatePackageJson) deja main.js y package.json en dist/apps/backend
COPY --from=builder /app/dist/apps/backend ./

# Prisma: migraciones manuales o job CI (schema necesario si ejecutas migrate dentro del contenedor)
COPY --from=builder /app/apps/backend/prisma ./prisma

RUN if [ -f package.json ]; then npm install --omit=dev; fi

EXPOSE 3000
CMD ["node", "main.js"]
