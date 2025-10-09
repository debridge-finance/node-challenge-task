FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Копируем скрипт в образ и делаем его исполняемым
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

RUN npm run build

# Запускаем скрипт как entrypoint
CMD ["docker-entrypoint.sh"]
