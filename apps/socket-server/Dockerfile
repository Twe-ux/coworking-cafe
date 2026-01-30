# syntax=docker/dockerfile:1

# Stage 1: Installer les dépendances
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/socket-server/package.json ./apps/socket-server/
COPY packages/database/package.json ./packages/database/
COPY packages/admin-shared/package.json ./packages/admin-shared/

# Installer toutes les dépendances
RUN pnpm install --frozen-lockfile

# Stage 2: Builder l'application
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

# Copier les dépendances installées
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/socket-server/node_modules ./apps/socket-server/node_modules
COPY --from=deps /app/packages ./packages

# Copier le code source
COPY . .

# Builder admin-shared d'abord (a besoin d'être compilé)
RUN pnpm --filter @coworking-cafe/admin-shared build

# Builder le socket server (database est utilisé en source)
RUN pnpm --filter @coworking-cafe/socket-server build

# Stage 3: Production
FROM node:20-alpine AS runner
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

ENV NODE_ENV=production

# Créer un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 socketio

# Copier les fichiers nécessaires
COPY --from=builder /app/apps/socket-server/dist ./apps/socket-server/dist
COPY --from=builder /app/apps/socket-server/package.json ./apps/socket-server/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/socket-server/node_modules ./apps/socket-server/node_modules
COPY --from=builder /app/packages ./packages

USER socketio

EXPOSE 3002

ENV PORT=3002

CMD ["node", "apps/socket-server/dist/index.js"]
