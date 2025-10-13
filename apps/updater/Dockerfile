FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY nest-cli.json ./

COPY apps/updater ./apps/updater

RUN npm ci
RUN npm run build updater

FROM node:24-alpine AS production

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
  adduser -S nestjs -u 1001

COPY package*.json ./

RUN npm ci --only=production && \
  npm cache clean --force

COPY --from=builder --chown=nestjs:nodejs /app/dist/apps/updater ./dist

USER nestjs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/main.js"]
