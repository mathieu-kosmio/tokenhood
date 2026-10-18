# syntax=docker/dockerfile:1
# Image unique de la plateforme (ADR-002) : les services api et web en sortent avec des commandes différentes.
#   docker build -t tokenhood-app .
#   docker run -e PORT=3000 tokenhood-app node apps/api/dist/server.js
# La landing a sa propre image : landing/Dockerfile.

FROM node:22-alpine AS base
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /repo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/i18n/package.json packages/i18n/

# Construction : toutes les dépendances, puis lint, build, typecheck et tests.
FROM base AS build
RUN pnpm install --frozen-lockfile
COPY tsconfig.base.json eslint.config.js .prettierrc.json .prettierignore ./
COPY design/kosmio.css design/tokenhood.css design/
COPY locales/ locales/
COPY .tokenhood/missions/ .tokenhood/missions/
COPY packages/ packages/
COPY apps/ apps/
RUN pnpm check

# Dépendances de production seules.
FROM base AS prod-deps
RUN pnpm install --frozen-lockfile --prod

# Exécution : utilisateur non root, aucun secret, aucun outil de build.
FROM node:22-alpine AS runtime
# Seul node sert à l'exécution : npm, corepack et yarn de l'image de base sont retirés, avec les vulnérabilités
# de leurs dépendances embarquées (scan Trivy de TH-015).
RUN rm -rf /usr/local/lib/node_modules /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack \
  /usr/local/bin/yarn /usr/local/bin/yarnpkg /opt/yarn-*
ENV NODE_ENV=production PORT=3000
WORKDIR /repo
COPY --from=prod-deps --chown=node:node /repo/ ./
COPY --from=build --chown=node:node /repo/packages/i18n/dist packages/i18n/dist
COPY --from=build --chown=node:node /repo/apps/api/dist apps/api/dist
COPY --from=build --chown=node:node /repo/apps/web/build apps/web/build
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null "http://127.0.0.1:${PORT}/healthz" || exit 1
CMD ["node", "apps/api/dist/server.js"]
