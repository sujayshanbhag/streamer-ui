FROM node:20-bullseye-slim AS build
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}
WORKDIR /app

COPY package*.json ./

RUN npm ci --silent

COPY . .

RUN npm run build

FROM nginx:stable-alpine AS production
ENV NODE_ENV=production

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/dist /usr/share/nginx/html
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

RUN rm /etc/nginx/conf.d/default.conf || true
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["/bin/sh", "/entrypoint.sh"]
