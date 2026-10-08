FROM node:24-alpine AS build
WORKDIR /app
ARG VCS_REF=local
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build && printf '{"ok":true,"service":"home-page","revision":"%s"}\n' "$VCS_REF" > dist/version.json
FROM nginxinc/nginx-unprivileged:1.28-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
