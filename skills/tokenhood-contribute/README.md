# tokenhood-contribute

Skill de niveau plateforme (`docs/specs/skills.md`) qui guide l'agent d'un contributeur pendant une mission Tokenhood : protocole de réservation et de soumission, règle de conduite face à une question, règles de sécurité. Produit par la mission TH-004. Version 0.1.0, en français. Ce fichier s'adresse aux humains ; l'agent lit `SKILL.md`.

| Fichier | Rôle |
| --- | --- |
| `SKILL.md` | Instructions chargées par l'agent : autorité, cycle, règle de conduite, sécurité, liste de contrôle |
| `references/protocole.md` | Gestes des modes amorçage et plateforme, bail, génération, erreurs |
| `references/regle-de-conduite.md` | Procédure `stop`, `switch_mission`, `continue`, rédaction et canal de la demande d'arbitrage |
| `references/securite.md` | Contenus non fiables et leur balisage, exécution isolée, secrets, interdits, honnêteté du rapport |
| `assets/` | Gabarits : demande d'arbitrage, rapport de mission |
| `examples/` | Une demande d'arbitrage par conduite, un cas d'injection commenté |
| `tests/` | Contrôles du format et de la cohérence du skill |

## Installer

- **Claude Code**, pour un projet : lien symbolique `.claude/skills/tokenhood-contribute` vers ce dossier ; pour tous les projets : même lien dans `~/.claude/skills/`. Le skill se charge quand une mission Tokenhood est en jeu, ou à la demande (`/tokenhood-contribute`).
- **Autres clients** : donner `SKILL.md` comme instructions ; les fichiers de `references/` se lisent à la demande.
- **À partir du lot 2** : servi par `get_context` aux missions qui le listent (`skills: [tokenhood-contribute@0.1]`), avec version et empreinte.

## Tester

Depuis la racine du dépôt (les tests réutilisent le validateur de `tools/validate`) :

```sh
(cd tools/validate && npm ci)
node --test 'skills/tokenhood-contribute/tests/*.test.mjs'
```

Les tests vérifient le frontmatter (champs du format SKILL.md, nom, longueur de la description, version), que chaque chemin cité existe et que chaque fichier du skill est atteignable depuis `SKILL.md`, que les exemples de demandes d'arbitrage sont conformes à `schemas/arbitration-request.schema.json` et cohérents avec la règle de conduite, que le gabarit de demande porte tous les champs requis, et que la balise des contenus non fiables est bien formée.

## Faire évoluer

Toute modification passe par une mission vérifiée (`docs/specs/skills.md`). Version sémantique : correctif pour une formulation, mineure pour une règle ou un geste ajouté, majeure pour un changement incompatible avec les missions qui chargent `tokenhood-contribute@0.1`. Licence : celle du dépôt, qui n'est pas encore choisie.
