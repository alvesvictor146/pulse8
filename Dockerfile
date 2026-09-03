# Multi-stage Dockerfile para Pulse8 (Next.js 14 + Node 20)
FROM node:20-alpine AS base

# 1. Dependências
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

# 2. Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Desativa telemetria durante o build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Gerar cliente Prisma
RUN npx prisma generate

# Build da aplicação
RUN npm run build

# 3. Runner de Produção
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next

USER nextjs

EXPOSE 3000

CMD ["npm", "start"]
