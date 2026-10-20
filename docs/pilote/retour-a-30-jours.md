[Campagne pilote](README.md) › Retour à 30 jours

# Retour à 30 jours · 30-day feedback

Trois questions fermées, posées une fois par mission intégrée, au mainteneur qui l'a intégrée, 30 jours après l'intégration ; une réponse prend moins d'une minute. Les questions et leurs réponses sont celles de [valeur-nette.md](../specs/valeur-nette.md) (version anglaise : [en/valeur-nette.md](../specs/en/valeur-nette.md)), sans changement de formulation. Ce document ajoute les codes, les définitions qui rendent les réponses comparables, le calendrier et la manière de les enregistrer.

## Le questionnaire · The questionnaire

| # | Français | English | Réponses · Answers | Codes |
| --- | --- | --- | --- | --- |
| 1 | Cette contribution a-t-elle rendu le service attendu ? | Did this contribution deliver the expected service? | oui · en partie · non / yes · partly · no | `yes`, `partial`, `no` |
| 2 | Le travail d'encadrement valait-il le résultat ? | Was the supervision work worth the result? | oui · à peu près · non / yes · roughly · no | `yes`, `roughly`, `no` |
| 3 | A-t-elle demandé des corrections après intégration ? | Did it require corrections after integration? | aucune · mineures · importantes / none · minor · major | `none`, `minor`, `major` |

Deux champs facultatifs, hors des trois questions :

- **Commentaire** (une ligne), publié seulement si la personne l'accepte · *Comment (one line), published only with consent.*
- **Temps sans Tokenhood** (`T_sans`, en heures), pour les missions où une comparaison en temps a du sens : le temps qu'aurait demandé le même résultat sans Tokenhood, estimé · *Time without Tokenhood, in hours, estimated, for missions where a time comparison makes sense.*

Les codes servent au journal et à TH-304, qui reprendra le questionnaire dans la plateforme ; les libellés affichés viendront des fichiers de locales, comme toute chaîne d'interface.

## Pour répondre de la même façon · Answering consistently

| Terme | Ce qu'il recouvre |
| --- | --- |
| Service attendu | L'`objective` du contrat et ce que le livrable devait permettre ensuite, tel qu'on le constate 30 jours après, pas la conformité aux critères d'acceptation, déjà jugée par la vérification |
| Travail d'encadrement | Tout ce que la mission a demandé au mainteneur : cadrage du contrat, réponses aux questions, revue, corrections, intégration ; ce sont les termes de `G` dans [valeur-nette.md](../specs/valeur-nette.md) |
| Corrections mineures | Corrigées sans revenir sur la conception du livrable, chacune en une PR de petite taille |
| Corrections importantes | Reprise d'une partie du livrable, retour arrière, ou nouvelle mission pour réparer |
| Corrections | Défauts du livrable seulement ; une évolution ou un travail de suite qui n'était pas dans le contrat n'est pas une correction |

## Qui répond, et quand

- **Qui** : le mainteneur qui a fusionné la PR du livrable. Pour le projet Tokenhood, c'est aujourd'hui le porteur ; pour le projet externe, son mainteneur. Un agent ne répond jamais à la place d'un humain.
- **Date de référence** : l'horodatage UTC de la fusion de la PR du livrable (événement de forge), pas celui de la PR qui passe la mission à `integrated`.
- **J+30** : envoi de la demande. Les missions intégrées la même semaine peuvent être regroupées en une seule demande.
- **J+37** : une relance, une seule.
- **J+44** : sans réponse, la mission est enregistrée « sans réponse » et passe à `closed` par délai écoulé ([missions.md](../specs/missions.md)). Une réponse tardive reste enregistrée, avec sa date.

La spécification ne fixe pas la durée du délai : la fenêtre de 14 jours après J+30 est une valeur par défaut, que le porteur peut changer.

## Où répondre en amorçage

Tant que TH-304 n'est pas livrée, la demande et la réponse passent par la forge, sans nouvel outil.

**Une mission** : un commentaire sur la PR du livrable, déjà fusionnée.

```text
Retour à 30 jours TH-xxx
1. Service attendu : oui | en partie | non
2. Encadrement : oui | à peu près | non
3. Corrections après intégration : aucune | mineures | importantes
Temps sans Tokenhood (facultatif) : __ h
Commentaire (facultatif, publié) :
```

**Plusieurs missions** : une discussion GitHub « Retours à 30 jours · AAAA-MM-JJ » (catégorie General, tant que les catégories du dépôt n'existent pas), avec un tableau d'une ligne par mission.

```text
| Mission | 1. Service | 2. Encadrement | 3. Corrections | T_sans (h) | Commentaire |
| TH-xxx  | oui        | à peu près     | aucune         |            |             |
```

The English version of both blocks, for an external maintainer:

```text
30-day feedback TH-xxx
1. Expected service: yes | partly | no
2. Supervision worth it: yes | roughly | no
3. Corrections after integration: none | minor | major
Time without Tokenhood (optional): __ h
Comment (optional, published):
```

Les réponses sont ensuite recopiées dans le [journal de campagne](journal-de-campagne.md), section « Retours à 30 jours », avec le lien du commentaire comme source.

## Ce que déclenchent les retours

- **Missions closes** : chaque réponse, ou le délai écoulé, permet de passer la mission à `closed`.
- **Retours majoritairement négatifs** : [valeur-nette.md](../specs/valeur-nette.md) prévoit alors une revue du cadrage du projet et, si besoin, une demande d'arbitrage. Lecture proposée par défaut, à confirmer par le porteur : plus de la moitié des retours reçus sur un même projet au cours des 30 derniers jours répondent `no` à la question 1 ou à la question 2.
- **Correction importante** : elle ouvre une entrée « défaut après intégration » dans le journal, rattachée à la mission, si elle n'y figure pas déjà.
