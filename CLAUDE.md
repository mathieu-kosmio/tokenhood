# CLAUDE.md · Tokenhood

Contexte de travail pour Claude Code. Langue de travail : français (interface bilingue FR/EN).

## Le projet

Tokenhood : mécénat de tokens pour les communs numériques. Des contributeurs mettent la capacité de leurs agents IA au service de projets open source sélectionnés et sous convention. Un agent réalise une mission, l'agent d'un autre utilisateur la vérifie, le mainteneur intègre.

Principes non négociables :
- **Orchestrateur sans modèle** : aucun appel à un fournisseur de LLM côté serveur, aucune clé de fournisseur stockée.
- **Non marchand** : rien ne se vend ni ne se transfère.
- **Vérification croisée obligatoire** par l'agent d'un autre utilisateur ; fusion toujours humaine.
- **Bilingue FR/EN** : aucune chaîne d'interface en dur.
- **Tokenhood se construit avec Tokenhood** : tout travail passe par une mission de `.tokenhood/missions/`.

## Références

- Spécifications V2.1 : `docs/specs/` (versées par TH-001, PR #2) ; source : https://claude.ai/code/artifact/70f6540c-17f9-4d27-95dd-8b33017cf7d2
- Plan de développement (56 missions, 5 lots) : https://claude.ai/code/artifact/c4fd5cb0-43b3-487d-a5a8-b98bf86c0a94
- Décisions : `decisions/` (DEC-2026-001 direction artistique, DEC-2026-002 déploiement, DEC-2026-003 landing, ADR-002 stack proposée par TH-007)

## État au 18/10/2026

- Lot 0 (amorçage) en cours ; missions TH-001 à TH-017 publiées, TH-101 (lot 1) ouverte en avance.
- Dépôt public, licence non encore choisie (AGPL-3.0 proposée).
- Dépôt réglé : description, site, sujets, labels, Discussions activées. Les catégories Clarifications, Décisions, Propositions restent à créer dans l'interface GitHub (aucune API).
- `main` protégée : PR obligatoire (y compris pour les administrateurs), historique linéaire (fusion en rebase ou squash), conversations résolues, ni force-push ni suppression. Zéro approbation requise tant que le porteur est seul mainteneur ; aucun statut de CI requis avant TH-015.
- La fusion des PR revient au porteur : l'agent prépare, vérifie et documente, il ne fusionne pas.

### File de PR (ordre de fusion)

| PR | Mission | Base | Contenu |
|---|---|---|---|
| #1 | TH-017 | `main` | Landing statique FR/EN, publiée sur tokenhood.kosm.io après fusion |
| #2 | TH-001 | `main` | Spécifications V2.1 dans `docs/specs/` (FR et EN) |
| #3 | TH-002 | `main` | JSON Schema, exemples, validateur `tools/validate/` |
| #4 | TH-003 | #3 | Workflow `tokenhood` : validation de `.tokenhood/` et des exemples |
| #5 | TH-007 | `main` | Dossier d'options et ADR-002 (fusion = adoption) |
| #6 | TH-101 | #1 | Monorepo pnpm : `apps/api`, `apps/web`, `packages/i18n`, `locales/`, CI |
| #7 | TH-013 | #6 | Image unique, `compose.yaml`, workflow `image` |

Une PR empilée change de base quand la précédente est fusionnée ; avec une fusion en rebase, la rebaser ensuite sur `main` (`git rebase --onto origin/main <ancienne-base>`).

## Landing (`landing/`)

- Site statique sans framework, servi par nginx non root ; mode d'emploi complet dans `landing/README.md`.
- Commandes : `cd landing && npm ci && npm test` ; `npm run build && npm run serve` pour prévisualiser sur le port 4173.
- Textes : `landing/locales/<lang>/*.json` uniquement ; le test refuse toute chaîne visible absente des locales et toute divergence de structure FR/EN.
- Formulaire : Brevo hébergé, URL dans la variable de build `BREVO_FORM_ACTION` ; sans elle, repli sur GitHub Discussions.

## Plateforme (monorepo, ADR-002)

- pnpm 12 via corepack (`corepack enable`, version fixée par `packageManager`), Node 22, TypeScript 6 (SvelteKit 3 ne suit pas encore TypeScript 7).
- `pnpm install`, puis `pnpm check` (lint, build, typecheck, tests) ; `pnpm dev:api`, `pnpm dev:web`.
- `locales/fr.json` et `locales/en.json` (ICU) : seule source des chaînes de l'API et du web ; parité des clés et des arguments vérifiée à chaque build.
- Scripts d'installation des dépendances refusés (`allowBuilds`) ; politique d'âge minimal des versions de pnpm à respecter (épingler une version plus ancienne plutôt qu'ajouter une exception).
- Image : `Dockerfile` à la racine (api et web), `compose.yaml` (api, web, PostgreSQL) ; essai en CI par le workflow `image` (Docker indisponible sur le poste du porteur).

## Déploiement

- Coolify, déploiement automatique à chaque commit sur `main` (mis en place par Mathieu).
- Page publique au démarrage : `tokenhood.kosm.io`. Landing : build pack Dockerfile, base directory `/`, Dockerfile `/landing/Dockerfile`, port 8080, healthcheck `/healthz`.
- Plateforme : ressource Coolify Docker Compose depuis `compose.yaml`, domaines `app.` (web:3000) et `api.` (api:3000), variable secrète `POSTGRES_PASSWORD`.
- Plus de push direct sur `main` (protection active) : PR, CI au vert, revue croisée, approbation du porteur.

## Design

- Direction retenue : « Canopée Kosmio », satellite du design system Kosmio v2 « Horizon ».
- Tokens : `design/tokens.md`, classe `.kos-tokenhood` dans `design/tokenhood.css`, à charger après `design/kosmio.css` (copie du design system Kosmio, à ne pas modifier dans ce dépôt).
- Règles Kosmio : Lexend 500 pour les titres (jamais 700), Public Sans pour le corps, JetBrains Mono pour eyebrows et identifiants ; or #E8A33D et ciel #6BAED6 en aplat seulement (texte : #8A5A12, #38718F) ; teal < 10 % de la surface ; aucun dégradé sauf voile de hero ; 160 px entre sections ; rayons carte 16, champ 8, boutons en pastille ; filets 1 px #E3E4E1.
- Maquette de la landing validée en direction : `design/maquettes/landing.dc.html` (format Design Component : la mise en page et les textes FR/EN sont dans le fichier, le contenu bilingue est dans `renderVals()`). Planche de référence : `design/maquettes/planche-canopee-kosmio.dc.html`.
- Visuels en SVG faits main, pas d'image générée.

## Prochaines étapes

1. Porteur : fusionner la file de PR dans l'ordre ci-dessus ; créer dans Coolify l'application de la landing (`landing/README.md`) puis la ressource Compose de la plateforme.
2. Porteur : formulaire Brevo (liste « Tokenhood », double opt-in) et `BREVO_FORM_ACTION` ; catégories Discussions ; licence (`LICENSE`, README, `project.yaml`, FAQ de la landing).
3. Relire les textes de la landing et les pages légales (sous-traitants, conservation), et la traduction EN des spécifications (PR #2).
4. Missions suivantes : TH-015 (scans et statuts requis), TH-004 et TH-005 (skills), TH-009 (contrats du protocole), TH-006, TH-010, TH-011 ; côté MVP, TH-102 (identité, OAuth GitHub, `packages/db` avec Drizzle) et le stockage S3 laissé hors de TH-013.

## Conventions de commit

- DCO : `git commit -s` ; trailer `Assisted-by: <client/modèle>`.
