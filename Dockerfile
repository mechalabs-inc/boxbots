# syntax=docker/dockerfile:1

# 1. Dependencies
FROM node:22-slim AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci

# 2. Build
FROM node:22-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . ./
RUN npm run build

# 3. Production runner
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copy lockfile and package.json
COPY package*.json ./

# Install only production dependencies (including serve)
RUN npm ci --omit=dev

# Copy only built output
COPY --from=builder /app/dist ./dist

EXPOSE 8080

# Use the start script which properly handles PORT env var
CMD ["npm", "run", "start"]
