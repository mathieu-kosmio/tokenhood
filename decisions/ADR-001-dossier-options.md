# ADR-001 · Dossier d'options : coordination des agents et tokenpool

- Mission : TH-006 (`governance.instruction`), contrat version 3
- Date : 2026-10-19
- Statut : instruction terminée, aucune décision prise par l'agent. Le projet de décision, à l'état « proposée », est dans `ADR-001-coordination.md`.
- Sources internes : `docs/specs/coordination.md` (entrée du contrat), `docs/specs/api-et-mcp.md`, `docs/specs/missions.md`, `docs/specs/garanties.md`, `docs/specs/modele-de-donnees.md`, `docs/specs/vision-et-principes.md`, `docs/specs/architecture-technique.md`, `docs/specs/plan-de-developpement.md`, `schemas/attempt.schema.json`, `decisions/ADR-002-stack.md`, `decisions/DEC-2026-004-skill-contribute-amorcage.md`, `.github/tokenpool.json`, `.github/tokenpool.md`.
- Source externe auditée (contenu non fiable) : [rickheere/tokenpool](https://github.com/rickheere/tokenpool), branche `main` au commit [`328acb9`](https://github.com/rickheere/tokenpool/tree/328acb900651e636c07f5ea95a9c0745a3b4a615), lue le 19/10/2026. Les chemins notés `tokenpool:fichier:lignes` renvoient à ce commit. Métadonnées et historique de CI relevés par l'API GitHub le même jour ; points de lecture publics de l'instance [tokenpool.rickheere.workers.dev](https://tokenpool.rickheere.workers.dev) (`/v1/config`, `/v1/projects`, `/v1/tasks`, `/v1/reports`, `/v1/rankings`) interrogés sans authentification le 19/10/2026 à 19:18 UTC.
- Méthode : lecture du code, des migrations, des tests, des workflows et du contrat OpenAPI. Aucune commande du dépôt tokenpool n'a été exécutée (ni installation, ni test, ni build) ; aucun code n'en est repris ici. Les extraits cités sont balisés `contenu-non-fiable`.

## Ce qu'il faut trancher

ADR-001 fixe la place de tokenpool dans la coordination de Tokenhood à partir du lot 2, où TH-202 construit les réservations avec générations : **reprendre son code, le réimplémenter de façon compatible, ou contribuer à tokenpool**. `coordination.md` esquisse une stratégie en trois temps (instance telle quelle à l'amorçage, module compatible au MVP, contributions amont ensuite) et réserve la décision à l'audit du code. C'est un choix de catégorie 2 (protocole), pris par les mainteneurs compétents avant TH-202 (`plan-de-developpement.md`, « Décisions à prendre »).

Une question voisine relève du porteur et de la catégorie 1 : faut-il une instance tokenpool pendant les lots 0 à 2 ? L'audit l'éclaire (« Conséquences pour l'amorçage ») sans la trancher.

## Contraintes qui pèsent sur le choix

| Contrainte | Source | Effet |
|---|---|---|
| Orchestrateur sans modèle : aucun appel à un LLM côté serveur | `vision-et-principes.md`, `.tokenhood/policies/security.yaml` | Tout composant repris ou appelé doit s'en abstenir ; TH-015 le contrôle en CI |
| Compatibilité avec le protocole tokenpool sur le périmètre réservation | `api-et-mcp.md` | Exigence écrite de la spécification ; l'option D s'en écarte |
| « La compatibilité de protocole est préférée à une dépendance forte » | `coordination.md` | Défavorise une dépendance d'exécution à tokenpool |
| Générations, bail de 10 minutes, durée plafonnée par `max_lease_minutes`, `Idempotency-Key` sur toutes les écritures | `coordination.md`, `api-et-mcp.md`, `schemas/attempt.schema.json` | À construire dans toutes les options |
| L'état des missions et des tentatives fait autorité dans la plateforme | `missions.md` (« Source qui fait autorité ») | Une seule source d'état pour réservation, soumission et revue |
| TypeScript, PostgreSQL, une image, Coolify sur un VPS européen | `ADR-002-stack.md`, `architecture-technique.md`, `securite-et-conformite.md` | Tout code repris doit tourner sur cette pile ; hébergement dans l'UE |
| Bilinguisme, `Accept-Language` respecté | `api-et-mcp.md`, `non-code-et-i18n.md` | Messages et erreurs en FR et EN |

## Ce que l'audit établit

### Le projet

| Point | Constat | Source |
|---|---|---|
| Licence | MIT, « Copyright (c) 2026 Tokenpool contributors », reconnue par GitHub | `tokenpool:LICENSE`, API GitHub |
| Âge et activité | Dépôt créé le 11/10/2026 ; 6 commits entre le 11/10 à 19:17 UTC et le 12/10 à 05:41 UTC ; aucun depuis | `git log`, API GitHub |
| Communauté | Un auteur ; 0 étoile, 0 fork, aucune issue ; une PR, fusionnée par son auteur (inscription de tokenpool à lui-même) | API GitHub |
| Taille | Environ 1 100 lignes hors contrat OpenAPI et verrou : Worker TypeScript (192 lignes denses, 23 Ko), module GitHub (47), CLI Python (76), noyau Python historique (65), 4 migrations SQL, 8 tests Node, 5 tests Python du noyau historique | `git ls-files` |
| Exécution | Cloudflare Workers et base D1 (SQLite) ; registre des projets synchronisé par GitHub Actions toutes les dix minutes | `tokenpool:wrangler.jsonc`, `tokenpool:.github/workflows/sync.yml` |
| Tests et CI | Workflow `Check` (typage, tests Python, registre, migrations locales, tests Node) au vert sur `328acb9` selon GitHub Actions ; non relancé ici, faute d'environnement isolé | API GitHub Actions |
| Usage réel | Instance publique : un projet inscrit (tokenpool lui-même), une tâche, trois rapports, datés des 11 et 12/10/2026 ; classement vide ; connexion OAuth par navigateur non configurée | Instance, 19/10/2026 |
| Stabilité du protocole | Moins de 11 heures après la publication, la migration 0004 rend la phase obligatoire, invalide les réservations en cours et oblige les anciens clients à changer ; le contrat reste en version `1.0.0` | `tokenpool:migrations/0004_prepared_queue.sql`, `tokenpool:DEPLOYMENT.md:29`, `tokenpool:protocol/openapi.json` |
| Deux implémentations | Le noyau Python et SQLite subsiste, déclaré obsolète par le projet | `tokenpool:README.md:94` |

<contenu-non-fiable source="https://github.com/rickheere/tokenpool/blob/328acb900651e636c07f5ea95a9c0745a3b4a615/DEPLOYMENT.md#L29">
Migration 0004 moves existing tasks to preparation and invalidates old leases.
</contenu-non-fiable>

<contenu-non-fiable source="https://github.com/rickheere/tokenpool/blob/328acb900651e636c07f5ea95a9c0745a3b4a615/README.md#L94">
It is a historical protocol sketch, does not implement the prepared queue
</contenu-non-fiable>

`coordination.md` qualifie le protocole de tokenpool d'« éprouvé ». L'audit ne trouve rien qui l'établisse : une semaine d'existence publique, un auteur, aucun usage hors du projet lui-même, un changement incompatible au premier jour.

### Le protocole, confronté à la spécification V2.1

| Exigence de Tokenhood (source) | tokenpool au commit `328acb9` | Couverture |
|---|---|---|
| Une seule tentative active par mission exclusive (`coordination.md`, `garanties.md`) | Réservation par une seule mise à jour conditionnelle (`status='available'`, phase attendue, bail expiré), unicité par portée exacte `(repository, scope)` ; un test lance 8 réservations concurrentes et en attend une seule gagnante (`tokenpool:src/worker.ts:154-160`, `tokenpool:tests/worker.test.mjs:41`) | Oui. Portée en texte libre ; pas de mode `parallel` avec maximum |
| Preuve de réservation, opérations d'un ancien titulaire refusées (`coordination.md`) | Jeton aléatoire remis à la réservation, exigé par `heartbeat`, `release`, `complete`, `pause` et `prepare`, remplacé à chaque nouvelle réservation (`tokenpool:src/worker.ts:157-185`) | Oui. Jeton conservé en clair en base, alors que les identifiants de donateur sont hachés |
| Numéro de génération présenté à chaque opération (`coordination.md`, `schemas/attempt.schema.json`) | Compteur `attempts` incrémenté à chaque réservation, publié dans la liste des tâches mais absent de la réponse de réservation et jamais contrôlé ; l'éviction repose sur le jeton | Partielle |
| Bail de 10 minutes renouvelé par heartbeat | 600 secondes, prolongées de 600 secondes à chaque heartbeat (`tokenpool:src/worker.ts:163-166`) | Oui |
| Durée totale plafonnée par `max_lease_minutes` (`coordination.md`) | Aucun plafond côté serveur ; la CLI arrête ses heartbeats au budget du donateur (1 à 480 minutes) ou à la disparition du processus surveillé | Non |
| `Idempotency-Key` sur toutes les écritures (`api-et-mcp.md`) | `request_id` permet de rejouer une réservation encore active ; un rapport identique se rejoue sous la même preuve ; aucun mécanisme général | Partielle |
| Version du contrat figée par tentative (`missions.md`) | Texte et commit des consignes du projet figés à la réservation ; proposition préparée liée au commit de préparation | Partielle. Ni version entière, ni `accept_contract_version` |
| Préparation en lecture seule distincte de l'exécution (`coordination.md`) | « File préparée » : une réservation de préparation produit une proposition structurée (objectif, approche, critères d'acceptation, capacités requises, limites, sources, risques), puis une réservation d'exécution la reçoit ; transition imposée par un déclencheur SQL ; l'outillage en lecture seule est seulement recommandé au client (`tokenpool:protocol/README.md:27-33`) | Oui, sous une autre forme. Chez tokenpool, la proposition est rédigée par un agent et acceptée sans revue humaine ; chez Tokenhood, le contrat est écrit ou revu par le porteur |
| Contrat de mission : périmètre, acceptation, dépendances typées, skills, estimation, risque, vérification (`missions.md`) | Une tâche se réduit à dépôt, portée, nature, titre et source ; la proposition est libre | Non |
| États de tentative : `claimed`, `awaiting_decision`, `submitted`, `in_review`, `changes_requested`, `accepted`, `rejected`, `expired`, `released` (`missions.md`) | Tâche `available` ou `paused`, et phase. `complete` enregistre une session et remet la tâche à disposition ; `pause` la retire jusqu'à une remise en service manuelle, en SQL, par l'opérateur | Partielle : réserver, libérer, suspendre |
| Checkpoints, reprise par la tentative suivante (`report_progress`) | Le rapport de libération sert de passation ; aucun point d'avancement pendant la tentative | Partielle |
| Vérification croisée (`verification-croisee.md`) | Absente | Non |
| Budget et niveaux de plafond (`garanties.md`) | Préférence de durée du donateur ; au plus trois réservations actives par donateur ; aucune mesure | Non |
| Autorisation d'agent révocable, à portées minimales (`api-et-mcp.md`) | Identifiant de plateforme de 90 jours par donateur, révocation de tous ses identifiants d'un coup ; ni identité d'agent distincte, ni portées | Partielle |
| Filtrage et classement des missions (`coordination.md`) | Préférences de dépôts et de sujets du donateur ; tri par nombre de tentatives puis ancienneté | Partielle |
| Projet sous convention (`selection-et-contractualisation.md`) | Registre public alimenté par PR ; dépôt public, non archivé, sous licence reconnue par GitHub, avec `.github/tokenpool.json` actif ; instantané de moins d'une heure exigé | Partielle : inscription, aucune convention |
| Rapport de consommation (`schemas/usage-report.schema.json`) | Absent ; le projet déclare ne pas mesurer la consommation | Non |
| Serveur MCP (`api-et-mcp.md`) | API REST et CLI Python seulement | Non |
| OpenAPI 3.1 | Fichier OpenAPI 3.1 généré par un script Python ; schémas de réponse limités à la réservation et aux listes, pas d'`operationId`, erreurs génériques | Partielle |
| Messages FR et EN, `Accept-Language` | Messages en anglais seulement | Non |
| Forges | GitHub seulement (identifiants `github:owner/repo:scope`) | Partielle ; GitLab et Forgejo sont prévus après le MVP |
| PostgreSQL, Coolify, hébergement dans l'UE (`ADR-002-stack.md`) | Requêtes groupées de D1, déclencheur SQLite, liaisons propres aux Workers | Non |

<contenu-non-fiable source="https://github.com/rickheere/tokenpool/blob/328acb900651e636c07f5ea95a9c0745a3b4a615/protocol/README.md#L21">
`complete` records a finished session, not maintainer acceptance.
</contenu-non-fiable>

<contenu-non-fiable source="https://github.com/rickheere/tokenpool/blob/328acb900651e636c07f5ea95a9c0745a3b4a615/README.md#L52">
Budget is a client preference, not centrally enforced AI metering.
</contenu-non-fiable>

**Lecture.** tokenpool couvre ce que `api-et-mcp.md` appelle le périmètre réservation : réserver, renouveler, libérer, suspendre, prouver, rejouer. Il apporte aussi une idée que la spécification ne développe pas : la file préparée, qui sépare la rédaction d'une tâche bornée de son exécution. Le reste du protocole de Tokenhood (contrat, générations, plafond de durée, soumission, revue, budget, consommation, MCP, bilinguisme) est à construire quelle que soit l'option.

### Orchestrateur sans modèle

Le Worker n'appelle que l'API GitHub, l'OAuth de GitHub et `raw.githubusercontent.com` (`tokenpool:src/github.ts:14`, `tokenpool:src/worker.ts:53` et `:71`). Aucun SDK de fournisseur de LLM dans `package.json` ni dans le verrou (94 paquets) ; aucun agent ne tourne côté serveur. Le principe est respecté dans toutes les options ; tout code repris resterait soumis au contrôle `no-llm-sdk` de TH-015.

### Sécurité, d'après la lecture du code

- **Jeton d'identité GitHub confié au coordinateur.** Pour se connecter, le donateur envoie un jeton GitHub que le coordinateur vérifie sur `/user` puis écarte (`tokenpool:src/worker.ts:118-124`). Il faut faire confiance à l'opérateur de l'instance ; le projet recommande un jeton minimal.
- **Jetons de réservation en clair.** Valables dix minutes, ils sont stockés tels quels dans `tasks.token` ; les identifiants de donateur, eux, sont hachés en SHA-256.
- **Jeton d'administration** comparé par égalité simple, pas en temps constant (`tokenpool:src/worker.ts:98`).
- **Chaîne d'approvisionnement.** `wrangler` et `@cloudflare/workers-types` déclarés `latest` (fixés par le verrou) ; actions GitHub épinglées par étiquette ; le workflow de synchronisation exécute `npm ci` avec le secret d'administration dans son environnement. Repris tel quel, ce code ne passerait pas les règles de TH-015 (épinglage par empreinte).
- **Capacité `merge`.** Une proposition peut déclarer la capacité `merge` (`tokenpool:src/worker.ts:9`), que Tokenhood interdit à un agent.
- **Données publiques.** Consignes des projets, portées et rapports sont publics ; les rapports sont anonymes par défaut. Logins et identifiants GitHub des donateurs sont stockés chez Cloudflare.
- **Dépendance réseau à la réservation.** Chaque enregistrement de tâche et chaque réservation relisent `.github/tokenpool.json` sur `raw.githubusercontent.com` (`tokenpool:src/worker.ts:48-58`) ; Tokenhood prévoit l'indexation par webhook (TH-205).
- Bon point : limitation à 240 écritures par minute et par adresse, refus des écritures d'une autre origine, cookies `HttpOnly` et `SameSite=Strict`, taille des requêtes bornée.

### Tokenhood face à une inscription à tokenpool

- `.github/tokenpool.json` de Tokenhood a le format attendu (version 1, consignes en Markdown) mais vaut `enabled: false`.
- Le dépôt `mathieu-kosmio/tokenhood` n'a pas de licence reconnue par GitHub (API GitHub : `license: null`). La synchronisation de tokenpool refuse un tel dépôt (`tokenpool:src/github.ts:26`) : une inscription, sur l'instance publique comme sur une instance propre non modifiée, attend le choix de la licence (catégorie 3, porte du lot 0).
- Sur l'instance publique, l'inscription passe par une PR au registre de `rickheere/tokenpool`, que son seul mainteneur fusionne ou non.
- La file préparée impose une réservation de préparation et une proposition rédigée par un agent avant toute exécution : pour une mission dont le contrat est déjà écrit et revu, c'est une étape et une consommation de plus.

<contenu-non-fiable source="https://github.com/rickheere/tokenpool/blob/328acb900651e636c07f5ea95a9c0745a3b4a615/src/github.ts#L26">
Repository needs a GitHub-recognized open-source license
</contenu-non-fiable>

## Options

Ordres de grandeur en tokens-équivalents, alignés sur le dossier ADR-002 (une mission M ≈ 0,2 à 0,4 M) : S ≈ 0,1 à 0,2 M, M ≈ 0,2 à 0,4 M, L ≈ 0,5 à 1 M. Ils servent à comparer, pas à budgéter ; `governance.estimation` les recalibrera.

### Option A · Reprise du code (fork)

Copier ou forker le code de tokenpool, puis l'étendre jusqu'au protocole de Tokenhood. Deux variantes :

- **A1, garder Cloudflare.** Le module de coordination reste un Worker sur D1 ; la plateforme l'appelle. Contredit ADR-002 (une image, PostgreSQL, Coolify) et l'hébergement dans l'UE ; deux plateformes à exploiter ; aucune transaction possible entre la tentative (D1) et la soumission ou la revue (PostgreSQL).
- **A2, porter vers Fastify, Drizzle et PostgreSQL.** Le Worker mêle routage, SQL propre à D1 et validation dans un seul fichier : le portage est une réécriture. Restent réutilisables les requêtes de réservation, à traduire, et les scénarios de test.

| Critère | Impact |
|---|---|
| Licence | MIT, compatible avec l'AGPL-3.0 comme avec une licence permissive ; conserver la notice de copyright et le texte de la licence MIT pour les parties reprises |
| Maturité | Hérite d'un code d'une semaine, à auteur unique, sans usage réel, dont le protocole a déjà changé de façon incompatible |
| Couverture V2.1 | Périmètre réservation et file préparée ; tout le reste à écrire (lignes « Partielle » et « Non » du tableau) |
| Maintenance | Fork à suivre à la main ; la divergence grandit dès que générations, contrats et revue entrent |
| Orchestrateur sans modèle | Compatible |
| Coût de reprise | A1 : étendre le Worker jusqu'au périmètre de TH-202, M à L (0,3 à 0,8 M), puis L pour quitter Cloudflare le jour venu (0,5 à 1 M), plus l'exploitation d'une seconde plateforme. A2 : TH-202 (L, 0,5 à 1 M), sans économie notable sur B, avec un suivi de provenance en plus |
| Réversibilité | Faible pour A1 (données et protocole dans D1) ; moyenne pour A2 |

### Option B · Réimplémentation compatible (stratégie de la spécification)

TH-202 écrit le module de coordination dans `packages/core` (TypeScript, PostgreSQL, ADR-002), conforme aux contrats de TH-009, sans reprendre de code. Une façade REST compatible avec tokenpool expose le périmètre réservation et le traduit en tentatives Tokenhood :

| Appel tokenpool | Correspondance Tokenhood |
|---|---|
| `GET /v1/tasks` | Missions `open` réservables, en phase `execution`, avec une proposition dérivée du contrat (objectif, exigences d'acceptation, périmètre, entrées, risque) |
| `POST /v1/tasks` | Refusé : les missions naissent des contrats de `.tokenhood/missions/`, pas d'un agent |
| `POST /v1/claim` | `claim_mission` ; le jeton est une preuve opaque liée à l'identifiant de tentative et à sa génération ; `request_id` sert d'`Idempotency-Key` |
| `POST /v1/heartbeat` | `heartbeat`, refusé au-delà de `max_lease_minutes` |
| `POST /v1/release` | `release_mission`, le rapport devenant le dernier point d'avancement |
| `POST /v1/pause` | `request_arbitration` bloquante, tentative en `awaiting_decision` |
| `POST /v1/complete` | `submit_work` : la tentative passe en `submitted`, la mission reste tenue pendant la revue, à l'inverse de tokenpool qui la remet à disposition |
| `POST /v1/prepare` | Sans objet si le contrat publié tient lieu de proposition préparée (à trancher par TH-009) |

Un client tokenpool peut ainsi réserver une mission Tokenhood, mais pas fournir seul tout ce qu'une contribution exige (contexte et skills, rapport de consommation, PR conforme) : la compatibilité reste limitée à la réservation, comme l'écrit `api-et-mcp.md`.

| Critère | Impact |
|---|---|
| Licence | Aucune reprise de code, aucune obligation ; le contrat OpenAPI de tokenpool (MIT) peut servir de référence de test, avec sa notice |
| Maturité | Indépendante de la qualité du code de tokenpool, mais pas de la stabilité de son protocole : la cible a déjà bougé une fois. Il faut figer une version de référence (`328acb9` ou une version déclarée par TH-009) |
| Couverture V2.1 | Complète par construction, puisque le module suit TH-009 ; la façade couvre la réservation seulement |
| Maintenance | Façade et tests de conformité à tenir à jour à chaque évolution de tokenpool ; correspondances de sémantique à documenter |
| Orchestrateur sans modèle | Compatible |
| Coût de reprise | TH-202 (L, 0,5 à 1 M) et une façade de taille S (0,1 à 0,2 M), soit 0,6 à 1,2 M |
| Bénéfice | Interopérabilité avec les clients tokenpool : à ce jour la CLI de référence et le skill `tokenpool-donate`, aucun autre client connu. Ouvre la fédération entre coordinateurs prévue après le MVP |
| Réversibilité | Bonne : la façade se retire sans toucher au module |

### Option C · Contribution à tokenpool, qui reste le coordinateur

Tokenhood utilise une instance tokenpool comme registre de réservations, y compris après le lot 2, et contribue en amont les ajouts génériques (générations, plafond de durée, `Idempotency-Key`, points d'avancement, mode parallèle). La plateforme garde contrats, vérification, gouvernance et budget, et appelle tokenpool pour réserver.

| Critère | Impact |
|---|---|
| Licence | Les contributions sont publiées sous MIT, quelle que soit la licence retenue pour Tokenhood ; tokenpool ne publie ni DCO ni CLA |
| Maturité | Dépendance forte à un projet d'une semaine, à mainteneur unique, que `coordination.md` écarte expressément ; l'acceptation des contributions est incertaine, tokenpool visant le don sans convention ni revue |
| Couverture V2.1 | La réservation vit chez tokenpool, les autres états de tentative chez Tokenhood : deux sources d'état, contraire à `missions.md` ; unicité, génération et soumission ne tiennent pas dans une même transaction |
| Maintenance | Peu de code chez Tokenhood, mais une synchronisation entre deux systèmes ; une panne ou un changement amont arrête la coordination |
| Hébergement | Cloudflare (instance propre ou celle du mainteneur), hors du VPS européen et de Coolify |
| Orchestrateur sans modèle | Compatible |
| Coût de reprise | Client tokenpool dans la plateforme (M, 0,2 à 0,4 M), synchronisation d'état (M), contributions amont sans garantie d'acceptation (2 à 4 missions M) ; puis une migration L si l'amont s'arrête ou diverge |
| Réversibilité | Faible une fois les tentatives et leur historique chez tokenpool |

### Option D · Réimplémentation autonome, sans engagement de compatibilité

Comme B, sans façade : TH-202 reprend les mécanismes que l'audit valide (réservation par mise à jour conditionnelle unique, preuve renouvelée à chaque réservation, bail de 600 secondes, rejeu par identifiant de requête, éventuellement la file préparée) dans les contrats de TH-009 et l'API de Tokenhood (REST et MCP), sans compatibilité de format avec tokenpool. Une façade reste possible plus tard, par une mission dédiée.

| Critère | Impact |
|---|---|
| Licence | Aucune reprise ; tokenpool est cité comme source d'inspiration |
| Maturité | Indépendante de tokenpool |
| Couverture V2.1 | Complète par TH-009 |
| Maintenance | La plus faible : rien à suivre en amont |
| Orchestrateur sans modèle | Compatible |
| Coût de reprise | TH-202 (L, 0,5 à 1 M) et une correction de la spécification (S, 0,1 à 0,2 M) |
| Écart à la spécification | Contredit `api-et-mcp.md` (compatibilité sur le périmètre réservation) et le tableau ADR-001 de `coordination.md` ; une mission `docs` doit les corriger en FR et EN |
| Réversibilité | Bonne : la façade de B peut s'ajouter plus tard |

## Comparaison

| Critère | A1 | A2 | B | C | D |
|---|---|---|---|---|---|
| Licence | MIT, notice à conserver | MIT, notice à conserver | Aucune obligation | Contributions sous MIT | Aucune obligation |
| Dépendance à la maturité de tokenpool | Forte | Moyenne | Faible (protocole seul) | Très forte | Nulle |
| Couverture V2.1 à construire | Presque tout, sur D1 | Presque tout | Tout, dans le module | Tout, réparti sur deux systèmes | Tout, dans le module |
| Conformité à ADR-002 et à l'hébergement dans l'UE | Non | Oui | Oui | Non | Oui |
| Une seule source d'état | Non | Oui | Oui | Non | Oui |
| Conformité à la spécification actuelle | Partielle | Oui | Oui | Partielle | Non (correction requise) |
| Interopérabilité avec les clients tokenpool | Oui | Oui | Oui (réservation) | Oui | Non |
| Maintenance continue | Fork | Fork | Façade et tests | Synchronisation et amont | Aucune en amont |
| Coût jusqu'à la porte du lot 2 | 0,3 à 0,8 M, puis 0,5 à 1 M pour sortir | 0,5 à 1 M | 0,6 à 1,2 M | 0,8 à 2,4 M, acceptation incertaine | 0,6 à 1,2 M |
| Orchestrateur sans modèle | Compatible | Compatible | Compatible | Compatible | Compatible |

## Conséquences pour l'amorçage (décision distincte, catégorie 1, porteur)

Le plan prévoit une instance tokenpool pour coordonner les lots 0 à 2 (`plan-de-developpement.md`, « Jour 0 ») ; `CONTRIBUTING.md` y renvoie. Depuis DEC-2026-004, les réservations passent par une discussion « Réservation TH-xxx » ou par la demande du porteur, et douze missions ont été intégrées sans instance. Trois voies :

1. **Garder la coordination actuelle** jusqu'au lot 2. Rien à déployer ; TH-210 (migration depuis l'instance) devient sans objet ou se limite à l'import des discussions ; `CONTRIBUTING.md` et le plan sont à mettre à jour.
2. **S'inscrire sur l'instance publique.** Suppose une licence reconnue par GitHub, `enabled: true`, une PR acceptée au registre amont, et accepte la file préparée, une dépendance au mainteneur et des données de contributeurs chez Cloudflare.
3. **Déployer une instance propre** (compte Cloudflare du porteur, offre gratuite). Mêmes prérequis de licence, sauf à modifier le code ; une seconde plateforme à exploiter pour un usage de quelques mois.

L'instruction ne voit pas de bénéfice qui justifie les voies 2 ou 3 tant que la licence n'est pas choisie ; la décision revient au porteur.

## Points de vigilance, quelle que soit l'option

- **TH-009** doit fixer la génération (entier monotone, présenté à chaque opération), le plafond `max_lease_minutes` appliqué par le serveur, l'`Idempotency-Key` et la sémantique de soumission ; le test de tokenpool à 8 réservations concurrentes est un bon modèle de scénario de conformité.
- **File préparée** : à évaluer dans TH-009. Le contrat publié peut tenir lieu de proposition préparée ; une préparation par agent ressemble à `mission.drafting`, qui exige une revue du porteur.
- **Capacités** : aucune capacité `merge` ne doit pouvoir être déclarée ni accordée à un agent.
- **Preuves de réservation** : les stocker hachées, comme les identifiants.
- **Spécification** : le qualificatif « éprouvé » de `coordination.md` (FR et EN) n'est pas étayé par l'audit.

## Recommandation de l'instruction

Option B, avec deux ajustements tirés de l'audit : TH-202 aligne la sémantique de son module sur les mécanismes de tokenpool sans en reprendre le code, et la façade compatible devient une mission distincte de taille S, après TH-202, écrite contre une version figée du protocole tokenpool. Si, à la porte du lot 2, aucun client tokenpool autre que la CLI de référence n'existe et que le protocole amont reste instable, la façade peut être reportée sans effet sur le reste, ce qui revient à l'option D. A est écartée pour son incompatibilité avec ADR-002 sans économie réelle ; C pour la dépendance forte que la spécification refuse. Les contributions amont restent ouvertes après le MVP, au cas par cas. La décision appartient aux mainteneurs compétents (catégorie 2).

---

**EN summary** · ADR-001 decides how Tokenhood relates to tokenpool from lot 2 onwards. The audit of [rickheere/tokenpool](https://github.com/rickheere/tokenpool) at commit `328acb9` (MIT licence) finds a one-week-old project with a single author, no external usage, a protocol that broke compatibility within its first day, and a Cloudflare Workers and D1 runtime. Its protocol covers Tokenhood's claim scope (atomic claim, fencing proof, 10-minute lease, request replay) and adds a prepared queue; everything else (generations, total lease cap, contracts, submission, review, budget, usage, MCP, FR/EN) has to be built anyway. The repository cannot be enrolled in tokenpool until Tokenhood adopts a GitHub-recognised licence. Four options were compared: A, reuse the code (keep Cloudflare, or port it, which amounts to a rewrite); B, compatible reimplementation (spec strategy); C, keep tokenpool as the coordinator and contribute upstream; D, standalone reimplementation without wire compatibility. The instruction recommends B, with the tokenpool facade split into a separate small mission after TH-202 against a pinned protocol version, deferrable to D at the lot 2 gate. No decision is taken by the agent.
