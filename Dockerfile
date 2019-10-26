FROM node:12
ARG API_ENDPOINT
WORKDIR /app
COPY . .
RUN npm install
ENV REACT_APP_API_ENDPOINT=${API_ENDPOINT}
RUN npm run build
RUN rm -rf node_modules
RUN npm install express
CMD ["node", "serve.js"]
