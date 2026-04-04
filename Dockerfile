FROM node:20-bullseye-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci --silent

COPY . .
RUN npm run build

FROM nginx:stable-alpine AS production
ENV NODE_ENV=production

RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html

COPY entrypoint.sh /docker-entrypoint.d/40-env.sh
RUN chmod +x /docker-entrypoint.d/40-env.sh

RUN rm /etc/nginx/conf.d/default.conf || true
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
