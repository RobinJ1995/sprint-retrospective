FROM node:12
ARG API_ENDPOINT=https://api.sprintretrospective.eu
WORKDIR /app
COPY . .
ENV REACT_APP_API_ENDPOINT=${API_ENDPOINT}
RUN npm install && \
    npm run build && \
    npm prune --production
CMD ["node", "serve.js"]
