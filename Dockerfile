# ── Etapa 1: compilar el frontend ────────────────────────────────────────────
FROM node:22.13.0-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ── Etapa 2: imagen de producción con Express ─────────────────────────────────
FROM node:22.13.0-alpine
WORKDIR /app

# Instalar solo dependencias de producción
COPY package*.json ./
RUN npm ci --omit=dev

# Copiar frontend compilado y servidor
COPY --from=builder /app/dist ./dist
COPY server.js ./

EXPOSE 80
ENV PORT=80

CMD ["node", "server.js"]
