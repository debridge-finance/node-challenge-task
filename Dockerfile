# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# If using TypeScript, build it
RUN npm run build

# Stage 2: Run
FROM node:20-alpine

WORKDIR /app

# Copy built files and node_modules from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

# Expose port (your app port)
EXPOSE 3000

# Run the app
CMD ["node", "dist/main.js"]
