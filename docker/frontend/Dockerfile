# Build context: raíz del monorepo
# Uso: docker build -f docker/frontend/Dockerfile --build-arg NX_PROJECT=josanz-web-app .
# NGINX_PROFILE: spa (sin proxy API) | frontend (proxy /api → backend)
ARG NX_PROJECT=frontend
ARG NGINX_PROFILE=spa

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

FROM nginx:1.27-alpine
ARG NX_PROJECT
ARG NGINX_PROFILE
COPY docker/nginx/ /tmp/nginx/
RUN cp "/tmp/nginx/${NGINX_PROFILE}.conf" /etc/nginx/conf.d/default.conf && rm -rf /tmp/nginx
COPY --from=builder "/app/dist/apps/${NX_PROJECT}/browser" /usr/share/nginx/html
EXPOSE 80
