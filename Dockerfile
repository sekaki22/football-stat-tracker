# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install deps
COPY package*.json ./
RUN npm install

# Copy the rest of your app source
COPY . .

# Generate Prisma client
RUN npx prisma generate

RUN npm install

# Build your Next.js app
RUN npm run build

# Stage 2: Production image
FROM node:18-alpine

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
