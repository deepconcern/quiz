# Stage 1 - Build the app

FROM oven/bun:alpine AS build

WORKDIR /usr/src/app

COPY package.json .
COPY bun.lockb .

RUN bun install --frozen-lockfile

COPY . .

RUN bun run build

# Stage 2 - Serve the app

FROM nginx:alpine AS app

COPY --from=build /usr/src/app/nginx.conf.template /etc/nginx/templates/default.conf.template

WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=build /usr/src/app/dist .