FROM node:14 AS build
ARG API_ENDPOINT=https://api.sprintretrospective.eu
WORKDIR /app
COPY . .
ENV REACT_APP_API_ENDPOINT=${API_ENDPOINT}
RUN npm install && \
    npm run build && \
    rm -rf node_modules

FROM nginx:stable
COPY --from=build /app/build/ /var/www/
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf