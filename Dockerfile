FROM oven/bun:1.3.14-alpine as base

ARG PORT=3000

WORKDIR /src

# Build
FROM base as build

COPY --link package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY --link . .

RUN bun run build

# Run
FROM base

ENV NODE_ENV=production

COPY --from=build /src/.output /src/.output
# Optional, only needed if you rely on unbundled dependencies
# COPY --from=build /src/node_modules /src/node_modules
