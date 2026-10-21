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
- Décisions : `decisions/` (DEC-2026-001 direction artistique, DEC-2026-002 déploiement, DEC-2026-003 landing, DEC-2026-004 choix d'amorçage du skill contribute, DEC-2026-005 licences du dépôt, ADR-001 coordination et place de tokenpool, instruite par TH-006 et adoptée le 20/10/2026, ADR-002 stack proposée par TH-007)

## État au 21/10/2026

- Lot 0 (amorçage) en cours ; missions TH-001 à TH-029 publiées, 19 intégrées ; suites TH-021 à TH-029 publiées par la PR #31. Lot 1 : TH-101 et TH-102 intégrées ; contrats TH-103, TH-105, TH-109 et TH-114 publiés (PR #28), sans `priority` ; TH-116 publiée en `draft` (PR #31), passée à `open` en version 2 avec les dépendances TH-102 et TH-114 (PR #36) ; TH-110 et TH-115 ont leurs dépendances intégrées mais pas encore de contrat. Réservables : TH-012, TH-021 à TH-025, TH-027 à TH-029, TH-103, TH-105, TH-109 et TH-114 ; TH-026 attend TH-022 ; TH-116 attend TH-114. Aucune mission en cours ni réservée au 21/10/2026.
- Dépôt public. Licences (DEC-2026-005, PR #30) : AGPL-3.0-only pour la plateforme et le reste du dépôt, Apache-2.0 pour `schemas/`, `examples/`, `skills/` et `tools/usage/`, CC BY 4.0 pour `docs/` et `decisions/` ; un fichier `LICENSE` par couche.
- Dépôt réglé : description, site, sujets, labels, Discussions activées. Les catégories Clarifications, Décisions, Propositions restent à créer dans l'interface GitHub (aucune API).
- `main` protégée : PR obligatoire (y compris pour les administrateurs), historique linéaire (fusion en rebase ou squash), conversations résolues, ni force-push ni suppression. Zéro approbation requise tant que le porteur est seul mainteneur ; depuis le 18/10/2026, les 10 statuts de CI listés plus bas sont requis et la branche doit être à jour avec `main` avant fusion.
- La fusion des PR revient au porteur. Le 18/10/2026, il a autorisé l'agent à fusionner la file en rebase après CI verte, puis, au cas par cas, TH-004 (PR #16) et son passage à `integrated`, et le 19/10/2026 TH-005 (PR #18) et TH-020 (PR #19) avec leur passage à `integrated`, et le 20/10/2026 la file des PR #22 à #29 avec le passage à `integrated` des missions concernées, puis la PR #32 (TH-006 intégrée, ADR-001 adoptée), puis la PR #30 (licences, DEC-2026-005) et la PR #31 (contrats TH-021 à TH-029) ; sans autorisation explicite, l'agent prépare, vérifie et documente, il ne fusionne pas.

### Intégré sur `main` le 18/10/2026

TH-001 (spécifications, PR #2), TH-002 (schémas, #3), TH-003 (CI de validation, #4), TH-007 et ADR-002 adoptée (#5), TH-017 (landing, #1), TH-101 (monorepo, #6), TH-013 (image et compose, #7). TH-018 (déploiement de la plateforme, #9) : https://app.tokenhood.kosm.io et https://api.tokenhood.kosm.io en ligne, ressource Coolify Docker Compose `gs7mmdb0wzy1d5wgo10h7dib` (projet « Tools & Concepts »), mot de passe PostgreSQL généré par Coolify et retiré des arguments de build. TH-019 (rapport de consommation à chaque contribution et compteur public, #12 et #13). TH-015 (CI de sécurité : gitleaks, Trivy, audits, contrôle d'absence de SDK de LLM, #11), statuts requis sur `main` depuis le 18/10/2026. TH-004 (skill `tokenhood-contribute` v0, #16). Ces missions sont à l'état `integrated` ; le retour à 30 jours reste à recueillir.

### Intégré sur `main` le 19/10/2026

TH-005 (skill `tokenhood-verify` v0, #18), TH-020 (page « Feuille de route » de la landing, #19). Les six réponses par défaut de la PR #18 (conduite `continue`) sont acceptées avec la fusion.

### Intégré sur `main` le 20/10/2026

Fusionnées en rebase, une par une, après mise à jour sur `main` et CI verte :

- TH-008 (#23) : `docs/specs/garanties.md` version 1, 33 promesses classées garantie, dépendante du client ou déclarative, et registre de compatibilité initial.
- TH-009 (#24) : contrats exécutables du protocole, `docs/specs/protocole.md`, `schemas/protocole/machine.yaml` et `conformite.yaml` (85 cas), schémas `protocol*.schema.json` ; rédigé avant l'adoption d'ADR-001, à confronter à la décision (génération, plafond de durée, idempotence, sémantique de soumission, place de la file préparée de tokenpool).
- TH-010 (#25) : protocole de la campagne pilote, `docs/pilote/` (protocole, retour à 30 jours, gabarit du rapport de campagne, journal).
- TH-011 (#26) : charte opérationnelle d'amorçage, `docs/charte/`, FR et EN.
- TH-016 (#27) : gabarits du dépôt, `CONTRIBUTING.md` FR et EN à parité, code de conduite, modèles d'issue et de PR.
- TH-014 (#29) : runbook Coolify, `docs/exploitation/`, FR et EN.
- Contrats du lot 1 (#28) : TH-102, TH-103, TH-105, TH-109, TH-114.
- TH-006 (#22, audit de tokenpool, dossier d'options et ADR-001 ; passage à `integrated` par #32). ADR-001 adoptée par le porteur, option B : réimplémentation compatible, sans reprise du code de tokenpool. Le module de coordination (TH-202, `packages/core`) aligne ses mécanismes de réservation sur tokenpool (mise à jour conditionnelle, preuve opaque, bail de 600 s renouvelé par heartbeat) et y ajoute générations, plafond `max_lease_minutes`, `Idempotency-Key`, états de soumission et de revue ; une façade compatible tokenpool, limitée au périmètre réservation, fait l'objet d'une mission S distincte, reportable à la porte du lot 2. Les trois réponses par défaut de la PR #22 (conduite `continue`) sont acceptées avec la fusion.

### Intégré sur `main` le 21/10/2026

TH-102 (#34, passage à `integrated` par #35) : identité (OAuth GitHub, profil, langues), socle de données `packages/db` (Drizzle, migrations, service `migrate`), conventions de module (voir « Plateforme »). La connexion reste indisponible en production (constaté le 21/10/2026 sur `/login`) tant que l'application OAuth GitHub et les variables Coolify ne sont pas en place (voir « Déploiement »).

## Landing (`landing/`)

- Site statique sans framework, servi par nginx non root ; mode d'emploi complet dans `landing/README.md`.
- Commandes : `cd landing && npm ci && npm test` ; `npm run build && npm run serve` pour prévisualiser sur le port 4173.
- Textes : `landing/locales/<lang>/*.json` uniquement ; le test refuse toute chaîne visible absente des locales et toute divergence de structure FR/EN.
- Formulaire : Brevo hébergé, URL dans la variable de build `BREVO_FORM_ACTION` ; sans elle, repli sur GitHub Discussions.
- Feuille de route (`/feuille-de-route/`, `/en/roadmap/`, TH-020) : générée au build depuis le plan de développement, les contrats, les rapports de consommation et `decisions/` ; résumé fonctionnel FR/EN de chaque mission dans `landing/locales/<lang>/roadmap.json` ; au plus trois prochaines missions (`open`, dépendances satisfaites, classées par `priority`), chacune avec un bouton « Contribuer » vers une discussion GitHub préremplie. Règles détaillées dans `landing/README.md`.

## Plateforme (monorepo, ADR-002)

- pnpm 12 via corepack (`corepack enable`, version fixée par `packageManager`), Node 22, TypeScript 6 (SvelteKit 3 ne suit pas encore TypeScript 7).
- `pnpm install`, puis `pnpm check` (lint, build, typecheck, tests) ; `pnpm dev:api`, `pnpm dev:web`.
- `locales/<lang>.json` (messages communs) et `locales/<lang>/<module>.json` (un fichier par module, clés préfixées « <module>. ») (ICU) : seule source des chaînes de l'API et du web ; `packages/i18n` les fusionne, refuse une clé définie deux fois et vérifie la parité des clés et des arguments à chaque build.
- Conventions de module (TH-102) : `packages/core/README.md` fait foi. Schéma `packages/db/src/schema/<module>.ts`, règles `packages/core/src/<module>/`, routes `apps/api/src/routes/<module>/` (chargées sans liste centrale), acteur `apps/api/src/auth/`, rubriques `apps/web/src/routes/account/<rubrique>/` (avec `rubrique.ts`), messages `locales/<lang>/<module>.json`, tests à côté du code. Autorisations dans la couche métier (`operation()`, `authorize()` de `@tokenhood/core/common`) : agents refusés par défaut, inscription complète exigée par défaut, rôle administrateur provisoire jusqu'à TH-104.
- Données (TH-102) : PostgreSQL 16, Drizzle ORM 0.45 et drizzle-kit 0.31 ; `pnpm db:generate` après une modification du schéma, jamais de retouche d'une migration générée ; migration inverse facultative dans `packages/db/migrations/down/` (`pnpm db:rollback`), procédure dans `packages/db/README.md`. Le schéma `exploitation` (runbook) reste hors de l'application. Journal `audit_events` en ajout seul (déclencheurs de la migration 0001).
- Tests : `pnpm test` sans base ; `TEST_DATABASE_URL=postgres://tokenhood:tokenhood@localhost:5432/tokenhood_test pnpm test:integration` (une base éphémère par fichier de test ; en CI, service PostgreSQL 16 du job `monorepo`). GitHub simulé : `@tokenhood/core/identity/testing`.
- Identité (TH-102) : OAuth GitHub côté API (`/v1/auth/github/start`, rappel `/v1/auth/github/callback`), état à usage unique lié au navigateur, PKCE S256, portée `read:user user:email`, compte rattaché à l'identifiant numérique GitHub, jeton GitHub révoqué et jamais conservé, aucune adresse email conservée. Session : jeton opaque haché (HMAC avec `SESSION_SECRET`), cookie `th_session` HttpOnly, SameSite=Lax, Secure en production, domaine `SESSION_COOKIE_DOMAIN` partagé par `app.` et `api.`, 14 jours. Le web relaie le cookie à l'API (`API_URL`) ; une inscription incomplète ne donne accès qu'à `/registration`. Rôle administrateur : `node apps/api/dist/cli/admin.js grant --github-id <id>` (ou `grant <login-github>`, refusé si ambigu) dans le conteneur api. Un `?lang=` ne modifie le profil que depuis l'interface (`Sec-Fetch-Site` same-origin ou none).
- SvelteKit 3 et adapter-node 6 ne lisent plus `ORIGIN` : l'origine vient de `PROTOCOL_HEADER` et `HOST_HEADER` (posés dans `compose.yaml` pour le proxy de Coolify), `https` par défaut. En http local par le compose, les formulaires sont refusés par le contrôle d'origine : `pnpm dev:web` pour les essayer.
- Scripts d'installation des dépendances refusés (`allowBuilds`) ; politique d'âge minimal des versions de pnpm à respecter (épingler une version plus ancienne plutôt qu'ajouter une exception).
- Image : `Dockerfile` à la racine (migrate, api et web), `compose.yaml` (migrate à exécution unique, api, web, PostgreSQL ; api et web attendent `migrate` en `service_completed_successfully`) ; essai en CI par le workflow `image` (Docker indisponible sur le poste du porteur). L'étape d'exécution ne garde que `node` : npm, corepack et yarn de l'image de base en sont retirés (vulnérabilités de leurs dépendances embarquées).

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

## Skills plateforme (`skills/`)

- `skills/tokenhood-contribute/` (TH-004, version 0.1.0, en français ; référence à lister dans une mission : `tokenhood-contribute@0.1`) : protocole de l'agent contributeur en mode amorçage et plateforme, règle de conduite `continue` / `switch_mission` / `stop`, règles de sécurité et balise `<contenu-non-fiable source="…">`. Le `README.md` du skill explique l'installation.
- Choix retenus pour TH-004 en amorçage (PR #16, confirmés le 19/10/2026 par DEC-2026-004) : skill en français seul (traduction EN par une mission `i18n`) ; réservation par une discussion « Réservation TH-xxx » faute d'issue de mission ; `raised_by: {kind: human}` pour une demande d'arbitrage.
- Les missions ouvertes déclarent `skills: [tokenhood-contribute@0.1]` ; une nouvelle mission le déclare aussi. Les contrats déjà intégrés gardent `skills: []`.
- `skills/tokenhood-verify/` (TH-005, version 0.1.0, en français ; référence : `tokenhood-verify@0.1`) : protocole de l'agent vérificateur, éligibilité, rapport à périmètre déclaré (vérifié, non vérifié, incertain) conforme à `schemas/review-report.schema.json`, invalidation après modification, ni fusion ni approbation.
- Les deux skills sont actifs dans ce dépôt : liens `.claude/skills/<nom>` vers `skills/<nom>` (`.claude/` est exclu localement : `git add -f` pour un nouveau lien). Le workflow `tokenhood` exige un lien par dossier de `skills/`.
- Tests : `(cd tools/validate && npm ci --ignore-scripts)` puis `node --test 'skills/*/tests/*.test.mjs'` ; ils tournent en CI dans le job `validation .tokenhood`.
- Choix retenus pour TH-005 en amorçage (PR #18) : identifiants dérivés de la PR (`att_pr057`, `SUB-057`, `agt_<compte sans tiret>`) ; revue GitHub de type commentaire seulement, verdict dans le rapport YAML ; rapport de consommation du vérificateur dans une PR distincte ; trois contrôles fixes ajoutés aux `criteria` (périmètre, commandes d'acceptation, règles de contribution) ; le vérificateur décline faute de moyens plutôt que de rendre un verdict ; skill en français seul. À revoir avec TH-009 et TH-301.

## Déploiement

- Coolify, déploiement automatique à chaque commit sur `main` (mis en place par Mathieu).
- Page publique au démarrage : `tokenhood.kosm.io`. Landing : build pack Dockerfile, base directory `/`, Dockerfile `/landing/Dockerfile`, port 8080, healthcheck `/healthz`.
- Plateforme : ressource Coolify Docker Compose depuis `compose.yaml`, domaines `app.tokenhood.kosm.io` (web:3000) et `api.tokenhood.kosm.io` (api:3000), mot de passe PostgreSQL généré par Coolify (`SERVICE_PASSWORD_POSTGRES`). Depuis TH-102 : `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` et `SESSION_SECRET` à renseigner dans Coolify (application OAuth GitHub, adresse de rappel `https://api.tokenhood.kosm.io/v1/auth/github/callback`) ; sans eux, connexion indisponible. DNS : enregistrements A chez Gandi vers 51.91.166.222.
- Plus de push direct sur `main` (protection active) : PR, CI au vert, revue croisée, approbation du porteur.

## Design

- Direction retenue : « Canopée Kosmio », satellite du design system Kosmio v2 « Horizon ».
- Tokens : `design/tokens.md`, classe `.kos-tokenhood` dans `design/tokenhood.css`, à charger après `design/kosmio.css` (copie du design system Kosmio, à ne pas modifier dans ce dépôt).
- Règles Kosmio : Lexend 500 pour les titres (jamais 700), Public Sans pour le corps, JetBrains Mono pour eyebrows et identifiants ; or #E8A33D et ciel #6BAED6 en aplat seulement (texte : #8A5A12, #38718F) ; teal < 10 % de la surface ; aucun dégradé sauf voile de hero ; 160 px entre sections ; rayons carte 16, champ 8, boutons en pastille ; filets 1 px #E3E4E1.
- Maquette de la landing validée en direction : `design/maquettes/landing.dc.html` (format Design Component : la mise en page et les textes FR/EN sont dans le fichier, le contenu bilingue est dans `renderVals()`). Planche de référence : `design/maquettes/planche-canopee-kosmio.dc.html`.
- Visuels en SVG faits main, pas d'image générée.

## Prochaines étapes

1. Plateforme en ligne sur app. et api.tokenhood.kosm.io (TH-018) ; landing sur tokenhood.kosm.io. Interface Coolify : http://51.91.166.222:8000, projet « Tools & Concepts ».
2. Porteur : formulaire Brevo et `BREVO_FORM_ACTION` ; catégories Discussions (puis `contribute.discussionCategory` de `landing/site.config.json`, `general` en attendant) ; watch paths Coolify de la landing complétés par `docs/specs/plan-de-developpement.md` et `decisions/**`.
3. Suites d'ADR-001 : confronter TH-009 à la décision (voir plus haut) ; mission S « façade compatible tokenpool » à ajouter au plan du lot 2 et au backlog, par une mission de mise à jour du plan ; qualificatif « éprouvé » du protocole de tokenpool à corriger dans `docs/specs/coordination.md` (FR et EN), par TH-029 (PR #31) ; décision du porteur sur l'instance tokenpool d'amorçage (catégorie 1 ; licence choisie par DEC-2026-005), puis `CONTRIBUTING.md` et TH-210 selon la voie retenue.
4. Relire les textes de la landing, les pages légales et la traduction EN des spécifications et de la charte (statut `machine`).
5. Missions suivantes : l'application OAuth GitHub et les variables Coolify (porteur), pour ouvrir la connexion livrée par TH-102 ; TH-103, TH-105, TH-109 et TH-114, réservables depuis l'intégration de TH-102, puis TH-116 après TH-114 ; contrats de TH-110 et TH-115 à rédiger ; TH-012 (projet externe pilote) ; suites du lot 0 TH-021 à TH-029 (feuille de route : TH-012, TH-021, TH-022 en tête, faute de `priority`) ; le stockage S3 laissé hors de TH-013.

## Conventions de commit

- DCO : `git commit -s` ; trailer `Assisted-by: <client/modèle>`.
- **Rapport de consommation à chaque contribution** (`contributions.usage_report: required`) : un fichier `.tokenhood/usage/<date>-<mission>-<kind>.yaml` conforme à `schemas/usage-report.schema.json`, joint à la PR. Avec Claude Code : `node tools/usage/claude-code.mjs --transcript ~/.claude/projects/<dossier>/<session>.jsonl --mission TH-xxx --kind production --contributor <compte> --pr <n>` (fenêtres `--since`/`--until`/`--exclude` si la session couvre plusieurs missions). `counted` = input + cache_creation + output ; les lectures de cache sont déclarées mais non comptées. La CI refuse une mission intégrée sans rapport ; la landing affiche le total.
