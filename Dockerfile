FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN node scripts/build.js

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/index.html /app/manifest.json /app/sw.js /app/logo.png /app/maneki-premium.css /usr/share/nginx/html/
COPY --from=build /app/css /usr/share/nginx/html/css
COPY --from=build /app/js /usr/share/nginx/html/js
COPY --from=build /app/img /usr/share/nginx/html/img
