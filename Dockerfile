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

# Copy lockfile and package.json so npm ci can work
COPY package*.json ./

# Copy only built output and node_modules from deps
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# If you only need production dependencies, prune instead of reinstalling
RUN npm prune --omit=dev

EXPOSE 8080
CMD ["npm", "run", "start"]
