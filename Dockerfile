# syntax=docker/dockerfile:1

# 1. Dependencies
FROM node:22-slim AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci

# 2. Build
FROM node:22-slim AS builder
WORKDIR /app

# Accept build argument for API URL
ARG VITE_API_URL=""
ENV VITE_API_URL=${VITE_API_URL}

# Debug: Print the value to verify it's being passed (remove in production if needed)
RUN echo "VITE_API_URL is set to: ${VITE_API_URL}"

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
