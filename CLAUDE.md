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
- Décisions : `decisions/` (DEC-2026-001 direction artistique, DEC-2026-002 déploiement)

## État au 17/10/2026

- Lot 0 (amorçage) en cours ; missions TH-001 à TH-016 publiées.
- Dépôt public, licence non encore choisie (AGPL-3.0 proposée).
- Stack proposée (à confirmer par ADR-002 / TH-007) : TypeScript, Node 22, monorepo pnpm, Fastify, PostgreSQL + Drizzle, SDK MCP TypeScript, SvelteKit, i18n ICU (FormatJS).

## Déploiement

- Coolify, déploiement automatique à chaque commit sur `main` (mis en place par Mathieu).
- Page publique au démarrage : `tokenhood.kosm.io`.
- Jamais de push direct sur `main` hors amorçage : PR, CI au vert, revue croisée, approbation du porteur.

## Design

- Direction retenue : « Canopée Kosmio », satellite du design system Kosmio v2 « Horizon ».
- Tokens : `design/tokens.md`, classe `.kos-tokenhood` dans `design/tokenhood.css` (charger `kosmio.css` avant).
- Règles Kosmio : Lexend 500 pour les titres (jamais 700), Public Sans pour le corps, JetBrains Mono pour eyebrows et identifiants ; or #E8A33D et ciel #6BAED6 en aplat seulement (texte : #8A5A12, #38718F) ; teal < 10 % de la surface ; aucun dégradé sauf voile de hero ; 160 px entre sections ; rayons carte 16, champ 8, boutons en pastille ; filets 1 px #E3E4E1.
- Maquette de la landing validée en direction : `design/maquettes/landing.dc.html` (format Design Component : la mise en page et les textes FR/EN sont dans le fichier, le contenu bilingue est dans `renderVals()`). Planche de référence : `design/maquettes/planche-canopee-kosmio.dc.html`.
- Visuels en SVG faits main, pas d'image générée.

## Prochaines étapes

1. Ajouter `LICENSE` une fois la licence décidée, mettre à jour README et `.tokenhood/project.yaml`.
2. Intégrer la landing (statique, FR/EN) pour un premier déploiement sur tokenhood.kosm.io.
3. Régler le dépôt : description, site, sujets, Discussions (Clarifications, Décisions, Propositions), labels de `.github/labels.yml`, protection de `main`.
4. Points ouverts landing : destination du formulaire d'inscription et mention RGPD ; relecture des textes (coût, licence).

## Conventions de commit

- DCO : `git commit -s` ; trailer `Assisted-by: <client/modèle>`.
