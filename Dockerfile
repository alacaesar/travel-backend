# syntax=docker/dockerfile:1
# Production Strapi 5 image: build admin in CI, run on a small VM with mounted volumes for SQLite + uploads.

ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-bookworm-slim AS build

RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    python3 \
    make \
    g++ \
    pkg-config \
    libvips-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV NODE_ENV=production
RUN npm run build \
    && npm prune --omit=dev

FROM node:${NODE_VERSION}-bookworm-slim AS runner

RUN apt-get update && apt-get install -y --no-install-recommends \
    dumb-init \
    libvips \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
WORKDIR /opt/app

RUN groupadd --gid 1001 strapi \
    && useradd --uid 1001 --gid strapi --shell /bin/bash --create-home strapi

COPY --from=build --chown=strapi:strapi /opt/app/node_modules ./node_modules
COPY --from=build --chown=strapi:strapi /opt/app/dist ./dist
COPY --from=build --chown=strapi:strapi /opt/app/public ./public
COPY --from=build --chown=strapi:strapi /opt/app/config ./config
COPY --from=build --chown=strapi:strapi /opt/app/src ./src
COPY --from=build --chown=strapi:strapi /opt/app/types ./types
COPY --from=build --chown=strapi:strapi /opt/app/package.json ./package.json
COPY --from=build --chown=strapi:strapi /opt/app/package-lock.json ./package-lock.json
COPY --from=build --chown=strapi:strapi /opt/app/tsconfig.json ./tsconfig.json

USER strapi

EXPOSE 1337

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "start"]
