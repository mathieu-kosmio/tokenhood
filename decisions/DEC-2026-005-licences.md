# DEC-2026-005 · Licences du dépôt

- Date : 2026-10-20
- Catégorie : 3, décision collective prise par la gouvernance provisoire (le porteur) pendant l'amorçage, avant toute contribution externe
- Origine : question ouverte « Licence du code (AGPL-3.0 ou permissive) » (`docs/specs/risques-et-questions-ouvertes.md`, registre des décisions de `docs/specs/plan-de-developpement.md`), condition de la porte du lot 0. TH-006 (PR #22) a relevé une contrainte de plus : tokenpool refuse d'inscrire un dépôt sans licence reconnue par GitHub.
- Décision : une licence par couche.

| Couche | Chemins | Licence (SPDX) |
|---|---|---|
| Plateforme, et tout ce qui n'est pas cité plus bas | `apps/`, `packages/`, `landing/`, `tools/validate/`, `tools/no-llm-sdk/`, `design/`, `.github/`, `.tokenhood/`, fichiers de la racine | `AGPL-3.0-only` |
| Protocole, fait pour être repris par d'autres projets et d'autres clients d'agents | `schemas/`, `examples/`, `skills/`, `tools/usage/` | `Apache-2.0` |
| Documentation et registre des décisions | `docs/`, `decisions/` | `CC-BY-4.0` |

- Motifs :
  - Plateforme en AGPL-3.0 : Tokenhood est un service en ligne. La clause réseau oblige quiconque héberge une version modifiée à en publier le code, ce qui protège le commun d'une plateforme fermée qui en serait tirée. Version `only`, comme le prévoient les spécifications (`docs/specs/annexes-formats.md`).
  - Protocole en Apache-2.0 : les skills s'installent chez les contributeurs, les schémas et l'outil de mesure de consommation ont vocation à être repris ailleurs. Une licence permissive, avec licence de brevets, n'en freine pas l'adoption. Le code Apache-2.0 peut être intégré à la plateforme sous AGPL-3.0.
  - Documentation en CC BY 4.0 : licence faite pour des textes, avec attribution seule.
  - Le fichier `LICENSE` de la racine porte l'AGPL-3.0, que GitHub reconnaît (`agpl-3.0`) : l'inscription sur tokenpool devient possible. Le code MIT de tokenpool reste réutilisable sous l'une ou l'autre licence de code, avec sa notice.
- Options écartées : EUPL-1.2 (sa liste de compatibilité permet de redistribuer un dérivé sous GPL, sans clause réseau) ; GPL-3.0 et MPL-2.0 (pas de clause réseau) ; MIT ou Apache-2.0 pour la plateforme (dérivé fermé possible) ; CeCILL (non reconnue par GitHub) ; licences non commerciales ou « source disponible » (non libres, contraires à l'idée de commun).
- Hors du champ des licences : les noms et logos de Kosmio et de Tokenhood, qu'aucune de ces licences ne cède ; les polices Lexend, Public Sans et JetBrains Mono, sous SIL Open Font License 1.1.
- Contributions : chaque contribution est publiée sous la licence du dossier qu'elle modifie, avec le DCO et sans accord de cession de droits. Conséquence : après les premières contributions externes, changer de licence exigera l'accord de leurs auteurs.
- Mise en œuvre : `LICENSE` à la racine (AGPL-3.0) ; `LICENSE` Apache-2.0 dans `schemas/`, `examples/`, chaque dossier de `skills/` et `tools/usage/` ; `LICENSE` CC BY 4.0 dans `docs/` et `decisions/` ; champ `license` des deux skills ; `project.license` dans `.tokenhood/project.yaml` ; section « Licence » du README ; FAQ et mentions légales de la landing.
- À réexaminer : au transfert éventuel du dépôt vers une organisation dédiée, ou si un projet sous convention demande à reprendre une partie de la plateforme sous une autre licence.
