# Stage 1: Build dependencies
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

COPY prisma ./prisma

# Install dependencies
RUN npm ci --omit=dev



# Stage 2: Production image
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy node modules from builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy application code
COPY --chown=nodejs:nodejs . .

# Generate Prisma Client
RUN npm run postinstall || true

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/v1', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Start application with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "npx prisma db push && npm start"]
