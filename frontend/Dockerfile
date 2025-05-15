# 1) Build stage
FROM node:24-alpine AS builder
WORKDIR /usr/src/app

# Copie des fichiers de dépendances
COPY package.json package-lock.json ./

# Utiliser npm install au lieu de npm ci
RUN npm install --legacy-peer-deps

# Copie du reste du code et build
COPY . .
RUN npm run build

# 2) Runtime stage
FROM nginx:alpine
COPY --from=builder /usr/src/app/dist/ /usr/share/nginx/html
# COPY nginx.conf /etc/nginx/conf.d/default.conf  (si besoin de SPA fallback)
