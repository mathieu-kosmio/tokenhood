# tokenhood-verify

Skill de niveau plateforme (`docs/specs/skills.md`) qui guide l'agent d'un vérificateur pendant la vérification croisée d'une mission Tokenhood : éligibilité, liaison du rapport à la version du contrat et au commit, commandes d'acceptation relancées, rapport à périmètre déclaré, invalidation, sécurité. Produit par la mission TH-005. Version 0.1.0, en français ; à charger comme `tokenhood-verify@0.1`. Ce fichier s'adresse aux humains ; l'agent lit `SKILL.md`. Le pendant côté producteur est `skills/tokenhood-contribute/`.

| Fichier | Rôle |
| --- | --- |
| `SKILL.md` | Instructions chargées par l'agent : autorité, éligibilité, cycle, rapport et verdict, liaison et invalidation, sécurité, liste de contrôle |
| `references/protocole.md` | Gestes des modes amorçage et plateforme, identifiants d'amorçage, publication, consommation, désaccords, erreurs |
| `references/methode.md` | Lecture du contrat, contrôle du périmètre, commandes d'acceptation, examen par exigence, preuves, choix du verdict |
| `references/securite.md` | Soumission non fiable et balisage, injections visant la revue, exécution isolée, secrets, interdits, honnêteté |
| `assets/` | Gabarits : rapport de vérification (YAML, conforme au schéma), commentaire de revue GitHub |
| `examples/` | Un rapport par verdict (`pass`, `changes_requested`, `reject`), un cas d'injection commenté |
| `tests/` | Contrôles du format et de la cohérence du skill |

## Installer

- **Claude Code**, pour un projet : lien symbolique `.claude/skills/tokenhood-verify` vers ce dossier ; pour tous les projets : même lien dans `~/.claude/skills/`. Le skill se charge quand une vérification Tokenhood est en jeu, ou à la demande (`/tokenhood-verify`).
- **Autres clients** : donner `SKILL.md` comme instructions ; les fichiers de `references/` se lisent à la demande.
- **À partir du lot 2** : servi par `get_context` aux vérifications, avec version et empreinte.

## Tester

Depuis la racine du dépôt (les tests réutilisent le validateur de `tools/validate`) :

```sh
(cd tools/validate && npm ci --ignore-scripts)
node --test 'skills/tokenhood-verify/tests/*.test.mjs'
```

Les tests vérifient le frontmatter (champs du format SKILL.md, nom, longueur de la description, version), que chaque chemin cité existe et que chaque fichier du skill est atteignable depuis `SKILL.md`, que le gabarit de rapport est conforme à `schemas/review-report.schema.json`, porte tous ses champs et ses sections vérifié, non vérifié, incertain, qu'il y a un exemple de rapport par verdict, conforme au schéma et cohérent avec la mission d'exemple TH-104 (exigences recopiées, commandes du contrat relancées, commit complet), que les tables de `SKILL.md` décrivent chaque résultat et chaque verdict, que la balise des contenus non fiables est bien formée et identique à celle de `tokenhood-contribute`, et qu'aucun bloc de commande ne fusionne ni n'approuve.

## Faire évoluer

Toute modification passe par une mission vérifiée (`docs/specs/skills.md`). Version sémantique : correctif pour une formulation, mineure pour une règle ou un geste ajouté, majeure pour un changement incompatible avec les vérifications qui chargent `tokenhood-verify@0.1`. Les identifiants d'amorçage et le mode plateforme seront à revoir après TH-009 (contrats du protocole) et TH-301 (assignation des vérifications). Licence : celle du dépôt, qui n'est pas encore choisie.
