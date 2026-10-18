# syntax=docker/dockerfile:1
# Landing statique de Tokenhood : build Node, puis service par nginx non root.
# Le contexte de build est la racine du dépôt, car la landing lit design/, .tokenhood/,
# le plan de développement et decisions/ :
#   docker build -f landing/Dockerfile -t tokenhood-landing .
#   docker build -f landing/Dockerfile --build-arg BREVO_FORM_ACTION=https://xxx.sibforms.com/serve/... .

FROM node:22-alpine AS build
WORKDIR /repo/landing
COPY landing/package.json landing/package-lock.json ./
RUN npm ci --ignore-scripts --no-audit --no-fund
COPY design/ /repo/design/
COPY .tokenhood/ /repo/.tokenhood/
COPY docs/specs/plan-de-developpement.md /repo/docs/specs/
COPY decisions/ /repo/decisions/
COPY landing/ ./
ARG BREVO_FORM_ACTION=""
RUN npm test && BREVO_FORM_ACTION="$BREVO_FORM_ACTION" npm run build

FROM nginxinc/nginx-unprivileged:1.30-alpine
COPY landing/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/landing/dist /usr/share/nginx/html
# Utilisateur non root de l'image de base (nginx, uid 101), déclaré pour le contrôle de configuration de Trivy (TH-015).
USER 101
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
