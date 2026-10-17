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

- Spécifications V2.1 : https://claude.ai/code/artifact/70f6540c-17f9-4d27-95dd-8b33017cf7d2 (à verser dans `docs/specs/` par TH-001)
- Plan de développement (56 missions, 5 lots) : https://claude.ai/code/artifact/c4fd5cb0-43b3-487d-a5a8-b98bf86c0a94
- Décisions : `decisions/` (DEC-2026-001 direction artistique, DEC-2026-002 déploiement, DEC-2026-003 landing)

## État au 17/10/2026

- Lot 0 (amorçage) en cours ; missions TH-001 à TH-016 publiées, TH-017 (landing) réservée et livrée en PR.
- Dépôt public, licence non encore choisie (AGPL-3.0 proposée).
- Dépôt réglé : description, site, sujets, labels, Discussions activées. Les catégories Clarifications, Décisions, Propositions restent à créer dans l'interface GitHub (aucune API).
- `main` protégée : PR obligatoire (y compris pour les administrateurs), historique linéaire, conversations résolues, ni force-push ni suppression. Zéro approbation requise tant que le porteur est seul mainteneur ; aucun statut de CI requis avant TH-003 / TH-015.
- Stack proposée (à confirmer par ADR-002 / TH-007) : TypeScript, Node 22, monorepo pnpm, Fastify, PostgreSQL + Drizzle, SDK MCP TypeScript, SvelteKit, i18n ICU (FormatJS).

## Landing (`landing/`)

- Site statique sans framework, servi par nginx non root ; mode d'emploi complet dans `landing/README.md`.
- Commandes : `cd landing && npm ci && npm test` ; `npm run build && npm run serve` pour prévisualiser sur le port 4173.
- Textes : `landing/locales/<lang>/*.json` uniquement ; le test refuse toute chaîne visible absente des locales et toute divergence de structure FR/EN.
- Formulaire : Brevo hébergé, URL dans la variable de build `BREVO_FORM_ACTION` ; sans elle, repli sur GitHub Discussions.

## Déploiement

- Coolify, déploiement automatique à chaque commit sur `main` (mis en place par Mathieu).
- Page publique au démarrage : `tokenhood.kosm.io`. Landing : build pack Dockerfile, base directory `/`, Dockerfile `/landing/Dockerfile`, port 8080, healthcheck `/healthz`.
- Plus de push direct sur `main` (protection active) : PR, CI au vert, revue croisée, approbation du porteur.

## Design

- Direction retenue : « Canopée Kosmio », satellite du design system Kosmio v2 « Horizon ».
- Tokens : `design/tokens.md`, classe `.kos-tokenhood` dans `design/tokenhood.css`, à charger après `design/kosmio.css` (copie du design system Kosmio, à ne pas modifier dans ce dépôt).
- Règles Kosmio : Lexend 500 pour les titres (jamais 700), Public Sans pour le corps, JetBrains Mono pour eyebrows et identifiants ; or #E8A33D et ciel #6BAED6 en aplat seulement (texte : #8A5A12, #38718F) ; teal < 10 % de la surface ; aucun dégradé sauf voile de hero ; 160 px entre sections ; rayons carte 16, champ 8, boutons en pastille ; filets 1 px #E3E4E1.
- Maquette de la landing validée en direction : `design/maquettes/landing.dc.html` (format Design Component : la mise en page et les textes FR/EN sont dans le fichier, le contenu bilingue est dans `renderVals()`). Planche de référence : `design/maquettes/planche-canopee-kosmio.dc.html`.
- Visuels en SVG faits main, pas d'image générée.

## Prochaines étapes

1. Ajouter `LICENSE` une fois la licence décidée, mettre à jour README, `.tokenhood/project.yaml` et la FAQ de la landing.
2. Fusionner la PR TH-017, créer l'application Coolify de la landing (réglages dans `landing/README.md`), vérifier tokenhood.kosm.io.
3. Créer le formulaire Brevo (liste « Tokenhood », double opt-in) et renseigner `BREVO_FORM_ACTION`.
4. Créer les catégories Discussions : Clarifications, Décisions, Propositions.
5. Relire les textes de la landing (coût, licence) et les pages légales (sous-traitants, conservation).
6. Enchaîner les missions sans dépendance : TH-001 (débloque TH-002, TH-007, TH-008, TH-016), TH-006, TH-010, TH-011.

## Conventions de commit

- DCO : `git commit -s` ; trailer `Assisted-by: <client/modèle>`.
