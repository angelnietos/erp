# Josanz Audiovisuales ERP - Master Dockerfile (High performance & Layered)
# Usage: docker build --build-arg APP_NAME=verifactu-api -t josanz-verifactu .

# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
# Check for native modules
RUN apk add --no-cache python3 make g++ openjdk17-jre
COPY package*.json ./
RUN npm ci

# Stage 2: Build the specific Nx project
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG APP_NAME
RUN npx nx build ${APP_NAME} --production --skip-nx-cache

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ARG APP_NAME
ENV APP_NAME_ENV=${APP_NAME}

# Copy built package and node_modules
# Note: For real monorepos, use @nx/js:prune to extract selective node_modules
# but for simplicity in this V2 roadmap, we copy the necessary dist.

COPY --from=builder /app/dist/apps/${APP_NAME} ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# Custom logic if it's a frontend or backend
# Frontends usually output to browser/, Backends to main.js
CMD node dist/main.js
