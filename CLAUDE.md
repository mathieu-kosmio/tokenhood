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

- Lot 0 (amorçage) en cours ; missions TH-001 à TH-017 publiées, 6 intégrées ; TH-101 (lot 1) intégrée en avance.
- Dépôt public, licence non encore choisie (AGPL-3.0 proposée).
- Dépôt réglé : description, site, sujets, labels, Discussions activées. Les catégories Clarifications, Décisions, Propositions restent à créer dans l'interface GitHub (aucune API).
- `main` protégée : PR obligatoire (y compris pour les administrateurs), historique linéaire (fusion en rebase ou squash), conversations résolues, ni force-push ni suppression. Zéro approbation requise tant que le porteur est seul mainteneur ; depuis le 18/10/2026, les 10 statuts de CI listés plus bas sont requis et la branche doit être à jour avec `main` avant fusion.
- La fusion des PR revient au porteur. Le 18/10/2026, il a autorisé l'agent à fusionner la file en rebase après CI verte ; sans autorisation explicite, l'agent prépare, vérifie et documente, il ne fusionne pas.

### Intégré sur `main` le 18/10/2026

TH-001 (spécifications, PR #2), TH-002 (schémas, #3), TH-003 (CI de validation, #4), TH-007 et ADR-002 adoptée (#5), TH-017 (landing, #1), TH-101 (monorepo, #6), TH-013 (image et compose, #7). TH-018 (déploiement de la plateforme, #9) : https://app.tokenhood.kosm.io et https://api.tokenhood.kosm.io en ligne, ressource Coolify Docker Compose `gs7mmdb0wzy1d5wgo10h7dib` (projet « Tools & Concepts »), mot de passe PostgreSQL généré par Coolify et retiré des arguments de build. TH-019 (rapport de consommation à chaque contribution et compteur public, #12 et #13). TH-015 (CI de sécurité : gitleaks, Trivy, audits, contrôle d'absence de SDK de LLM, #11) : rendre ses statuts obligatoires sur `main` reste au porteur. Ces missions sont à l'état `integrated` ; le retour à 30 jours reste à recueillir.

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
- Image : `Dockerfile` à la racine (api et web), `compose.yaml` (api, web, PostgreSQL) ; essai en CI par le workflow `image` (Docker indisponible sur le poste du porteur). L'étape d'exécution ne garde que `node` : npm, corepack et yarn de l'image de base en sont retirés (vulnérabilités de leurs dépendances embarquées).

## Sécurité et statuts requis (TH-015)

- Workflow `security`, à chaque PR et sur `main` : gitleaks sur les commits de la PR (valeurs masquées dans le journal) ; Trivy sur l'image `tokenhood-app` et sur le dépôt (échec sur une vulnérabilité HIGH ou CRITICAL corrigeable, et sur une mauvaise configuration HIGH ou CRITICAL des Dockerfile, comme l'absence de `USER` non root) ; `pnpm audit --prod` et `npm audit --omit=dev` pour chaque `package-lock.json` (échec dès `moderate`) ; contrôle d'absence de SDK de fournisseur de LLM, avec son auto-vérification sur une copie du dépôt où `openai` est ajouté.
- Images gitleaks et Trivy épinglées par version et par empreinte `sha256` dans `security.yml`, jamais par étiquette mobile (étiquettes de Trivy détournées en mars 2026). Pour les mettre à jour : version publiée depuis au moins deux semaines, empreinte relevée sur le registre.
- Contrôle LLM en local : `node tools/no-llm-sdk/check.mjs` ; tests : `node --test 'tools/no-llm-sdk/test/*.test.mjs'`. La liste des paquets interdits est en tête de `check.mjs`.

Statuts obligatoires sur `main` depuis le 18/10/2026 (protection de branche, source GitHub Actions, app 15368, branche à jour exigée) :

| Workflow | Statuts (noms des jobs) |
|---|---|
| `tokenhood` | `validation .tokenhood` |
| `ci` | `monorepo` |
| `image` | `compose` |
| `landing` | `test`, `image` |
| `security` | `gitleaks`, `trivy-image`, `trivy-repo`, `deps-audit`, `no-llm-sdk` |

- Un statut requis qu'aucun workflow de la PR ne produit la laisse bloquée (« Expected — Waiting for status to be reported ») : une PR ouverte sur une base antérieure à TH-015 doit être rebasée sur `main`.
- Aucun workflow requis ne filtre les PR par chemins (`paths:`), sinon les PR hors de ces chemins attendent le statut indéfiniment ; `landing` tourne donc sur toutes les PR.
- Renommer, ajouter ou supprimer un job requis change la liste des statuts : mettre à jour la protection de `main` dans la foulée. Ce réglage revient au porteur ; l'agent ne l'applique qu'avec son autorisation explicite (`gh api -X PUT repos/mathieu-kosmio/tokenhood/branches/main/protection`, règle de permission ajoutée par le porteur le 18/10/2026).

## Déploiement

- Coolify, déploiement automatique à chaque commit sur `main` (mis en place par Mathieu).
- Page publique au démarrage : `tokenhood.kosm.io`. Landing : build pack Dockerfile, base directory `/`, Dockerfile `/landing/Dockerfile`, port 8080, healthcheck `/healthz`.
- Plateforme : ressource Coolify Docker Compose depuis `compose.yaml`, domaines `app.tokenhood.kosm.io` (web:3000) et `api.tokenhood.kosm.io` (api:3000), mot de passe PostgreSQL généré par Coolify (`SERVICE_PASSWORD_POSTGRES`). DNS : enregistrements A chez Gandi vers 51.91.166.222.
- Plus de push direct sur `main` (protection active) : PR, CI au vert, revue croisée, approbation du porteur.

## Design

- Direction retenue : « Canopée Kosmio », satellite du design system Kosmio v2 « Horizon ».
- Tokens : `design/tokens.md`, classe `.kos-tokenhood` dans `design/tokenhood.css`, à charger après `design/kosmio.css` (copie du design system Kosmio, à ne pas modifier dans ce dépôt).
- Règles Kosmio : Lexend 500 pour les titres (jamais 700), Public Sans pour le corps, JetBrains Mono pour eyebrows et identifiants ; or #E8A33D et ciel #6BAED6 en aplat seulement (texte : #8A5A12, #38718F) ; teal < 10 % de la surface ; aucun dégradé sauf voile de hero ; 160 px entre sections ; rayons carte 16, champ 8, boutons en pastille ; filets 1 px #E3E4E1.
- Maquette de la landing validée en direction : `design/maquettes/landing.dc.html` (format Design Component : la mise en page et les textes FR/EN sont dans le fichier, le contenu bilingue est dans `renderVals()`). Planche de référence : `design/maquettes/planche-canopee-kosmio.dc.html`.
- Visuels en SVG faits main, pas d'image générée.

## Prochaines étapes

1. Plateforme en ligne sur app. et api.tokenhood.kosm.io (TH-018) ; landing sur tokenhood.kosm.io. Interface Coolify : http://51.91.166.222:8000, projet « Tools & Concepts ».
2. Porteur : formulaire Brevo et `BREVO_FORM_ACTION` ; catégories Discussions ; licence (`LICENSE`, README, `project.yaml`, FAQ de la landing).
3. Relire les textes de la landing, les pages légales et la traduction EN des spécifications (statut `machine`).
4. TH-015 (scans) en revue ; après sa fusion, le porteur rend obligatoires les statuts listés plus haut.
5. Missions suivantes : TH-004 et TH-005 (skills), TH-009 (contrats du protocole), TH-006, TH-010, TH-011 ; côté MVP, TH-102 (identité, OAuth GitHub, `packages/db` avec Drizzle) et le stockage S3 laissé hors de TH-013.

## Conventions de commit

- DCO : `git commit -s` ; trailer `Assisted-by: <client/modèle>`.
- **Rapport de consommation à chaque contribution** (`contributions.usage_report: required`) : un fichier `.tokenhood/usage/<date>-<mission>-<kind>.yaml` conforme à `schemas/usage-report.schema.json`, joint à la PR. Avec Claude Code : `node tools/usage/claude-code.mjs --transcript ~/.claude/projects/<dossier>/<session>.jsonl --mission TH-xxx --kind production --contributor <compte> --pr <n>` (fenêtres `--since`/`--until`/`--exclude` si la session couvre plusieurs missions). `counted` = input + cache_creation + output ; les lectures de cache sont déclarées mais non comptées. La CI refuse une mission intégrée sans rapport ; la landing affiche le total.
