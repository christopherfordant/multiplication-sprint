# 🐳 Dockerfile pour Multiplication Sprint
# Multi-stage build pour une image plus petite

# Stage 1: Build
FROM node:16-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances de production uniquement
RUN npm ci --only=production && \
    npm cache clean --force

# Stage 2: Runtime
FROM node:16-alpine

WORKDIR /app

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copier les node_modules du stage 1
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copier les fichiers de l'application
COPY --chown=nodejs:nodejs server.js .
COPY --chown=nodejs:nodejs package*.json .
COPY --chown=nodejs:nodejs *.js ./
COPY --chown=nodejs:nodejs *.html ./
COPY --chown=nodejs:nodejs *.css ./
COPY --chown=nodejs:nodejs *.webmanifest ./
COPY --chown=nodejs:nodejs manifest.webmanifest ./
COPY --chown=nodejs:nodejs sw.js ./
COPY --chown=nodejs:nodejs render.yaml ./

# Passer à l'utilisateur nodejs
USER nodejs

# Variables d'environnement par défaut
ENV NODE_ENV=production \
    PORT=3000 \
    LOG_LEVEL=info

# Exposer le port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Démarrer l'application
CMD ["node", "server.js"]
