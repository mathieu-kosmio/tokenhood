[Campagne pilote](README.md) › Protocole

# Protocole de la campagne pilote

- Mission : TH-010 (`research`), contrat version 3
- Date : 2026-10-20
- Statut : **proposé**. Le protocole s'applique dès sa fusion par le porteur ; les mainteneurs le modifient par une PR. Il ne fixe aucun seuil de poursuite et ne décide rien à la place de la gouvernance.
- Sources : [Campagne pilote et critères de poursuite](../specs/campagne-pilote.md), [Valeur nette des contributions](../specs/valeur-nette.md), [Capacité](../specs/capacite.md), [Missions](../specs/missions.md), [Matrice des garanties](../specs/garanties.md), [Gouvernance](../specs/gouvernance.md), [Modèle de données](../specs/modele-de-donnees.md), [Plan de développement](../specs/plan-de-developpement.md), `.tokenhood/project.yaml`, `schemas/usage-report.schema.json`.

La spécification fixe le cadre : 15 à 20 missions réelles, ce qui est enregistré, trois démonstrations qui conditionnent la poursuite, aucun seuil chiffré fixé à l'avance ([campagne-pilote.md](../specs/campagne-pilote.md)). Ce protocole dit comment s'y prendre : quelles missions entrent dans la campagne, qui enregistre quoi, où et quand, comment chaque démonstration se lit dans les données, et ce qui reste hors d'atteinte de la mesure.

## 1. Ce que la campagne doit permettre de juger

Chaque démonstration de la spécification devient une question d'évaluation, à laquelle répondent des indicateurs définis à l'avance. Le rapport de campagne ([gabarit](gabarit-rapport-de-campagne.md)) reprend ces indicateurs tels quels, avec leur nature.

| Démonstration ([campagne-pilote.md](../specs/campagne-pilote.md)) | Question d'évaluation | Indicateurs principaux (§ 7) |
| --- | --- | --- |
| 1. La boucle fonctionne de manière reproductible | Des missions vont-elles de la publication à l'intégration en suivant le protocole, sans intervention hors protocole des fondateurs, et cela tient-il quand les producteurs et les vérificateurs ne sont pas des fondateurs ? | Missions conformes (§ 3), interventions hors protocole par mission, missions menées sans fondateur, reprises, délais |
| 2. Le projet bénéficiaire y gagne réellement | Le temps et les difficultés transférés au mainteneur restent-ils acceptables selon lui ? | Retours à 30 jours, gain humain net estimé, défauts après intégration, travaux de suite, avis de fin de campagne du mainteneur externe |
| 3. Les limites sont connues et respectées | Ce qui n'est pas garanti est-il présenté comme tel : clients non compatibles, mesures estimatives, protections déclaratives ? | Nature et méthode de chaque mesure de consommation, protections déclaratives par contribution, statut des clients au registre de compatibilité |

La campagne se juge sur des constats qualifiés, pas sur un score : chaque indicateur porte sa nature (mesuré, déclaré ou estimé), comme l'exige [gouvernance.md](../specs/gouvernance.md), et le rapport sépare les constats de leur interprétation.

## 2. Période et phases

La campagne commence au lot 0 sur le projet Tokenhood et se termine au lot 3 avec au moins un projet externe ([campagne-pilote.md](../specs/campagne-pilote.md)). Elle traverse trois phases, qui se recouvrent :

| Phase | Lots | Ce qui change | Qui enregistre |
| --- | --- | --- | --- |
| A. Amorçage | 0 à 2 | Missions du projet Tokenhood, coordination manuelle par GitHub ([plan, cycle d'amorçage](../specs/plan-de-developpement.md)) | Le porteur, dans le [journal](journal-de-campagne.md), à partir des PR, des rapports de consommation et de ses propres observations |
| B. Outillage | 2 et 3 | Les gestes manuels sont remplacés : réservation (TH-202), assignation (TH-301), retour à 30 jours et indicateurs (TH-304) | La plateforme pour ce qu'elle observe ; le journal pour le reste |
| C. Projet externe | 3 | Un projet admis manuellement (TH-305), avec son mainteneur | Le mainteneur externe répond au retour à 30 jours ; le porteur tient le journal |

**Début.** La campagne couvre rétroactivement les missions du lot 0 déjà réalisées, depuis la première PR de mission (TH-017, PR #1, ouverte le 17/10/2026). Leur état initial est reconstitué dans le journal à partir de sources datées ; ce qui n'a pas été observé à l'époque, comme le temps humain, y est marqué « non enregistré » et n'est jamais reconstitué de mémoire.

**Fin.** Elle se termine quand trois conditions sont réunies : au moins une mission du projet externe intégrée et son retour à 30 jours recueilli ou son délai écoulé, les retours à 30 jours des missions intégrées avant la clôture du journal recueillis ou échus, et le rapport TH-306 publié. La décision de poursuivre, d'ajuster ou d'arrêter suit le rapport ; elle est collective et ne fait pas partie de la campagne ([plan, porte du lot 3](../specs/plan-de-developpement.md)).

**Points d'étape.** À chaque porte de lot (0, 1, 2), le porteur publie un point d'étape court, qui reprend les sections 2 à 5 du [gabarit du rapport](gabarit-rapport-de-campagne.md) sur les données du moment. La porte du lot 0 demande déjà que les difficultés soient « consignées dans le journal de campagne » ([plan, porte du lot 0](../specs/plan-de-developpement.md)).

## 3. Missions de la campagne

**Inclusion exhaustive.** Toute mission publiée du projet Tokenhood, puis du projet externe, entre le début et la fin de la campagne, en fait partie, y compris abandonnée, annulée ou reprise. Il n'y a pas d'échantillon à choisir : la spécification demande d'enregistrer « toutes les missions, y compris abandonnées ». Les 15 à 20 missions réelles sont un minimum de dimensionnement, pas une sélection.

**Le dimensionnement se suit sur une grille de couverture** ([campagne-pilote.md](../specs/campagne-pilote.md)), tenue à jour dans le journal :

| Dimension | Cible de la spécification | Comment elle se compte |
| --- | --- | --- |
| Missions réelles | 15 à 20 | Missions intégrées ou abandonnées après au moins une tentative |
| Types variés | Code, documentation, i18n, gouvernance | Champ `type` du contrat ; `governance.*` compte comme gouvernance |
| Contributeurs | Plusieurs, dont au moins un extérieur à l'équipe fondatrice | Champ `contributor` des rapports de consommation `production` et `verification` |
| Clients d'agent | Deux différents lorsque disponibles | Champ `agent.client` des rapports de consommation |
| Mainteneur externe | Au moins un, sur un projet admis manuellement | Projet sous convention admis par TH-305 |

Quand une case reste vide, le porteur peut publier ou mettre en avant une mission qui la remplit (champ `priority`) ; le protocole ne choisit pas ces missions à sa place. Le journal signale les cases vides à chaque point d'étape.

**Mission conforme, mission dérogatoire.** Chaque mission est classée à son intégration :

- **conforme** : elle a suivi tout le cycle de la spécification, soit contrat publié, réservation, production, vérification croisée par l'agent d'un autre utilisateur, approbation et fusion par un humain du projet ([plan, cycle d'amorçage](../specs/plan-de-developpement.md)) ;
- **dérogatoire** : une étape manque ou a été tenue par la même personne qu'une autre, par exemple une production et une vérification du même utilisateur, ou une fusion sans vérification croisée.

Les deux classes sont enregistrées ; le rapport les présente séparément. La démonstration 1 ne peut s'appuyer que sur des missions conformes : une mission dérogatoire renseigne sur le coût et la qualité du livrable, pas sur la reproductibilité de la boucle.

**Travail hors mission.** Une PR qui ne réalise aucune mission (passage à `integrated`, mise à jour de `CLAUDE.md`, réglage de la CI) n'est pas une mission de la campagne. Sa consommation et le temps humain qu'elle demande sont imputés aux missions qu'elle sert, comme coût d'intégration.

## 4. Données enregistrées

La règle de [valeur-nette.md](../specs/valeur-nette.md) s'applique : ne pas alourdir la ressource rare. Ce qu'une source existante contient déjà (contrat, forge, rapport de consommation) n'est pas recopié à la main ; le journal ne garde que ce qu'aucune autre source ne contient, et la référence aux autres.

| Donnée | Définition | Source | Saisie | Nature |
| --- | --- | --- | --- | --- |
| Mission | Identifiant, type, taille, risque, priorité, version du contrat | `.tokenhood/missions/` sur `main` | Aucune | Fait |
| Tentative | Début, fin, issue (soumise, libérée, expirée, abandonnée), version du contrat figée | Amorçage : réservation et PR ; plateforme : `Attempt` | Journal en amorçage | Déclaré, puis mesuré |
| Événements de forge | Ouverture de la PR, revues, commits, fusion | API de la forge | Aucune | Mesuré |
| Estimation au cadrage | Fourchette de tokens annoncée avant le travail | `estimate.tokens_eq` du contrat, sinon section « Mission » de la PR | Aucune | Déclaré |
| Consommation | Tokens comptés par contribution, par nature de contribution (`production`, `verification`, `drafting`, `integration`) | `.tokenhood/usage/*.yaml` | Aucune | Déclaré (`client_transcript`) ou estimé |
| Blocage | Arrêt ou détour du travail, avec sa cause (§ 5) | Rapport de mission (sections Écarts, Non vérifié), observation du porteur | Journal | Déclaré |
| Intervention humaine | Rôle, compte public, date, nature, prévue ou hors protocole (§ 6), durée si la personne la déclare | Observation du porteur, forge | Journal | Déclaré ; durée facultative |
| Reprise | Nouvelle tentative sur une mission, ou travail repris après un changement de contrat | Réservations, PR | Journal | Fait |
| Modification après revue | Commit poussé sur la PR après une revue croisée ou un retour du porteur, avant fusion | Forge | Aucune, sauf la cause | Mesuré |
| Défaut après intégration | Non-conformité du livrable à son contrat, découverte après la fusion, avec sa gravité (mineure, importante) | Issue ou PR de correction rattachée à la mission | Journal | Déclaré |
| Travail de suite | Travail rendu nécessaire par l'intégration mais absent du contrat (activation, réglage, documentation annexe) | PR de suite | Journal | Déclaré |
| Question et décision | Demande d'arbitrage : conduite, caractère bloquant, délai de décision | Discussion GitHub, PR, puis plateforme | Journal en amorçage | Fait |
| Retour à 30 jours | Trois réponses fermées, commentaire facultatif | [Questionnaire](retour-a-30-jours.md) | Une réponse par mission | Déclaré |
| Temps sans Tokenhood | `T_sans`, estimé par le porteur | Questionnaire, champ facultatif | Une valeur par mission | Estimé |
| Contenu non fiable, incident de sécurité | Signalement dans un rapport de mission ou de vérification | Rapports | Journal (décompte et lien ; jamais le détail d'une vulnérabilité) | Déclaré |

**Écarts entre estimation et consommation.** Pour chaque mission qui a une estimation, le journal porte la fourchette et les tokens comptés de production ; le rapport donne la position (sous la fourchette, dedans, au-dessus) et le rapport consommation sur borne haute. Les contrats du lot 0 ont tous `estimate.tokens_eq: null` : l'estimation vient alors de la PR, quand l'agent l'y a donnée au cadrage, comme le demande `tokenhood-contribute`.

**Régulation du flux.** Le journal note chaque fois qu'un plafond de `flow_limits` est atteint (3 en production, 5 en attente de revue ou d'intégration, `.tokenhood/project.yaml`) et ce qui a été suspendu en conséquence ([valeur-nette.md](../specs/valeur-nette.md), section Régulation du flux).

## 5. Causes de blocage

Une liste fermée rend les blocages comparables d'une mission à l'autre. Un blocage peut avoir plusieurs causes ; « autre » oblige à décrire.

| Code | Cause | Exemple |
| --- | --- | --- |
| `dependency` | Dépendance non satisfaite ou intégrée en retard | Mission intégrée avant une dépendance déclarée |
| `contract` | Contrat ambigu, incomplet ou modifié pendant la tentative | Contrat mis en conformité avec un schéma publié après lui |
| `question` | Question ouverte selon la règle de conduite (`continue`, `switch_mission`, `stop`) | Demande d'arbitrage bloquante |
| `environment` | Outil, isolement ou accès manquant sur le poste | Docker indisponible, commandes exécutées hors conteneur |
| `ci` | Statut requis absent, rouge ou instable | Statut attendu qu'aucun workflow ne produit |
| `review` | Aucun vérificateur éligible, ou revue en attente | `awaiting_reviewer` |
| `capacity` | Capacité épuisée, plafond de session ou de budget atteint | Session interrompue au plafond |
| `scope` | Le livrable exige de sortir de `scope.paths` | Fichier déjà intégré à modifier |
| `other` | À décrire | |

## 6. Interventions humaines

La démonstration 1 demande que le succès ne dépende pas « d'une intervention discrète et permanente des fondateurs » ([campagne-pilote.md](../specs/campagne-pilote.md)). Le protocole distingue donc les interventions que le cycle prévoit de celles qui le compensent.

| Prévue par le protocole | Hors protocole |
| --- | --- |
| Publier ou réviser un contrat entre deux tentatives | Compléter ou corriger le contrat pendant une tentative |
| Réserver pour son propre agent, lancer la session | Guider l'agent au-delà du contrat par des consignes non écrites |
| Assigner un vérificateur (lots 0 à 2) | Vérifier soi-même à la place d'un vérificateur absent |
| Répondre à une demande d'arbitrage | Trancher en silence une question que l'agent aurait dû poser |
| Approuver, fusionner, passer la mission à `integrated` | Corriger le livrable soi-même avant ou après la fusion |
| Répondre au retour à 30 jours | Débloquer un outil, un accès ou un environnement du contributeur |

Chaque intervention est enregistrée avec le rôle de la personne (fondateur, mainteneur, contributeur, vérificateur), son compte public sur la forge, la date, la nature (cadrage, assistance, revue, correction, intégration, déblocage) et sa classe (prévue ou hors protocole). La durée est facultative et ne vient que de la personne elle-même. Quand une intervention passe par l'agent de cette personne, ses tokens figurent déjà dans un rapport de consommation `integration` : le journal y renvoie, sans les recompter.

## 7. Indicateurs et mesure de la valeur

### Trois résultats successifs

[valeur-nette.md](../specs/valeur-nette.md) distingue trois résultats, que le rapport compte séparément :

| Résultat | Se compte quand | Source |
| --- | --- | --- |
| Accepté | Le verdict de vérification est `pass` et le porteur approuve | Rapport de vérification, approbation sur la forge |
| Intégré | Le livrable est fusionné ou publié ; la date d'intégration est l'horodatage UTC de la fusion de la PR du livrable, pas celle de la PR qui passe le contrat à `integrated` | Forge |
| Utile dans la durée | Retour à 30 jours « oui » à la question 1, sans correction importante à la question 3 ni défaut important rattaché | Questionnaire, journal |

### Gain humain net estimé

La formule est celle de [valeur-nette.md](../specs/valeur-nette.md) :

```latex
G = T_{\text{sans}} - \left(T_{\text{cadrage}} + T_{\text{assistance}} + T_{\text{revue}} + T_{\text{correction}} + T_{\text{intégration}}\right)
```

| Terme | Origine dans la campagne | Nature |
| --- | --- | --- |
| `T_sans` | Estimé par le porteur dans le retour à 30 jours, champ facultatif | Estimé |
| `T_cadrage`, `T_assistance`, `T_correction` | Durées déclarées des interventions du § 6 | Déclaré |
| `T_revue`, `T_intégration` | Durée des sessions de vérification et d'intégration, lue dans la `period` des rapports de consommation `verification` et `integration`, ou durée déclarée qui la remplace | Mesuré (durée de session) ou déclaré |

La spécification veut que les temps de revue et d'intégration soient « déduits des horodatages », sans saisie. Le délai entre l'ouverture d'une PR et sa fusion ne convient pas : il compte surtout de l'attente (les PR #1 à #7, ouvertes le 17/10/2026 au soir, ont été fusionnées le lendemain matin). Le protocole retient la durée des sessions, bornée par les horodatages des rapports de consommation : c'est une borne haute du temps d'attention, puisqu'une session compte aussi ses pauses. Le délai de la forge reste un indicateur de fluidité de la démonstration 1, pas un terme de `G`.

`G` n'est calculé que si `T_sans` est donné et que chaque terme est connu ou nul de façon établie ; il n'est jamais complété par une valeur supposée. Quand une session d'intégration couvre plusieurs missions, `G` se calcule sur le groupe, pas mission par mission. Pour la recherche et la création, la réponse à la question 1 et le commentaire du retour à 30 jours remplacent `G` ([valeur-nette.md](../specs/valeur-nette.md)).

### Indicateurs par démonstration

| Indicateur | Définition | Démonstration | Nature |
| --- | --- | --- | --- |
| Missions par issue | Nombre de missions intégrées, acceptées non intégrées, abandonnées, annulées, en cours | 1 | Fait |
| Part de missions conformes | Missions conformes / missions intégrées | 1 | Fait |
| Interventions hors protocole | Nombre par mission, et part des missions qui en ont eu au moins une, par rôle de l'intervenant | 1 | Déclaré |
| Missions sans fondateur | Missions conformes dont ni le producteur, ni le vérificateur, ni le rédacteur des correctifs n'est un fondateur | 1 | Fait |
| Reprises | Missions qui ont eu plus d'une tentative ; tentatives par mission | 1 | Fait |
| Modifications après revue | Missions avec au moins un commit après une revue ou un retour du porteur ; nombre de cycles | 1 | Mesuré |
| Délais | Médianes : réservation → soumission, soumission → première revue, première revue → fusion | 1 | Mesuré |
| Retours à 30 jours | Répartition des réponses à chaque question, taux de réponse, par projet et par type | 2 | Déclaré |
| Gain humain net | `G` par mission ou par groupe, quand il est calculable ; nombre de missions où il ne l'est pas | 2 | Estimé |
| Défauts après intégration | Nombre et gravité, par mission | 2 | Déclaré |
| Travaux de suite | Nombre et tokens comptés des PR de suite, par mission servie | 2 | Déclaré |
| Coût d'intégration | Tokens comptés `integration` / tokens comptés `production` | 2 | Déclaré |
| Avis de fin de campagne | Réponse du mainteneur externe (§ 8) | 2 | Déclaré |
| Nature des mesures | Part des tokens comptés par `method` et par `nature` | 3 | Fait |
| Protections déclaratives | Contributions exécutées hors environnement isolé, ou sans arrêt au plafond démontré | 3 | Déclaré |
| Clients | Clients utilisés et leur statut au registre de compatibilité (TH-008, TH-208) | 3 | Fait |
| Questions | Demandes d'arbitrage par conduite, part bloquante, délai de décision | 1 et 3 | Fait |
| Écart estimation / consommation | Position et rapport à la borne haute, par type et par taille | Hors démonstration, alimente `governance.estimation` | Déclaré |

Les tokens comptés suivent la règle du dépôt : input + cache_creation + output ; les lectures de cache sont déclarées, non comptées (`schemas/usage-report.schema.json`).

## 8. Retour à 30 jours et avis de fin de campagne

Le retour à 30 jours suit [le questionnaire](retour-a-30-jours.md) : trois questions fermées, posées 30 jours après l'intégration de chaque mission au mainteneur qui l'a intégrée, recueillies en moins d'une minute.

La preuve attendue du pilote va au-delà : le mainteneur doit juger que l'aide reçue vaut le travail d'encadrement, **et souhaiter renouveler l'expérience** ([valeur-nette.md](../specs/valeur-nette.md)). Les trois questions couvrent la première moitié (question 2), pas la seconde. Le protocole ajoute donc un avis unique de fin de campagne, demandé une fois au mainteneur externe, et au porteur pour le projet Tokenhood :

> Souhaitez-vous poursuivre avec Tokenhood sur votre projet ? (oui, sous conditions, non) Si « sous conditions », lesquelles ?

Ce n'est pas une quatrième question : le retour à 30 jours reste à trois questions par mission.

## 9. Données personnelles et publicité du journal

Le journal est public, dans le dépôt. Il ne contient donc que :

- des données déjà publiques sur la forge : compte public, horodatages et contenu des PR, revues et commits ;
- des données qu'une personne déclare elle-même pour publication : une durée, un commentaire de retour à 30 jours.

Une personne est désignée par son compte public et son rôle, jamais par son nom civil ni ses coordonnées. Une durée ou un commentaire n'est publié qu'avec l'accord de la personne ; à défaut, il n'est pas enregistré. Le rapport agrège les durées par rôle, pas par personne. Les coordonnées du mainteneur externe, nécessaires aux relances, restent hors du dépôt.

Tout traitement qui irait au-delà, par exemple conserver des données non publiques ou des durées non publiées, attend une décision du porteur, responsable de la validation RGPD selon [exploitation.md](../specs/exploitation.md), dans le respect de la minimisation et des durées de conservation de [securite-et-conformite.md](../specs/securite-et-conformite.md).

## 10. Rôles

| Rôle | Ce qu'il fait pour la campagne |
| --- | --- |
| Porteur | Tient le journal en amorçage ; classe chaque mission (conforme, dérogatoire) ; répond au retour à 30 jours pour le projet Tokenhood ; publie les points d'étape |
| Contributeur et son agent | Joint le rapport de consommation ; déclare dans le rapport de mission l'estimation au cadrage, les écarts, les blocages et ce qui n'a pas été vérifié |
| Vérificateur et son agent | Joint son rapport de vérification et son rapport de consommation `verification` |
| Mainteneur externe | Répond au retour à 30 jours et à l'avis de fin de campagne ; peut déclarer ses durées |
| Agent de TH-306 | Rédige le rapport de campagne sur le [gabarit](gabarit-rapport-de-campagne.md), à partir du journal et des sources qu'il cite |
| Gouvernance | Décide de la suite sur le rapport ; peut modifier ce protocole |

**Écriture du journal en amorçage.** Une PR de mission ne touche qu'à son périmètre ; elle n'écrit pas dans le journal. Les entrées d'une mission sont ajoutées par la PR du porteur qui la passe à `integrated` ou `cancelled`, celle qui existe déjà dans le cycle d'amorçage ; les événements en cours de route (blocage, reprise, question) peuvent attendre cette PR. Au lot 3, TH-304 reprend le retour à 30 jours et les indicateurs dans la plateforme ; le journal ne garde alors que ce qu'elle n'enregistre pas.

## 11. Limites connues de la mesure

Le rapport les rappelle, avec leur effet sur chaque indicateur.

- **Dimensionnement exploratoire** : 15 à 20 missions ne donnent aucune représentativité statistique ([campagne-pilote.md](../specs/campagne-pilote.md)). Les répartitions se donnent en effectifs, pas en pourcentages seuls.
- **Une seule personne au départ** : au 20/10/2026, toutes les missions intégrées ont été produites, intégrées et fusionnées par le même compte, sans vérification croisée ([journal, état initial](journal-de-campagne.md)). Le retour à 30 jours du porteur sur ses propres missions est une auto-évaluation.
- **Un seul client, une seule famille de modèles** : les 20 rapports de consommation du lot 0 viennent de Claude Code 2.1.299 avec `claude-opus-5-5` (le rapport de TH-004 inclut aussi des contrôles de lecture par `claude-haiku-5-5`) ; la comparaison entre clients attend un second contributeur.
- **Mesures déclarées** : toute la consommation est `client_transcript`, `declared` ; aucune n'est rapprochée d'une console de fournisseur.
- **Le cache pèse sur les tokens comptés** : `cache_creation` augmente quand une session reprend après une pause qui a fait expirer le cache. Le rapport `2026-10-18-TH-015-statuts-requis` l'indique : le contexte de la session a été réécrit deux fois en cache après des pauses de plus d'une heure. Les tokens comptés mesurent donc aussi le rythme de travail du contributeur, pas seulement la taille de la mission.
- **Rapports rétroactifs** : neuf rapports du lot 0 ont été produits après coup (TH-019) ; huit d'entre eux découpent une session commune en fenêtres bornées par les commits de chaque mission.
- **Protections déclaratives** : les contributions du lot 0 ont été exécutées sur le poste du porteur, non isolé (Docker indisponible), ce que leurs PR déclarent ; la politique `isolated_environment_required_when: runs_project_commands` n'y a pas été appliquée par un environnement.
- **Scénario sans Tokenhood non observable** : `T_sans` reste une estimation du porteur ([valeur-nette.md](../specs/valeur-nette.md)).
