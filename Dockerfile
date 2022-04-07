FROM node:17 AS build
ARG API_ENDPOINT=https://api.sprintretro.app

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
ENV REACT_APP_API_ENDPOINT=${API_ENDPOINT}
RUN npm run build
RUN rm -rf node_modules

FROM nginx:stable
COPY --from=build /app/build/ /var/www/
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
