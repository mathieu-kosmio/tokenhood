[Campagne pilote](README.md) › Journal de campagne

# Journal de campagne

Registre de la campagne pilote, tenu selon le [protocole](protocole.md). Il ne recopie pas ce que d'autres sources contiennent déjà (contrats, forge, rapports de consommation) : il y renvoie, et garde ce qu'elles ne contiennent pas.

## Règles d'écriture

- **Ajout seul.** Une entrée n'est jamais réécrite ; une correction est une nouvelle entrée qui cite celle qu'elle corrige.
- **Dates en UTC**, au format `AAAA-MM-JJ` (et `HH:MM` quand l'heure compte). L'heure de Paris peut changer le jour : la PR #18 a été fusionnée le 2026-10-18 à 22:43 UTC, soit le 19/10 à 00:43 à Paris.
- **Une source par entrée** : PR, commit, rapport de consommation, discussion, décision. Une entrée sans source n'est pas recevable.
- **Rien de non public** sur les personnes : compte public de la forge et rôle seulement ; durées et commentaires publiés avec l'accord de la personne ([protocole, § 9](protocole.md#9-données-personnelles-et-publicité-du-journal)).
- **Qui écrit** : en amorçage, la PR du porteur qui passe une mission à `integrated` ou `cancelled` ajoute ses entrées ([protocole, § 10](protocole.md#10-rôles)).
- **Non enregistré** : ce qui n'a pas été observé au moment des faits est marqué ainsi, jamais reconstitué de mémoire.

## État initial au 2026-10-20

Reconstitué par TH-010 à partir du dépôt (`main` au commit `9aab163`), des 20 rapports de `.tokenhood/usage/` et de l'API GitHub (PR #1 à #22, relevé du 2026-10-20). Le classement des missions et des événements suit le protocole proposé ; il est à confirmer par le porteur.

### Missions

Missions intégrées. La date d'intégration est celle de la fusion de la PR du livrable ; l'estimation au cadrage n'a été donnée ni dans les contrats (`estimate.tokens_eq: null`) ni dans les PR de ces missions.

| Mission | Type | Taille | Risque | PR du livrable | Intégration (UTC) | Classe | Production comptée | Rapport de production | Retour dû |
| --- | --- | --- | --- | --- | --- | --- | ---: | --- | --- |
| TH-001 | docs | M | low | #2 | 2026-10-18 08:17 | dérogatoire | 658 671 | `2026-10-17-TH-001-production` | 2026-11-17 |
| TH-002 | code | M | low | #3 | 2026-10-18 08:18 | dérogatoire | 128 290 | `2026-10-17-TH-002-production` | 2026-11-17 |
| TH-003 | code | S | medium | #4 | 2026-10-18 08:19 | dérogatoire | 11 679 | `2026-10-17-TH-003-production` | 2026-11-17 |
| TH-004 | docs | M | low | #16 | 2026-10-18 15:08 | dérogatoire | 314 203 | `2026-10-18-TH-004-production` | 2026-11-17 |
| TH-005 | docs | M | low | #18 | 2026-10-18 22:43 | dérogatoire | 330 328 | `2026-10-18-TH-005-production` | 2026-11-17 |
| TH-007 | governance.instruction | M | low | #5 | 2026-10-18 08:18 | dérogatoire | 27 884 | `2026-10-17-TH-007-production` | 2026-11-17 |
| TH-013 | code | M | medium | #7 | 2026-10-18 08:21 | dérogatoire | 59 539 | `2026-10-17-TH-013-production` | 2026-11-17 |
| TH-015 | code | M | medium | #11 | 2026-10-18 10:28 | dérogatoire | 468 589 | `2026-10-18-TH-015-production` | 2026-11-17 |
| TH-017 | code | M | low | #1 | 2026-10-18 08:17 | dérogatoire | 847 617 | `2026-10-17-TH-017-production` | 2026-11-17 |
| TH-018 | code | S | medium | #9, mise en ligne #10 | 2026-10-18 09:22 | dérogatoire | 96 391 | `2026-10-18-TH-018-production` (couvre #9 et #10) | 2026-11-17 |
| TH-019 | code | M | low | #12, complément #13 | 2026-10-18 09:53 | dérogatoire | 135 855 | `2026-10-18-TH-019-production` (108 031) et `2026-10-18-TH-019-illustration` (27 824) | 2026-11-17 |
| TH-020 | code | M | low | #19 | 2026-10-18 22:45 | dérogatoire | 604 067 | `2026-10-18-TH-020-production` | 2026-11-17 |
| TH-101 | code | M | medium | #6 | 2026-10-18 08:19 | dérogatoire | 124 316 | `2026-10-17-TH-101-production` | 2026-11-17 |
| **Total** | | | | | | | **3 807 429** | 14 rapports | |

Toutes sont dérogatoires pour la même raison : aucune vérification croisée par un autre utilisateur (événement E-10).

Missions en cours au 2026-10-20 :

| Mission | Type | PR | Estimation au cadrage | Source |
| --- | --- | --- | --- | --- |
| TH-006 | governance.instruction | #22, ouverte le 2026-10-19 | 150 000 à 400 000 tokens comptés | PR #22, section Mission |
| TH-008 | docs | #23, brouillon ouvert le 2026-10-20 | Non donnée à ce jour | PR #23 |
| TH-009 | docs | #24, brouillon ouvert le 2026-10-20 | Non donnée à ce jour | PR #24 |
| TH-010 | research | #25, ouverte le 2026-10-20 | 150 000 à 350 000 tokens comptés | PR #25, section Mission |

Les autres missions publiées sont `open` dans `.tokenhood/missions/` ; elles entrent au journal à leur première tentative.

### Consommation d'intégration

Tokens des sessions de l'agent du porteur consacrées à fusionner, régler et compléter les missions. La durée de session est une borne haute du temps d'attention, pauses comprises ([protocole, § 7](protocole.md#gain-humain-net-estimé)).

| Rapport | Missions servies | PR | Session (UTC) | Durée | Comptés | Objet |
| --- | --- | --- | --- | --- | ---: | --- |
| `2026-10-18-lot-0-integration` | TH-001, TH-002, TH-003, TH-007, TH-013, TH-017, TH-101 | #1 à #8 | 2026-10-18 08:17 → 08:41 | 24 min | 676 353 | Fusion des PR et passage à `integrated` (rapport rétroactif) |
| `2026-10-18-TH-015-integration` | TH-015 | #11, #14 | 2026-10-18 10:03 → 10:28 | 25 min | 11 576 | PR mise à jour sur `main`, CI, fusion, passage à `integrated` |
| `2026-10-18-TH-015-statuts-requis` | TH-015 | #15 | 2026-10-18 10:32 → 14:03 | 3 h 30 | 862 860 | Statuts de CI requis sur `main`, `CLAUDE.md` (événement E-08) |
| `2026-10-18-TH-004-integration` | TH-004 | #16, #17 | 2026-10-18 15:07 → 15:09 | 2 min | 27 454 | Fusion et passage à `integrated` |
| `2026-10-19-TH-005-TH-020-integration` | TH-005, TH-020 | #18, #19, #20 | 2026-10-18 22:34 → 22:45 | 12 min | 60 177 | Vérification mobile, correctif (événement E-09), fusion, passage à `integrated` |
| `2026-10-19-TH-004-TH-005-integration` | TH-004, TH-005 | #21 | 2026-10-19 15:26 → 19:08 | 3 h 42 | 222 173 | Travail de suite (événement E-12) |
| **Total** | | | | | **1 860 593** | 6 rapports |

L'intégration de TH-018 est comptée dans son rapport de production ; celle de TH-019 n'est comptée nulle part (son rapport s'arrête avant la PR).

### Événements

| N° | Date (UTC) | Mission | Événement | Cause | Description | Intervention | Source |
| --- | --- | --- | --- | --- | --- | --- | --- |
| E-01 | 2026-10-17 | TH-017 | Changement de contrat pendant la tentative | `contract` | Contrat mis en conformité avec le schéma de TH-002, publié après lui, dans la branche de la PR #1 avant sa fusion | Non enregistrée | PR #3 (Écarts), commit `5c62081` |
| E-02 | 2026-10-17 | TH-002 | Écart de périmètre déclaré | `scope` | Périmètre élargi à `tools/validate/` et `.tokenhood/missions/` : sans validateur, le critère d'acceptation n'était pas vérifiable | Aucune | PR #3 (Écarts) |
| E-03 | 2026-10-17 | TH-101 | Dépendance non satisfaite | `dependency` | Intégrée avant TH-015, déclarée comme dépendance `integrated` dans son contrat ; les scans de sécurité sont restés à TH-015 | Fusion par le porteur, dépendance non satisfaite | PR #6 (Écarts), `.tokenhood/missions/TH-101.yaml` |
| E-04 | 2026-10-17 | TH-013 | Livrable partiel déclaré | `other` | Stockage S3 non inclus, renvoyé à une mission dédiée avant TH-302 | Aucune | PR #7 (Écarts) |
| E-05 | 2026-10-17 → 2026-10-19 | Lot 0 | Exécution hors environnement isolé | `environment` | Les PR qui décrivent leur environnement indiquent le poste du porteur, sans Docker : commandes du dépôt exécutées sur le poste, images essayées dans GitHub Actions ; protection déclarative | Aucune | PR #1, #7, #11, #16, #18, #19, #21, #22 ; `CLAUDE.md` |
| E-06 | 2026-10-18 | TH-015 | Reprise dans la même tentative | `dependency` | Premier essai sur la base de la branche de TH-013, reporté sur `main`, puis rebasé sur TH-019 | Non enregistrée | `2026-10-18-TH-015-production` (notes) |
| E-07 | 2026-10-18 | TH-015 | Écart de périmètre déclaré | `scope` | Périmètre élargi à `tools/no-llm-sdk/`, au `Dockerfile` (TH-013), à `landing/Dockerfile` (TH-017), déjà intégrés, et à `CLAUDE.md` | Aucune | PR #11 (Écarts) |
| E-08 | 2026-10-18 | TH-015 | Travail de suite | `ci` | Statuts de CI rendus obligatoires sur `main` après la fusion ; 862 860 tokens comptés, surtout en `cache_creation` : contexte réécrit deux fois en cache après des pauses de plus d'une heure | Intégration, prévue (porteur) | PR #15 ; `2026-10-18-TH-015-statuts-requis` (notes) |
| E-09 | 2026-10-18 | TH-020 | Modification après retour du porteur | `review` | Libellé de lot ramené sur une ligne en mobile, après vérification de la page anglaise par le porteur, avant fusion | Revue par le porteur, hors protocole faute de vérificateur assigné | Commit `923329c` (PR #19) ; `2026-10-19-TH-005-TH-020-integration` (notes) |
| E-10 | 2026-10-17 → 2026-10-20 | Toutes | Vérification croisée absente | `review` | Aucune revue et aucun commentaire sur les PR #1 à #22 ; toutes ouvertes et fusionnées par le même compte | Fusion par le porteur sans vérification croisée | API GitHub, relevé du 2026-10-20 |
| E-11 | 2026-10-18 | TH-004, TH-005 | Questions en conduite `continue` | `question` | 3 questions (TH-004) et 6 (TH-005) posées dans la PR, le porteur étant à la fois contributeur et décideur ; réponses par défaut acceptées à la fusion, confirmées pour TH-004 par DEC-2026-004 | Décision du porteur, prévue | PR #16 et #18 (Questions signalées) ; `decisions/DEC-2026-004-skill-contribute-amorcage.md` |
| E-12 | 2026-10-19 | TH-004, TH-005 | Travail de suite | `other` | Tests des skills en CI, liens `.claude/skills`, skill déclaré dans les huit missions ouvertes, DEC-2026-004 ; 222 173 tokens comptés | Intégration, prévue (porteur) | PR #21 ; `2026-10-19-TH-004-TH-005-integration` |
| E-13 | 2026-10-17 | TH-001 | Travail de suite | `other` | Traduction anglaise des spécifications au statut `machine`, relecture à faire | Aucune à ce jour | PR #2 ; `CLAUDE.md`, prochaines étapes |
| E-14 | 2026-10-17 → 2026-10-19 | Toutes | Interventions humaines | `other` | Chaque session de production et d'intégration a été lancée et pilotée par le porteur, contributeur unique (20 rapports au compte `mathieu-kosmio`) ; durées humaines non enregistrées | Prévue (le porteur réserve pour son propre agent) ; part hors protocole non enregistrée | `.tokenhood/usage/` |

Aucun défaut après intégration n'est rattaché à une mission au 2026-10-20 : le seul correctif relevé (E-09) précède la fusion.

### Couverture du dimensionnement

| Dimension | Cible | Au 2026-10-20 | Source |
| --- | --- | --- | --- |
| Missions réelles | 15 à 20 | 13 intégrées, 4 en cours, aucune abandonnée | Contrats, PR |
| Types | Code, documentation, i18n, gouvernance | Intégrées : code 9, docs 3, governance.instruction 1 ; **i18n 0**. En cours : docs 2, governance.instruction 1, research 1 | Champ `type` des contrats |
| Contributeurs | Plusieurs, dont un extérieur | **1** (`mathieu-kosmio`), aucun extérieur | Champ `contributor` des rapports |
| Clients d'agent | 2 lorsque disponibles | **1** : Claude Code 2.1.299, `claude-opus-5-5` (et `claude-haiku-5-5` pour des contrôles de lecture de TH-004) | Champ `agent` et notes des rapports |
| Vérifications croisées | Une par mission | **0** | API GitHub (E-10) |
| Mainteneur externe | Au moins un | **0** ; recherche confiée à TH-012 (`open`) | Contrats |

### Consommation agrégée

| Nature de contribution | Rapports | Tokens comptés |
| --- | ---: | ---: |
| `production` | 14 | 3 807 429 |
| `integration` | 6 | 1 860 593 |
| `verification` | 0 | 0 |
| **Total** | **20** | **5 668 022** |

Lectures de cache déclarées, non comptées : 305 407 329. Méthode et nature : `client_transcript`, `declared` pour les 20 rapports. Rapport intégration / production : 0,49 ; il tombe à 0,20 sans les deux sessions de 3 h 30 et 3 h 42 (E-08, E-12).

Production comptée par taille : missions M de 27 884 (TH-007) à 847 617 (TH-017) ; missions S : 11 679 (TH-003) et 96 391 (TH-018). Sur ces 13 missions, la taille annoncée ne prédit pas l'ordre de grandeur de la consommation ; deux biais connus y contribuent, les sessions partagées découpées en fenêtres et le poids du cache après une pause ([protocole, § 11](protocole.md#11-limites-connues-de-la-mesure)).

## Retours à 30 jours

Fenêtre de réponse : de J+30 à J+44 ([questionnaire](retour-a-30-jours.md)). Les 13 missions intégrées le 2026-10-18 (UTC) arrivent à J+30 le même jour : une seule demande groupée suffit.

| Mission | Intégration | Demande (J+30) | Relance (J+37) | Échéance (J+44) | Réponse le | 1. Service | 2. Encadrement | 3. Corrections | `T_sans` (h) | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TH-001 | 2026-10-18 | 2026-11-17 | 2026-11-24 | 2026-12-01 | | | | | | |
| TH-002 | 2026-10-18 | 2026-11-17 | 2026-11-24 | 2026-12-01 | | | | | | |
| TH-003 | 2026-10-18 | 2026-11-17 | 2026-11-24 | 2026-12-01 | | | | | | |
| TH-004 | 2026-10-18 | 2026-11-17 | 2026-11-24 | 2026-12-01 | | | | | | |
| TH-005 | 2026-10-18 | 2026-11-17 | 2026-11-24 | 2026-12-01 | | | | | | |
| TH-007 | 2026-10-18 | 2026-11-17 | 2026-11-24 | 2026-12-01 | | | | | | |
| TH-013 | 2026-10-18 | 2026-11-17 | 2026-11-24 | 2026-12-01 | | | | | | |
| TH-015 | 2026-10-18 | 2026-11-17 | 2026-11-24 | 2026-12-01 | | | | | | |
| TH-017 | 2026-10-18 | 2026-11-17 | 2026-11-24 | 2026-12-01 | | | | | | |
| TH-018 | 2026-10-18 | 2026-11-17 | 2026-11-24 | 2026-12-01 | | | | | | |
| TH-019 | 2026-10-18 | 2026-11-17 | 2026-11-24 | 2026-12-01 | | | | | | |
| TH-020 | 2026-10-18 | 2026-11-17 | 2026-11-24 | 2026-12-01 | | | | | | |
| TH-101 | 2026-10-18 | 2026-11-17 | 2026-11-24 | 2026-12-01 | | | | | | |

## Entrées suivantes

Les nouvelles entrées s'ajoutent sous ce titre, dans l'ordre chronologique, avec les colonnes de la table des événements ; les missions intégrées ensuite s'ajoutent aux tables « Missions » et « Retours à 30 jours » par une nouvelle ligne.

| N° | Date (UTC) | Mission | Événement | Cause | Description | Intervention | Source |
| --- | --- | --- | --- | --- | --- | --- | --- |
