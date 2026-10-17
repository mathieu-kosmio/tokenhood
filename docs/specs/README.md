# Spécifications · Specifications

**FR** · Spécifications détaillées V2.1 de Tokenhood, versées par la mission [TH-001](../../.tokenhood/missions/TH-001.yaml) : un fichier par module, en français (langue source) et en anglais (traduction).

**EN** · Tokenhood V2.1 detailed specifications, published by mission [TH-001](../../.tokenhood/missions/TH-001.yaml): one file per module, in French (source language) and in English (translation).

## Organisation · Layout

| | Français (source) | English (translation) |
| --- | --- | --- |
| Chemin · Path | `docs/specs/<module>.md` | `docs/specs/en/<module>.md` |
| Nom de fichier · File name | identique · identical | identique · identical |

**FR** · Le français reste à la racine parce que des chemins déjà publiés y pointent : le périmètre de la mission TH-008 (`docs/specs/garanties.md`) et l'exemple de contrat TH-104 des [annexes](annexes-formats.md) (`docs/specs/gouvernance.md`). Chaque module porte le même nom de fichier dans les deux langues ; un lien en tête de page mène à l'autre version.

**EN** · French stays at the root because already published paths point there: the scope of mission TH-008 (`docs/specs/garanties.md`) and the TH-104 contract example in the [appendix](en/annexes-formats.md) (`docs/specs/gouvernance.md`). Each module has the same file name in both languages; a link at the top of each page leads to the other version.

## Modules

| # | Français | English |
| --- | --- | --- |
| 1 | [Synthèse](synthese.md) | [Summary](en/synthese.md) |
| 2 | [Vision et principes](vision-et-principes.md) | [Vision and principles](en/vision-et-principes.md) |
| 3 | [Valeur nette des contributions](valeur-nette.md) | [Net value of contributions](en/valeur-nette.md) |
| 4 | [Matrice des garanties](garanties.md) | [Guarantee matrix](en/garanties.md) |
| 5 | [Acteurs et rôles](acteurs-et-roles.md) | [Actors and roles](en/acteurs-et-roles.md) |
| 6 | [Architecture fonctionnelle](architecture-fonctionnelle.md) | [Functional architecture](en/architecture-fonctionnelle.md) |
| 7 | [Inscription et identité](inscription-et-identite.md) | [Registration and identity](en/inscription-et-identite.md) |
| 8 | [Sélection des projets et contractualisation](selection-et-contractualisation.md) | [Project selection and contracting](en/selection-et-contractualisation.md) |
| 9 | [Missions](missions.md) | [Missions](en/missions.md) |
| 10 | [Coordination et réservations](coordination.md) | [Coordination and claims](en/coordination.md) |
| 11 | [Bibliothèque de skills](skills.md) | [Skills library](en/skills.md) |
| 12 | [Vérification croisée](verification-croisee.md) | [Cross-verification](en/verification-croisee.md) |
| 13 | [Contributions non-code et internationalisation](non-code-et-i18n.md) | [Non-code contributions and internationalisation](en/non-code-et-i18n.md) |
| 14 | [Capacité et économie non marchande](capacite.md) | [Capacity and non-market economy](en/capacite.md) |
| 15 | [Exploitation et continuité](exploitation.md) | [Operations and continuity](en/exploitation.md) |
| 16 | [Gouvernance](gouvernance.md) | [Governance](en/gouvernance.md) |
| 17 | [API REST et serveur MCP](api-et-mcp.md) | [REST API and MCP server](en/api-et-mcp.md) |
| 18 | [Modèle de données](modele-de-donnees.md) | [Data model](en/modele-de-donnees.md) |
| 19 | [Architecture technique](architecture-technique.md) | [Technical architecture](en/architecture-technique.md) |
| 20 | [Sécurité et conformité](securite-et-conformite.md) | [Security and compliance](en/securite-et-conformite.md) |
| 21 | [Interfaces](interfaces.md) | [Interfaces](en/interfaces.md) |
| 22 | [Roadmap et ordre de développement](roadmap.md) | [Roadmap and development order](en/roadmap.md) |
| 23 | [Campagne pilote et critères de poursuite](campagne-pilote.md) | [Pilot campaign and continuation criteria](en/campagne-pilote.md) |
| 24 | [Backlog initial du projet Tokenhood](backlog-initial.md) | [Initial backlog of the Tokenhood project](en/backlog-initial.md) |
| 25 | [Critères de recette du MVP](recette-mvp.md) | [MVP acceptance criteria](en/recette-mvp.md) |
| 26 | [Risques et questions ouvertes](risques-et-questions-ouvertes.md) | [Risks and open questions](en/risques-et-questions-ouvertes.md) |
| 27 | [Annexes : formats](annexes-formats.md) | [Appendix: formats](en/annexes-formats.md) |
| 28 | [Sources](sources.md) | [Sources](en/sources.md) |

## Documents associés · Related documents

| Document | Français | English |
| --- | --- | --- |
| Plan de développement · Development plan | [Plan de développement](plan-de-developpement.md) | [Development plan](en/plan-de-developpement.md) |
| Étude de faisabilité technique · Technical feasibility study | [Étude de faisabilité technique](etude-de-faisabilite.md) | [Technical feasibility study](en/etude-de-faisabilite.md) |

**FR** · Le plan de développement découpe le travail en 56 missions et 5 lots. Il est versé tel qu'au 17 octobre 2026 ; les contrats de mission publiés dans [`.tokenhood/missions/`](../../.tokenhood/missions/) font autorité, conformément à la spécification ([Missions](missions.md), « Source qui fait autorité »). L'étude de faisabilité est antérieure à la V2.1, qui la cite dans ses [sources](sources.md).

**EN** · The development plan breaks the work down into 56 missions and 5 lots. It is published as it stood on 17 October 2026; the mission contracts published in [`.tokenhood/missions/`](../../.tokenhood/missions/) are authoritative, as the specification provides ([Missions](en/missions.md), "Authoritative source"). The feasibility study predates V2.1, which cites it in its [sources](en/sources.md).

## Provenance

| Document | Source | Version versée · Published version |
| --- | --- | --- |
| Spécifications détaillées V2.1 | [Claude Docs](https://claude.ai/code/artifact/70f6540c-17f9-4d27-95dd-8b33017cf7d2) | révision 33, 17/10/2026 |
| Plan de développement | [Claude Docs](https://claude.ai/code/artifact/c4fd5cb0-43b3-487d-a5a8-b98bf86c0a94) | révision 19, 17/10/2026 |
| Étude de faisabilité technique | [Claude Docs](https://claude.ai/code/artifact/c0ae93a5-7d8c-4e48-87fe-2e9e34e4e661) | révision 9, 17/10/2026 |

**FR** · Ces documents sources sont privés ; les fichiers de ce dossier en sont la version publique. Le texte français reprend l'export Markdown des sources sans modification. Trois ajouts de forme seulement : les schémas embarqués, absents de l'export, sont transcrits en diagrammes Mermaid (titre, sous-titre et légende compris) ; les renvois internes (« section … », liens vers les documents versés ici) deviennent des liens relatifs ; chaque page reçoit une ligne de navigation. La traduction anglaise a le statut `machine` défini dans le module [Contributions non-code et internationalisation](non-code-et-i18n.md) ; elle passe `reviewed` après relecture.

**EN** · These source documents are private; the files in this folder are their public version. The French text reproduces the Markdown export of the sources without modification. Only three formal additions: the embedded diagrams, missing from the export, are transcribed as Mermaid diagrams (title, subtitle and legend included); internal cross-references ("section …", links to the documents published here) become relative links; each page gets a navigation line. The English translation has the `machine` status defined in the [Non-code contributions and internationalisation](en/non-code-et-i18n.md) module; it becomes `reviewed` after proofreading.
