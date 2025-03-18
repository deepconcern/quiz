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

COPY nginx/default.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html

COPY --from=build /usr/src/app/dist .