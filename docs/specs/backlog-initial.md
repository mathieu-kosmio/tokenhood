[Spécifications V2.1](README.md) › Module 24/28 · [English version](en/backlog-initial.md)

# Backlog initial du projet Tokenhood

Premières missions à publier dans `.tokenhood/missions/` du dépôt `tokenhood`, numérotées par lot (TH-0xx pour le lot 0, TH-1xx pour le lot 1, etc.). Les quatre livrables socle sont en gras. Les missions `governance.instruction` préparent des décisions sans les prendre. Les modules complets sont découpés en missions atomiques, chacune avec un périmètre modifiable et une preuve d'achèvement.

| ID | Lot | Type | Mission | Dépend de |
| --- | --- | --- | --- | --- |
| TH-001 | 0 | docs | Verser les spécifications V2.1 dans `docs/specs/`, un fichier par module, FR et EN | Aucune |
| TH-002 | 0 | code | JSON Schema des formats (manifeste, mission, tentative, rapport de vérification, demande d'arbitrage) et exemples versionnés | TH-001 |
| TH-003 | 0 | code | CI : validation par parseur et par schéma de `.tokenhood/` et des exemples | TH-002 |
| TH-004 | 0 | docs | Skill `tokenhood-contribute` v0 (protocole, règle de conduite, sécurité) | TH-002 |
| TH-005 | 0 | docs | Skill `tokenhood-verify` v0 (périmètre déclaré, gabarit de rapport) | TH-002 |
| TH-006 | 0 | governance.instruction | Audit du code tokenpool, dossier pour ADR-001 | Aucune |
| TH-007 | 0 | governance.instruction | Dossier d'options pour ADR-002 (stack technique) | TH-001 |
| TH-008 | 0 | docs | **Matrice des garanties** v1 et registre de compatibilité initial | TH-001 |
| TH-009 | 0 | docs | **Contrats exécutables du protocole** : états, transitions, autorisations, générations, versions, reprise, cas limites, tests de conformité | TH-002 |
| TH-010 | 0 | research | **Protocole pilote et mesure de valeur** : choix des missions, données enregistrées, retour à 30 jours, gabarit du rapport de campagne | TH-001 |
| TH-011 | 0 | docs | **Charte opérationnelle d'amorçage** : responsabilités, délégations, admission provisoire, exploitation, engagements, FR et EN | TH-001 |
| TH-012 | 0 | governance.instruction | Recherche d'un projet externe pilote et dossier d'admission manuelle | TH-011 |
| TH-101 | 1 | code | Squelette du monorepo, CI, socle i18n (`locales/fr`, `locales/en`) | ADR-002 |
| TH-102 | 1 | code | Identité : OAuth GitHub, profil, langues | TH-101 |
| TH-103 | 1 | code | Identité : liens d'intérêt et calcul des exclusions | TH-102 |
| TH-104 | 1 | code | Gouvernance : éligibilité au vote, déport, choix de collège | TH-103 |
| TH-105 | 1 | code | Gouvernance : modèle et transitions d'une demande d'arbitrage, catégories | TH-102 |
| TH-106 | 1 | code | Gouvernance : calcul du résultat par mode de vote, quorum après déport, panel | TH-104, TH-105 |
| TH-107 | 1 | code | Gouvernance : registre des décisions déléguées et mandats | TH-105 |
| TH-108 | 1 | code | Gouvernance : publication bilingue et export vers `decisions/` | TH-106, TH-107 |
| TH-109 | 1 | code | Capacité : agents, autorisations, engagements et statuts | TH-102 |
| TH-110 | 1 | design | Maquettes de la console de gouvernance et du tableau de bord | TH-011 |
| TH-111 | 1 | code | Tableau de bord : capacité promise et mobilisable, besoin, couverture | TH-109, TH-110 |
| TH-112 | 1 | code | Outils MCP `request_arbitration`, `get_decision`, `list_decisions` | TH-105 |
| TH-113 | 1 | i18n | Relecture EN de toutes les chaînes du lot 1 | TH-111 |
| TH-201 | 2 | code | Missions : contrat, versions, dépendances typées, cycle de vie | TH-009, TH-102 |
| TH-202 | 2 | code | Tentatives : réservations avec générations, heartbeat, checkpoints, compatibles tokenpool | TH-201, ADR-001 |
| TH-203 | 2 | code | Plafonds de flux par projet et régulation | TH-202 |
| TH-204 | 2 | code | Serveur MCP : découverte, production, `get_guarantees` | TH-202 |
| TH-205 | 2 | code | GitHub App : indexation, PR depuis fork, événements d'intégration | TH-201 |
| TH-206 | 2 | code | Module skills et `get_context` | TH-201 |
| TH-207 | 2 | code | Compagnon local : plafonds par niveau, arrêt contrôlé | TH-204 |
| TH-208 | 2 | research | Tests de compatibilité par client et mise à jour du registre | TH-207, TH-008 |
| TH-301 | 3 | code | Assignation des vérifications, exclusions, attente sans vérificateur | TH-202, TH-103 |
| TH-302 | 3 | code | Rapports à périmètre déclaré, liaison à l'empreinte, invalidation | TH-301 |
| TH-303 | 3 | code | Désaccords, litiges, audit par échantillonnage | TH-302, TH-106 |
| TH-304 | 3 | code | Retour à 30 jours et indicateurs de valeur nette | TH-205 |
| TH-305 | 3 | governance.instruction | Admission manuelle et convention du projet externe pilote | TH-012 |
| TH-306 | 3 | research | Rapport de campagne pilote | TH-304, TH-305, TH-010 |
| TH-401 | 4 | code | Candidature et suivi de dossier | TH-102 |
| TH-402 | 4 | code | Connecteurs KYB, accès réservé au comité | TH-401 |
| TH-403 | 4 | docs | Modèle de convention v1, tiré des conventions pilotes | TH-305 |
| TH-404 | 4 | code | Génération de la convention et intégration DocuSeal | TH-403, TH-401 |
| TH-405 | 4 | code | Assistant d'onboarding (PR `.tokenhood/`) | TH-205, TH-404 |

---

← [Campagne pilote et critères de poursuite](campagne-pilote.md) · [Sommaire](README.md) · [Critères de recette du MVP](recette-mvp.md) →
