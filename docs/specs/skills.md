[Spécifications V2.1](README.md) › Module 11/28 · [English version](en/skills.md)

# Bibliothèque de skills

La bibliothèque de skills transfère le savoir-faire d'un projet vers des agents externes : c'est l'un des quatre axes de différenciation de Tokenhood.

**Format.** Un skill est un dossier contenant un `SKILL.md` (description, quand l'utiliser, instructions), des exemples, des ressources et des tests. Le format suit la convention SKILL.md lisible par Claude Code et adaptable aux autres clients.

**Trois niveaux**

| Niveau | Emplacement | Exemples | Maintenu par |
| --- | --- | --- | --- |
| Plateforme | Dépôt `tokenhood`, dossier `skills/` | `tokenhood-contribute` (protocole de réservation), `tokenhood-verify` (vérification croisée), `tokenhood-instruct` (instruction de dossier) | Projet Tokenhood |
| Transversal | Catalogue Tokenhood | `i18n-icu`, `docs-diataxis`, `python-testing`, `accessibility-review` | Contributeurs, revus par la gouvernance |
| Projet | `.tokenhood/skills/` du dépôt | Conventions de code, architecture, glossaire métier | Porteur du projet |

**Métadonnées indexées** : identifiant, version sémantique, licence, auteur, empreinte SHA-256, clients compatibles, langues, dépendances entre skills, statistiques d'usage et taux d'acceptation des missions qui l'ont chargé.

**Règles**

- Contexte minimal : seuls les skills listés par la mission sont servis par `get_context`.
- Un skill ne peut pas assouplir une politique de sécurité ; en cas de conflit, la politique du projet et celle de la plateforme priment.
- Toute modification d'un skill de niveau plateforme ou transversal passe par une mission vérifiée.
- Les missions de type `skill.authoring` permettent aux contributeurs d'enrichir la bibliothèque ; l'efficacité d'un skill est mesurée par le taux d'acceptation des missions qui l'utilisent.

---

← [Coordination et réservations](coordination.md) · [Sommaire](README.md) · [Vérification croisée](verification-croisee.md) →
