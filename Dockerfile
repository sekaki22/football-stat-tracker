# Stage 1: Build
FROM node:18-alpine AS builder

# Install sqlite3 for database inspection
RUN apk add --no-cache sqlite

WORKDIR /app

# Copy package files + prisma schema BEFORE npm install
# (postinstall runs `prisma generate` and needs schema.prisma)
COPY package*.json ./
COPY prisma ./prisma
RUN npm install

# Copy the rest of your app source
COPY . .

# Verify schema exists before build
RUN test -f prisma/schema.prisma

# Build your Next.js app (runs prisma generate + next build)
RUN npm run build

# Stage 2: Production image
FROM node:18-alpine

# Install sqlite3 for database inspection
RUN apk add --no-cache sqlite

WORKDIR /app

# Copy only the built files and package files
COPY --from=builder --chown=node:node /app/package*.json ./
COPY --from=builder --chown=node:node /app/.next ./.next
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/prisma ./prisma
COPY --from=builder --chown=node:node /app/content ./content

# SQLite volume mount point; host ./data overlays this at runtime
RUN mkdir -p /app/data && chown node:node /app/data

# Verify runtime image has schema for migrate deploy
RUN test -f prisma/schema.prisma

EXPOSE 3000

USER node

CMD ["npm", "start"]
