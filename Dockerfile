# Stage 1: Build
FROM node:18-alpine AS builder

# Install sqlite3 for database inspection
RUN apk add --no-cache sqlite

WORKDIR /app

# Copy package files and install deps
COPY package*.json ./
RUN npm install


# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy the rest of your app source
COPY . .


# Build your Next.js app
RUN npm run build

# Stage 2: Production image
FROM node:18-alpine

# Install sqlite3 for database inspection
RUN apk add --no-cache sqlite

WORKDIR /app

# Copy only the built files and package files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Expose port your app runs on
EXPOSE 3000

# Run the production start command
CMD ["npm", "start"]
