# Dependencies
FROM node:20.11.1-alpine3.19 AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Build
FROM node:20.11.1-alpine3.19 AS builder
WORKDIR /app
COPY tsconfig*.json ./
COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
COPY .env* ./
RUN npm install
RUN npm run build
RUN npm prune --production

# Prod
FROM node:20.11.1-alpine3.19
COPY --from=builder /app .
EXPOSE 3000
ENV NODE_ENV=production
ENTRYPOINT ["node", "dist/main.js"]
