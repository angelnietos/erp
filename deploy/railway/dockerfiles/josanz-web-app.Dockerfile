# Railway service: josanz-web-app
FROM node:20-bookworm-slim AS builder
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# postinstall needs scripts/ and apps/backend/prisma before full COPY
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
# Si BACKEND_PROXY_URL está vacío, el front se sirve como SPA sin backend.
# Cuando exista backend, configúralo en Railway. Ej: http://${{backend.RAILWAY_PRIVATE_DOMAIN}}:3000
ENV BACKEND_PROXY_URL=
ENV NGINX_RESOLVER=127.0.0.11
COPY deploy/railway/nginx/spa.conf.template /etc/nginx/templates/spa.conf.template
COPY deploy/railway/nginx/frontend.conf.template /etc/nginx/templates/frontend.conf.template
COPY --from=builder /app/dist/apps/josanz-web-app/browser /usr/share/nginx/html
EXPOSE 80
CMD ["sh", "-c", "if [ -n \"$BACKEND_PROXY_URL\" ]; then envsubst '$PORT $BACKEND_PROXY_URL $NGINX_RESOLVER' < /etc/nginx/templates/frontend.conf.template > /etc/nginx/conf.d/default.conf; else envsubst '$PORT' < /etc/nginx/templates/spa.conf.template > /etc/nginx/conf.d/default.conf; fi && nginx -g 'daemon off;'"]
