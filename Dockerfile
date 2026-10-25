# syntax=docker/dockerfile:1

# node:22-slim, not Alpine: better-sqlite3 is a native module and Alpine's musl libc
# makes it build from source and often break.
ARG NODE_IMAGE=node:22-slim

# --- Build: compile the web app and bundle the API -----------------------------
FROM ${NODE_IMAGE} AS build
# Toolchain only in case better-sqlite3 has no prebuilt binary for this platform.
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN npm ci
COPY . .
RUN npm run build

# --- Runtime dependencies: the API's production packages only ------------------
FROM build AS deps
RUN rm -rf node_modules && npm ci --omit=dev --workspace=@salary/api --include-workspace-root=false

# --- Runtime ---------------------------------------------------------------------
FROM ${NODE_IMAGE}
ENV NODE_ENV=production \
    PORT=3000 \
    DATABASE_PATH=/data/salary.db \
    WEB_DIST=/app/web
WORKDIR /app/api
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/web/dist /app/web
# The database lives on a volume; the app runs as the image's unprivileged node user.
RUN mkdir -p /data && chown node:node /data
USER node
VOLUME /data
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + process.env.PORT + '/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
# Migrations run and an empty database is seeded on boot (design §5).
CMD ["node", "dist/main.js"]
