# Railway service: saas-platform
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
RUN pnpm exec nx run saas-platform:build:production

FROM nginx:1.27-alpine
ENV PORT=80
COPY deploy/railway/nginx/spa.conf.template /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist/apps/saas-platform/browser /usr/share/nginx/html
EXPOSE 80
CMD ["sh", "-c", "envsubst '$PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
