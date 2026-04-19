FROM node:20-bookworm-slim AS builder
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
ENV NX_DAEMON=false
ENV CI=true
ENV NODE_OPTIONS=--max-old-space-size=8192
RUN pnpm exec nx run frontend:build:production

FROM nginx:1.27-alpine
COPY docker/nginx/frontend.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/apps/frontend/browser /usr/share/nginx/html
EXPOSE 80
