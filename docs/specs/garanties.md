[Spécifications V2.1](README.md) › Module 4/28 · [English version](en/garanties.md)

# Matrice des garanties

**Version 1 du 20 octobre 2026**, produite par la mission [TH-008](../../.tokenhood/missions/TH-008.yaml) à partir de la matrice de la V2.1 et de l'[étude de faisabilité](etude-de-faisabilite.md). Elle donne une seule classe à chaque promesse et ouvre le registre de compatibilité. La [version anglaise](en/garanties.md) reste celle de la V2.1 jusqu'à sa traduction.

Chaque promesse du produit distingue ce que Tokenhood applique dans ses propres services de ce qui dépend du client de l'agent ou reste déclaratif. Les protections déclaratives sont présentées comme telles, dans la documentation et dans l'interface.

## Classes

| Classe | Définition | Présentation au contributeur et au porteur |
| --- | --- | --- |
| **Garantie** | Tokenhood l'applique dans ses propres services, quel que soit le client de l'agent, par un mécanisme identifié et vérifié par un test automatisé | « Garanti par Tokenhood » |
| **Dépendante du client** | Elle tient seulement si le client de l'agent ou le compagnon local fournit une capacité que Tokenhood ne contrôle pas ; le [registre de compatibilité](#registre-de-compatibilité) dit pour quel client et quel mode elle est démontrée | « Contrôlé par votre client » quand l'entrée du registre porte un essai réussi et daté ; sinon présentée comme déclarative |
| **Déclarative** | Elle repose sur la parole d'un utilisateur ou sur le respect d'une consigne par un agent ; Tokenhood ne peut ni l'appliquer ni la vérifier, seulement la rappeler, la contrôler après coup et la sanctionner | « Déclaré », avec l'auteur de la déclaration |

**Règles de classement**

1. Une promesse reçoit une seule classe. Une promesse dont une partie est appliquée et l'autre non est scindée en deux lignes.
2. En cas de doute, la classe la plus faible l'emporte : déclarative, puis dépendante du client, puis garantie.
3. Une garantie dont le mécanisme ou le test manque est présentée comme déclarative ([Sécurité et conformité](securite-et-conformite.md)). La classe ci-dessous est celle de la plateforme cible ; ce qui tient pendant l'amorçage est décrit plus bas.
4. Les identifiants `G-xx` sont stables : une promesse retirée garde son numéro, qui n'est jamais réattribué. Un changement de classe passe par une nouvelle version de ce module.

## Matrice

### Réservations et tentatives

| ID | Promesse | Classe | Mécanisme | Test | Missions |
| --- | --- | --- | --- | --- | --- |
| G-01 | Une mission `exclusive` n'a qu'une tentative active à la fois | Garantie | Contrainte d'unicité dans le registre des tentatives | Deux réservations concurrentes : une seule réussit | TH-202, tests TH-009 |
| G-02 | Une opération d'une génération périmée (heartbeat, progression, soumission) est refusée | Garantie | Numéro de génération présenté et vérifié à chaque opération | Après réattribution, opération de l'ancienne génération refusée | TH-202, tests TH-009 |
| G-03 | Le dernier point d'avancement d'une tentative expirée est remis à la tentative suivante | Garantie | Checkpoints (`report_progress`) conservés et servis à la reprise | Expiration, puis reprise au dernier checkpoint | TH-202 |
| G-04 | La version du contrat reste figée pendant toute la tentative | Garantie | Version enregistrée à la réservation ; livrable vérifié contre elle | Changement incompatible pendant une tentative : migration ou libération, jamais de poursuite silencieuse | TH-201, TH-202 |
| G-05 | Un agent dont la tentative a expiré ou a été réattribuée cesse de travailler | Dépendante du client | Compagnon local : arrêt de la session sur expiration ou sur refus de génération | Expiration provoquée en cours de session : arrêt constaté, délai mesuré | TH-207, TH-208 |
| G-06 | L'agent mène la mission sans intervention et reprend après une interruption | Dépendante du client | Mode non interactif du client, permissions accordées pour la session, reprise depuis le dernier checkpoint | Interruption, puis reprise | TH-207, TH-208 |

### Autorisations et rôles

| ID | Promesse | Classe | Mécanisme | Test | Missions |
| --- | --- | --- | --- | --- | --- |
| G-07 | Une autorisation révoquée ou échue ne permet plus aucune opération API ou MCP | Garantie | Jeton propre à Tokenhood, vérifié dans la couche métier à chaque appel | Révocation en cours de session : l'appel suivant est refusé | TH-109, TH-204 |
| G-08 | Un traitement déjà engagé s'interrompt à la révocation | Dépendante du client | Compagnon local : arrêt sur refus d'autorisation | Révocation pendant une exécution : arrêt constaté, délai mesuré | TH-207, TH-208 |
| G-09 | Un jeton d'agent ne permet ni de voter, ni de signer, ni d'approuver, ni de fusionner, ni d'accéder aux pièces KYB | Garantie | Autorisations par rôle dans la couche métier, quelle que soit l'entrée (MCP ou REST) ; aucun outil MCP correspondant | Appel REST direct avec un jeton d'agent, refusé pour chaque opération | TH-104, TH-106, TH-204, TH-402 |
| G-10 | Sur la forge du projet, la fusion est décidée par un humain | Déclarative | PR depuis un fork, protection de branche du projet, politique `merge_by: human`, compte qui fusionne enregistré avec l'événement d'intégration | Aucun : la forge ne distingue pas un humain d'un agent qui utilise ses identifiants | TH-205 |

G-10 est déclarative parce que l'agent travaille sur le poste de son contributeur, avec ses identifiants de forge. Pour un contributeur sans droit d'écriture sur le dépôt du projet, la forge empêche toute fusion ; pour un contributeur qui en a, rien n'empêche techniquement son agent de fusionner.

### Budget et mesure

| ID | Promesse | Classe | Mécanisme | Test | Missions |
| --- | --- | --- | --- | --- | --- |
| G-11 | Aucune nouvelle réservation n'est accordée au-delà du plafond connu de l'autorisation | Garantie | Plafond par autorisation, comparé à la consommation rapportée avant chaque réservation | Plafond atteint : réservation refusée | TH-109, TH-202 |
| G-12 | La consommation d'une session est mesurée pendant la session | Dépendante du client | Compteur du client (transcription, sortie JSON, télémétrie) lu par le compagnon | Mesure comparée à la console du fournisseur sur une session de référence en mode API | TH-207, TH-208 |
| G-13 | Une session s'arrête au plafond fixé par le contributeur | Dépendante du client | Compagnon local, selon le niveau de plafond du registre | Arrêt démontré pour chaque client annoncé compatible, dépassement mesuré | TH-207, TH-208 |
| G-14 | Les chiffres de consommation rapportés sont exacts | Déclarative | Rapport de consommation avec méthode, nature et niveau de confiance (`client_reported`, `evidenced`, `reconciled`) | Rapprochement avec un justificatif du fournisseur quand il existe | TH-019, TH-204 |
| G-15 | Chaque contribution intégrée a un rapport de consommation | Garantie | Validateur `.tokenhood` en CI pendant l'amorçage, puis `report_usage` | Mission `integrated` sans rapport : CI en échec | TH-019 (en place), TH-204 |
| G-16 | Une même enveloppe n'est jamais comptée deux fois, et un engagement expiré, retiré ou affecté n'est pas présenté comme disponible | Garantie | Règles d'agrégation et statuts des engagements ([Capacité](capacite.md)) | Jeux de données : engagements expirés, retirés, affectés, fléchés et mutualisés | TH-109, TH-111 |
| G-17 | Chaque chiffre affiché indique son unité native, sa source et sa nature (déclaré, mesuré, estimé) | Garantie | `UsageReport` (méthode, confiance, justificatif), tableau de bord et export | Survol et export de chaque agrégat | TH-111 |

### Vérification croisée

| ID | Promesse | Classe | Mécanisme | Test | Missions |
| --- | --- | --- | --- | --- | --- |
| G-18 | Le vérificateur est un autre utilisateur, sans lien d'intérêt déclaré avec le producteur ni avec le projet, tiré au sort parmi les éligibles | Garantie | Règles d'éligibilité et d'exclusion, tirage au sort, attente en `awaiting_reviewer` sans assouplissement | Jeux de données adverses : producteur, utilisateurs liés, réciprocité | TH-103, TH-301 |
| G-19 | Les liens d'intérêt déclarés sont complets | Déclarative | Déclaration à l'inscription, détection de motifs réciproques, audit par échantillonnage, sanctions décidées en gouvernance | Aucun test de complétude possible | TH-103, TH-303 |
| G-20 | Producteur et vérificateur utilisent des familles de modèles différentes, quand le contrat le demande | Déclarative | Assignation selon la famille de modèle déclarée par chaque agent | Aucun : la famille réellement utilisée n'est pas observable | TH-301 |
| G-21 | Une approbation ne survit pas à une modification du livrable | Garantie | Rapport de vérification lié à la version du contrat et au commit ou à l'empreinte | Nouveau commit après approbation : approbation invalidée | TH-302 |

### Sécurité de l'exécution

| ID | Promesse | Classe | Mécanisme | Test | Missions |
| --- | --- | --- | --- | --- | --- |
| G-22 | Une mission qui exécute du code n'est pas proposée à un agent dont l'environnement déclaré n'est pas isolé | Garantie | Filtrage des missions selon l'environnement déclaré et les opérations de la mission | Mission exécutant du code refusée à un agent déclaré « poste nu » | TH-109, TH-202 |
| G-23 | L'environnement d'exécution est réellement isolé : conteneur ou VM, sans secret monté, réseau restreint | Déclarative | Déclaration d'environnement ; attestation du compagnon, qui reste un indice puisqu'elle s'exécute sur le poste qu'elle atteste | Aucun test ne prouve l'isolement d'un poste tiers ; TH-208 documente ce que l'attestation détecte | TH-207, TH-208 |
| G-24 | Le contrat servi à l'agent, commandes d'acceptation comprises, est celui de la branche par défaut du dépôt sous convention | Garantie | Indexation de `.tokenhood/` depuis la branche par défaut, versions de contrat | Contrat modifié dans une PR ou une issue : ignoré | TH-201, TH-205 |
| G-25 | La phase de préparation ne modifie rien | Dépendante du client | Permissions du client en lecture seule pendant la préparation (mode ou bac à sable du client), imposées par le compagnon | Écriture tentée pendant la préparation : refusée par le client | TH-207, TH-208 |
| G-26 | Une instruction glissée dans un contenu externe (issue, code, ressource) n'est pas suivie | Déclarative | Balisage des contenus non fiables et règles du skill `tokenhood-contribute` ; politiques non modifiables par un skill | Aucun test ne le garantit ; scénarios d'injection à inclure dans les essais de compatibilité | TH-004, TH-208 |
| G-27 | Tokenhood ne sert à l'agent que les skills listés par la mission, avec version, empreinte et provenance | Garantie | Service `get_context` | Skill non listé ou empreinte modifiée : refusé | TH-206 |
| G-28 | L'agent charge ces skills, et seulement eux | Déclarative | Consigne du skill, rapport de mission | Aucun : le chargement se fait dans le client | TH-206 |

### Identifiants, données et principes

| ID | Promesse | Classe | Mécanisme | Test | Missions |
| --- | --- | --- | --- | --- | --- |
| G-29 | Tokenhood ne demande, ne stocke ni ne relaie aucun identifiant de fournisseur d'IA (abonnement, jeton OAuth, clé API) | Garantie | Aucun champ ni flux prévu ; jeton d'agent propre à Tokenhood ; gitleaks sur chaque PR | Revue du modèle de données et de l'API ; gitleaks au vert | TH-109, TH-015 (en place) |
| G-30 | Les serveurs de Tokenhood n'appellent aucun fournisseur de LLM | Garantie | Contrôle d'absence de SDK de LLM (statut requis), politique `forbidden: llm_provider_calls_server_side`, contrôle des flux sortants | Auto-vérification du contrôle sur une copie du dépôt où `openai` est ajouté ; flux sortants vers les fournisseurs bloqués | TH-015 (en place), recette du MVP |
| G-31 | Un paquet de mission ne contient ni pièce KYB ni donnée personnelle non publique | Garantie | Contrôle des paquets à la construction ; accès KYB réservé au rôle comité | Paquet construit avec une pièce KYB : refusé | TH-206, TH-402 |
| G-32 | Rien ne se vend ni ne se transfère : ni tokens, ni crédits, ni paiement | Garantie | Aucune ressource de paiement, de solde ou de transfert ; une allocation n'est qu'un ordre de priorité | Revue de l'API publiée (OpenAPI) avant la clôture du MVP | TH-407 |
| G-33 | Le contributeur respecte les conditions de son fournisseur d'IA | Déclarative | Registre de compatibilité (conditions examinées, incertitudes), acceptation de la charte | Aucun : Tokenhood ne voit ni le compte ni l'usage | TH-208 |

### Correspondance avec la matrice V2.1

| Promesse de la V2.1 | Promesses de la version 1 |
| --- | --- |
| Une mission exclusive n'est réservée qu'une fois | G-01, G-02, G-05 |
| Une autorisation est révocable | G-07, G-08 |
| Un budget est respecté | G-11, G-12, G-13 |
| L'agent travaille en autonomie | G-03, G-06, G-27 |
| La vérification est indépendante | G-18, G-19 |
| Les règles de sécurité sont respectées | G-22, G-23 |
| Un agent ne vote, ne signe ni ne fusionne | G-09, G-10 |

Les autres lignes (G-04, G-14 à G-17, G-20, G-21, G-24 à G-26, G-28 à G-33) reprennent des promesses énoncées ailleurs dans les spécifications : [Missions](missions.md), [Coordination](coordination.md), [Capacité](capacite.md), [Vérification croisée](verification-croisee.md), [Sécurité et conformité](securite-et-conformite.md), [Vision et principes](vision-et-principes.md).

### Pendant l'amorçage

Tant que la plateforme n'existe pas, GitHub et des gestes manuels du porteur tiennent lieu de plateforme. Situation au 20 octobre 2026 :

| Promesses | Ce qui s'applique | Classe effective |
| --- | --- | --- |
| G-01 à G-06 (réservations) | Aucun registre de tentatives : réservation par une discussion « Réservation TH-xxx » ou par la demande du porteur ([DEC-2026-004](../../decisions/DEC-2026-004-skill-contribute-amorcage.md)) | Déclarative |
| G-07, G-08 (révocation) | Aucune autorisation Tokenhood : l'agent agit avec les identifiants de forge de son contributeur, que lui seul peut révoquer | Hors de Tokenhood |
| G-09 (rôles) | Aucun vote ni signature dans Tokenhood ; gouvernance provisoire sur GitHub | Sans objet |
| G-10 (fusion) | `main` protégée : PR obligatoire, statuts de CI requis, branche à jour, ni push direct ni force-push. Le porteur décide de chaque fusion, y compris quand il en confie le geste à un agent | Déclarative (fusion) ; garantie par la forge (aucun push direct) |
| G-11 à G-13 (budget) | Aucun plafond appliqué par Tokenhood ; chaque contributeur règle son client | Déclarative |
| G-14 (exactitude) | Rapports `client_transcript`, nature `declared`, produits avec `tools/usage/claude-code.mjs` | Déclarative |
| G-15 (rapport) | Le validateur `.tokenhood` refuse une mission intégrée sans rapport | Garantie |
| G-18 à G-21 (vérification) | Vérificateur assigné à la main par le porteur | Déclarative |
| G-22, G-23 (isolement) | Aucun environnement isolé disponible pour le lot 0 (Docker absent du poste du porteur) ; les rapports de mission le déclarent | Déclarative |
| G-26, G-28 (contenus, skills) | Missions ouvertes déclarant `tokenhood-contribute@0.1` ; `tokenhood-verify@0.1` pour la vérification | Déclarative |
| G-29 (identifiants) | gitleaks sur chaque PR, statut requis ; aucune plateforme ne reçoit d'identifiant | Garantie |
| G-30 (sans modèle) | Contrôle d'absence de SDK de LLM, statut requis depuis le 18 octobre 2026 ; pas encore de contrôle des flux sortants, donc un appel HTTP direct à un fournisseur ne serait vu qu'en revue | Garantie pour les SDK ; déclarative pour un appel direct |

## Niveaux de plafond

**Trois niveaux de plafond**, affichés au contributeur avant le lancement d'une session :

| Niveau | Condition | Ce que voit le contributeur |
| --- | --- | --- |
| Plafond contrôlé | Le client fournit une mesure exploitable et un arrêt testé | Plafond en tokens, avec la tolérance documentée pour les opérations déjà engagées |
| Plafond estimatif | Le compagnon arrête la session à partir d'une estimation ou d'un indicateur indirect | Plafond indicatif, marge d'erreur annoncée |
| Limite en temps ou en missions | Aucun comptage exploitable | Durée maximale ou nombre de missions |

Le niveau d'une session est celui de l'entrée du registre pour le client et le mode déclarés par l'agent. Tant qu'une entrée n'est pas `annoncé compatible`, la session est limitée en temps ou en missions.

## Registre de compatibilité

Pour chaque client (Claude Code, Codex CLI, Gemini CLI, agents locaux) et chaque mode d'usage (abonnement, API, modèle local), le registre indique : fonctionnement testé, niveau de plafond atteignable, conditions d'utilisation examinées, date de vérification, restrictions et incertitudes. Un client n'est annoncé compatible qu'après une session complète et une interruption contrôlée démontrées. Le registre est public et tenu à jour par une mission récurrente.

**Registre initial, arrêté au 20 octobre 2026.** Vérification documentaire : documentation publique des clients et conditions des fournisseurs lues ce jour-là (sources en fin de section), rapports de consommation du dépôt. Aucun essai avec la plateforme : le serveur MCP (TH-204) et le compagnon local (TH-207) n'existent pas encore. **Aucun client n'est donc annoncé compatible.** La mission TH-208 reprend ce registre et y porte les essais. Les conditions ont fait l'objet d'une lecture non juridique, à faire valider avant l'ouverture publique.

**Statuts d'une entrée**

| Statut | Signification |
| --- | --- |
| `non examiné` | Client ou mode connu, documentation non lue |
| `documenté` | Documentation et conditions lues ; rien n'a été essayé avec Tokenhood |
| `observé en amorçage` | Utilisé pour des missions réelles coordonnées par GitHub, hors plateforme, dans un mode consigné |
| `annoncé compatible` | Session complète et interruption contrôlée démontrées avec la plateforme, à la date indiquée |
| `exclu` | Les conditions du fournisseur ou l'état du client l'écartent |

**Entrées au 20 octobre 2026**

| ID | Client | Mode | Statut | Plafond visé (à démontrer) | Fonctionnement testé | Vérifié le |
| --- | --- | --- | --- | --- | --- | --- |
| R-01 | Claude Code | Abonnement Pro ou Max | `documenté` | Contrôlé | Aucun essai avec la plateforme ; client des 20 rapports du lot 0, mode non consigné | 2026-10-20 |
| R-02 | Claude Code | API (Claude Console, ou fournisseur cloud) | `documenté` | Contrôlé | Aucun essai avec la plateforme ; client des 20 rapports du lot 0, mode non consigné | 2026-10-20 |
| R-03 | Codex CLI | Abonnement ChatGPT | `documenté` | Contrôlé, à la granularité du tour | Aucun | 2026-10-20 |
| R-04 | Codex CLI | API (clé OpenAI) | `documenté` | Contrôlé, à la granularité du tour | Aucun | 2026-10-20 |
| R-05 | Gemini CLI | Compte Google personnel (offre gratuite, Google One) | `exclu` | Sans objet | Aucun | 2026-10-20 |
| R-06 | Gemini CLI | Compte Google Cloud (Code Assist Standard ou Enterprise) | `documenté` | Contrôlé | Aucun | 2026-10-20 |
| R-07 | Gemini CLI | API (Gemini Developer API, Vertex AI) | `documenté` | Contrôlé | Aucun | 2026-10-20 |
| R-08 | Antigravity CLI | Compte Google personnel | `non examiné` | Inconnu | Aucun | 2026-10-20 |
| R-09 | Agents locaux | Modèle local | `non examiné` | Contrôlé si le serveur d'inférence expose ses compteurs, sinon temps ou missions | Aucun | 2026-10-20 |

### Claude Code (R-01, R-02)

- **Fonctionnement attendu.** Serveur MCP déclaré dans le client (`--mcp-config`), exécution non interactive (`claude -p`) avec sortie `stream-json`, permissions restreintes par session (`--permission-mode`, `--tools`, `--restricted`).
- **Mesure.** Chaque réponse inscrite dans la transcription locale porte son usage (input, cache_creation, cache_read, output) : c'est la méthode `client_transcript` des 20 rapports de consommation du lot 0, tous produits avec Claude Code et Claude Opus 5.5. La documentation décrit aussi une télémétrie OpenTelemetry, dont la métrique `claude_code.token.usage` (types input, output, cacheRead, cacheCreation).
- **Arrêt.** `--max-budget-usd` (mode non interactif) arrête la session sur une estimation de dépense faite par le client au prix catalogue ; la documentation prévient qu'elle peut dépasser le plafond. `--max-turns` limite le nombre de tours. Un plafond contrôlé en tokens suppose que le compagnon lise l'usage de chaque réponse et arrête le processus ; tolérance : la réponse en cours et les sous-agents déjà lancés. En mode API, les limites de dépense de l'espace de travail de la Claude Console s'ajoutent, appliquées par le fournisseur.
- **Conditions examinées.** Consumer Terms pour Free, Pro et Max ; Commercial Terms pour l'API, Team et Enterprise ; page « Legal and compliance » de Claude Code. Points retenus : l'authentification OAuth d'un abonnement est réservée à l'usage ordinaire de Claude Code et des applications d'Anthropic ; un tiers ne doit ni collecter, ni stocker, ni relayer des identifiants claude.ai, ni faire passer des requêtes par l'abonnement d'un autre ; les limites annoncées des forfaits Pro et Max supposent un usage individuel ordinaire. Un contributeur qui lance son Claude Code non modifié, avec son propre compte, sans que Tokenhood touche à ses identifiants (G-29), suit le schéma que décrit cette page.
- **Incertitudes.** Un compagnon qui enchaîne des sessions non interactives sur un abonnement reste-t-il un « usage individuel ordinaire » ? La page ne le dit pas. Les rapports du lot 0 ne consignent pas le mode (le schéma du rapport de consommation n'a pas de champ pour cela) : R-01 et R-02 ne peuvent pas passer `observé en amorçage`. Sur abonnement, la part du forfait consommée n'est exposée que dans l'interface du client.

### Codex CLI (R-03, R-04)

- **Fonctionnement attendu.** Exécution non interactive (`codex exec`), sortie JSONL (`--json`), bac à sable en lecture seule par défaut (`--sandbox workspace-write` pour écrire), favorable à G-25. Le client accepte des serveurs MCP ; le transport HTTP distant reste à confirmer.
- **Mesure.** L'événement `turn.completed` porte l'usage du tour (input, cached_input, output, reasoning_output). La documentation ne dit pas si cet usage est identique avec une connexion ChatGPT.
- **Arrêt.** Aucune option de plafond documentée pour le mode non interactif : le compagnon arrête entre deux tours, d'où une tolérance d'un tour.
- **Conditions examinées.** Connexion avec un compte ChatGPT : conditions d'utilisation de ChatGPT ; clé API : conditions de l'API d'OpenAI. La documentation recommande les clés API pour l'automatisation et déconseille la connexion ChatGPT dans une CI pour un dépôt public ou open source. Les pages d'aide d'OpenAI rappellent, pour les forfaits ChatGPT, l'interdiction de partager son compte ou de le rendre accessible à d'autres, de revendre l'accès ou d'alimenter un service tiers. Ces interdictions ont été repérées par recherche : les pages d'OpenAI ont refusé la lecture automatique le 20 octobre 2026 et le texte intégral reste à lire.
- **Incertitudes.** Contribuer à des projets tiers par l'intermédiaire de Tokenhood relève-t-il de l'« alimentation d'un service tiers » ? À confirmer sur le texte des conditions avant d'ouvrir R-03.

### Gemini CLI (R-05 à R-07) et Antigravity CLI (R-08)

- **Remplacement.** Selon la documentation de Gemini CLI, l'offre gratuite et les utilisateurs Google One sont passés à Antigravity CLI le 18 juin 2026, d'où R-05 `exclu` ; les abonnements vendus par Google One (Google AI Pro ou Ultra) sont vraisemblablement concernés, à confirmer. La même documentation indique que Gemini CLI n'est pas optimisé pour le modèle Gemini 4 Argon.
- **Mesure.** La sortie JSON non interactive contient des statistiques d'usage par modèle, et un code de sortie dédié signale le dépassement de la limite de tours.
- **Conditions examinées.** Elles dépendent de l'authentification : compte Google (conditions Google et avis de confidentialité de Gemini Code Assist pour les particuliers), compte Google Cloud (conditions de Google Cloud), clé Gemini API (conditions des services gratuits ou payants), Vertex AI (conditions de Google Cloud). Accéder aux services de Gemini CLI depuis un logiciel tiers est contraire aux conditions et peut entraîner la suspension du compte : Tokenhood et son compagnon ne réutilisent jamais l'authentification du client (G-29).
- **Incertitudes.** L'usage des contenus par le fournisseur diffère entre offres gratuites et payantes ; les paquets de mission ne contiennent que des contenus publics (G-31), mais le contributeur doit le savoir. Antigravity CLI : sur le dépôt du client, un ticket fermé le 21 septembre 2026 indique que l'authentification passe par OAuth interactif et qu'une clé Gemini API n'est pas prise en charge, ce qui gêne l'usage sans interface ; documentation, mesure et conditions non examinées.

### Agents locaux (R-09)

- Un client ouvert et un serveur d'inférence local : aucun fournisseur, donc aucune condition de service, mais la licence des poids du modèle s'applique et certaines restreignent des usages, à vérifier modèle par modèle.
- Le serveur d'inférence compte les tokens (Ollama, par exemple, renvoie pour chaque réponse le nombre de tokens d'entrée et de sortie) ; le compagnon peut s'en servir pour un plafond contrôlé. L'unité native d'un engagement reste l'heure d'agent ([Capacité](capacite.md)).
- Aucun client désigné : TH-208 choisit lesquels essayer.

### Tenue du registre

- Une entrée ne change de statut que sur preuve : essai daté, journal joint, client et version consignés.
- Une entrée `annoncé compatible` qui échoue à un essai repasse `documenté`, et ses promesses dépendantes du client redeviennent déclaratives pour ce client et ce mode.
- Revérification à chaque changement des conditions d'un fournisseur ou de version majeure d'un client, et au plus tard six mois après la précédente.
- Dans la plateforme, le registre devient l'entité `CompatibilityRecord`, exposée par `/v1/compatibility`, par l'outil MCP `get_guarantees` et par une page publique ; jusque-là, cette section fait foi.

### Sources consultées le 20 octobre 2026

- Claude Code : [Legal and compliance](https://code.claude.com/docs/en/legal-and-compliance), [CLI reference](https://code.claude.com/docs/en/cli-reference), [Manage costs effectively](https://code.claude.com/docs/en/costs), [Monitoring](https://code.claude.com/docs/en/monitoring-usage)
- Codex CLI : [Non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode) ; [Codex et forfaits ChatGPT](https://help.openai.com/en/articles/11369540) (lecture refusée, contenu connu par recherche)
- Gemini CLI : [Terms of Service and Privacy Notice](https://geminicli.com/docs/resources/tos-privacy), [Headless mode](https://geminicli.com/docs/cli/headless)
- Antigravity CLI : [ticket sur l'authentification sans interface](https://github.com/google-antigravity/antigravity-cli/issues/78)
- Dépôt Tokenhood : `.tokenhood/usage/` (20 rapports au 20 octobre 2026), `tools/usage/claude-code.mjs`, `tools/validate/validate.mjs`

---

← [Valeur nette des contributions](valeur-nette.md) · [Sommaire](README.md) · [Acteurs et rôles](acteurs-et-roles.md) →
