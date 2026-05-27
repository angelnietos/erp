# Fallback cuando Railway usa el Dockerfile de la raíz (sin config-as-code).
# Servicios recomendados: deploy/railway/config/josanz-web-app.railway.json
# Mismo contenido que deploy/railway/dockerfiles/josanz-web-app.Dockerfile (pnpm, no npm ci).

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
RUN pnpm exec nx run josanz-web-app:build:production

FROM nginx:1.27-alpine
ENV PORT=80
ENV BACKEND_PROXY_URL=http://127.0.0.1:3000
ENV NGINX_RESOLVER=127.0.0.11
COPY deploy/railway/nginx/frontend.conf.template /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist/apps/josanz-web-app/browser /usr/share/nginx/html
EXPOSE 80
CMD ["sh", "-c", "envsubst '$PORT $BACKEND_PROXY_URL $NGINX_RESOLVER' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
