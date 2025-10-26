ARG NODE_VERSION=22-alpine

# Stage 1: Build
FROM node:${NODE_VERSION} AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY nest-cli.json ./

RUN npm ci
COPY src ./src

RUN npm run build

# Stage 2: Production
FROM node:${NODE_VERSION}

WORKDIR /app

# Создаем non-root пользователя и устанавливаем wget для health check
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    apk add --no-cache wget

COPY package*.json ./

RUN npm ci --only=production && \
    npm cache clean --force
COPY --from=builder /app/dist ./dist

# Копируем entrypoint script
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3000

# Запускаем приложение через entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]

