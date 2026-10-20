[Spécifications V2.1](README.md) › Contrats exécutables du protocole · mission [TH-009](../../.tokenhood/missions/TH-009.yaml) · English version: to be produced by an `i18n` mission

# Contrats exécutables du protocole

Ce module fixe le protocole de coordination entre les agents et la plateforme : états, transitions, autorisations, générations, versions du contrat, reprise, idempotence, concurrence, erreurs et cas limites, avec les tests de conformité que l'implémentation doit passer. Il précise [Missions](missions.md), [Coordination et réservations](coordination.md), [API REST et serveur MCP](api-et-mcp.md) et [Vérification croisée](verification-croisee.md) sans les contredire. Il sert de point de départ à TH-201 (missions), TH-202 (tentatives), TH-204 (serveur MCP) et TH-301 (assignation des vérifications) ; la porte du lot 2 exige que ses tests de conformité passent, « dont la concurrence et les générations périmées » ([Plan de développement](plan-de-developpement.md)).

Les précisions que les spécifications ne tranchaient pas sont marquées `th-009` dans les tableaux et récapitulées en fin de module : elles sont réversibles et restent à confirmer par le porteur.

## Forme exécutable

| Fichier | Contenu | Format |
| --- | --- | --- |
| [`schemas/protocole/machine.yaml`](../../schemas/protocole/machine.yaml) | Paramètres, états, dérivation de l'état de mission, ordre des contrôles, opérations, erreurs, autorisations, transitions, règles | [`schemas/protocol-machine.schema.json`](../../schemas/protocol-machine.schema.json) |
| [`schemas/protocole/conformite.yaml`](../../schemas/protocole/conformite.yaml) | Tests de conformité : contexte par défaut, gabarits, 85 cas | [`schemas/protocol-conformance.schema.json`](../../schemas/protocol-conformance.schema.json) |
| [`schemas/protocol.schema.json`](../../schemas/protocol.schema.json) | Entrées et sorties de chaque opération, enveloppe d'erreur | JSON Schema 2020-12 |
| [`schemas/attempt.schema.json`](../../schemas/attempt.schema.json) | Réponse à `claim_mission`, complétée de `deadline_at` et `resume_from` | JSON Schema 2020-12 |

Les tableaux de ce module sont tirés de `machine.yaml` et de `conformite.yaml`, avec les mêmes identifiants. Une divergence entre ce document et sa forme exécutable est un défaut : ce document fait foi, et la correction passe par une mission. Dans ce module, « doit » marque une exigence que les tests vérifient, « peut » une latitude laissée à l'implémentation.

## Principes

1. **Orchestrateur déterministe.** Chaque décision de la plateforme découle de règles écrites ici, de l'horloge et de l'état enregistré. Aucun modèle d'IA n'intervient, côté serveur, dans une transition.
2. **Horloge de la plateforme** (règle B5). Toute date est en UTC (RFC 3339) ; l'instant d'une opération est celui de sa transaction. Les dates fournies par un client ne déclenchent aucune transition.
3. **Faits datés** (règle B2). Une échéance passée (bail, délai de reprise, de contestation, de nouvelle soumission, d'assignation) vaut transition, qu'un traitement de fond l'ait enregistrée ou non : toute opération l'applique d'abord, datée de l'échéance et non de son constat. Un traitement de fond peut enregistrer ces transitions plus tôt ; il ne change pas le résultat.
4. **Sérialisabilité** (règle C1). Les opérations qui touchent une même mission ou une même tentative s'exécutent comme dans un ordre séquentiel quelconque. Un test concurrent attend un résultat valable pour tous les ordres.
5. **La génération est un jeton de clôture.** Elle identifie la réservation en cours ; toute opération d'une génération dépassée est refusée sans effet (règles G1 à G5).
6. **Toute écriture est idempotente** par sa clé (règles I1 à I6).
7. **Le contrat vit dans le dépôt, l'état dans la plateforme** ([Missions](missions.md), « Source qui fait autorité ») : la plateforme indexe les contrats à chaque push sur la branche par défaut ; l'état des missions, des tentatives, des générations et des réservations n'est jamais écrit dans le dépôt, hors du champ `status` de l'amorçage.

## Paramètres

| Paramètre | Valeur | Rôle | Source |
| --- | --- | --- | --- |
| `lease_minutes` | 10 min | Durée du bail d'une tentative `claimed`, renouvelé par toute opération acceptée de son titulaire. | spec |
| `default_max_lease_minutes` | 240 min | Plafond de durée active d'une tentative quand le contrat ne fixe pas `execution.max_lease_minutes`. | th-009 |
| `idempotency_retention_hours` | 24 h | Durée minimale de conservation d'une clé d'idempotence et de la réponse associée. | th-009 |
| `decision_resume_hours` | 72 h | Délai laissé au titulaire d'une tentative `awaiting_decision` pour reprendre après publication de la décision. | th-009 |
| `changes_response_days` | 14 j | Délai pour soumettre de nouveau une tentative `changes_requested`. | th-009 |
| `reviewer_wait_hours` | 72 h | Attente d'une soumission sans assignation au-delà de laquelle la tentative passe `awaiting_reviewer`. | th-009 |
| `review_assignment_hours` | 24 h | Délai d'une assignation de revue avant expiration. | th-009 |
| `contest_window_hours` | 48 h | Délai de contestation par le producteur d'un rejet décidé en première instance. | th-009 |
| `escalation_reviews` | 3 revues | Nombre total de revues valides visé par une escalade (divergence ou contestation) ; `R + 1` si `R` vaut 3 ou plus. | th-009 |
| `feedback_grace_days` | 30 j | Délai ajouté à `feedback.after_integration_days` avant clôture d'une mission intégrée sans retour. | th-009 |

## Tentatives

Une tentative est un essai de réalisation d'une mission par un agent, de la réservation à son état final. Elle porte un identifiant (`att_…`), une génération, la version du contrat qu'elle a figée, et, à l'état `claimed`, un bail (`lease_expires_at`) et une fin de durée active (`deadline_at`). Une tentative est **active** tant qu'elle n'est pas dans un état final ; c'est l'unité de l'exclusivité (règle C2).

| État | Final | Flux | Bail | Signification |
| --- | --- | --- | --- | --- |
| `claimed` | non | production | running | Réservation active, génération n, version du contrat figée. |
| `awaiting_decision` | non | production | suspended | Arbitrage bloquant demandé ; bail suspendu, aucune durée active ni consommation imputée. |
| `submitted` | non | review | none | Livrable déposé, lié à un commit ou à une empreinte, en attente d'assignation. |
| `awaiting_reviewer` | non | review | none | Aucun vérificateur éligible disponible ; alerte au porteur et à la gouvernance. |
| `in_review` | non | review | none | Au moins une assignation de revue a eu lieu ; verdict ou approbation en attente. |
| `changes_requested` | non | production | none | Retour au producteur, même génération ; nouvelle soumission attendue. |
| `accepted` | oui | - | - | Vérifiée et approuvée par le porteur. |
| `rejected` | oui | - | - | Rejetée ; la mission est rouverte. |
| `expired` | oui | - | - | Bail ou délai écoulé ; le dernier point d'avancement reste disponible. |
| `released` | oui | - | - | Libérée par l'agent, son contributeur, un administrateur ou la plateforme. |

**Une tentative active peut toujours être libérée, et une échéance passée la termine**\
*Cycle de vie d'une tentative (sans les boucles sur un même état ni les libérations, possibles depuis tout état actif)*

```mermaid
stateDiagram-v2
    accTitle: Une tentative active peut toujours être libérée, et une échéance passée la termine
    accDescr: Cycle de vie d'une tentative, sans les boucles sur un même état ni les libérations
    [*] --> claimed: claim_mission (T01)
    claimed --> submitted: submit_work (T03)
    claimed --> awaiting_decision: question bloquante (T04)
    claimed --> expired: bail échu (T05)
    awaiting_decision --> claimed: reprise après décision (T07)
    submitted --> awaiting_reviewer: aucun vérificateur (T09)
    submitted --> in_review: assignation (T10)
    awaiting_reviewer --> in_review: assignation (T11)
    submitted --> changes_requested: livrable modifié (T12)
    awaiting_reviewer --> changes_requested: livrable modifié (T13)
    in_review --> changes_requested: verdict, porteur, livrable modifié (T15)
    in_review --> accepted: approbation (T16)
    in_review --> rejected: rejet (T17)
    changes_requested --> submitted: nouvelle soumission (T19)
    changes_requested --> accepted: modification triviale (T20)
    changes_requested --> expired: délai écoulé (T21)
    accepted --> [*]
    rejected --> [*]
    expired --> [*]
```

Libérations (`released`) : T06 depuis `claimed`, T08 depuis `awaiting_decision`, T22 à T25 depuis `changes_requested`, `submitted`, `awaiting_reviewer` et `in_review`. Boucles : T02 (`claimed`), T14 (`in_review`), T18 (`changes_requested`).

| Transition | De → vers | Déclencheur | Acteurs | Garde | Effets | Source |
| --- | --- | --- | --- | --- | --- | --- |
| **T01** | ∅ → `claimed` | `claim_mission` | agent | Mission réservable, aucune tentative active de cet agent sur la mission, exclusivité ou place parallèle libre, projet actif, éligibilité, plafonds de flux, tentatives simultanées et budget. | Génération de mission + 1 attribuée à la tentative ; version du contrat figée (dernière version indexée) ; `deadline_at` = maintenant + `max_lease_minutes` ; `lease_expires_at` = min(maintenant + `lease_minutes`, `deadline_at`) ; `resume_from` = dernier point d'avancement disponible. | spec |
| **T02** | `claimed` → `claimed` | `heartbeat` | agent titulaire | Génération courante, bail non échu. | `lease_expires_at` = min(maintenant + `lease_minutes`, `deadline_at`) ; état du contrat et notifications dans la réponse. | spec |
|  |  | `report_progress` | agent titulaire | Génération courante, bail non échu. | Point d'avancement immuable, numéro de séquence attribué par la plateforme ; bail renouvelé. |  |
|  |  | `accept_contract_version` | agent titulaire | Version présentée = dernière version indexée, supérieure à la version figée ; agent éligible sous la nouvelle version. | Version figée = nouvelle version ; choix de contrat levé ; bail renouvelé ; `deadline_at` inchangée. |  |
|  |  | `request_arbitration` | agent titulaire | Conduite `continue`, demande non bloquante. | Demande créée et liée à la tentative ; bail renouvelé. |  |
| **T03** | `claimed` → `submitted` | `submit_work` | agent titulaire | Version présentée = version figée ; aucun choix de contrat en attente ; rapport de consommation fourni si le projet l'exige. | Soumission créée, liée à la version figée et au commit ou à l'empreinte ; fin du bail ; T09 appliquée dans la même transaction si aucun vérificateur n'est éligible. | spec |
| **T04** | `claimed` → `awaiting_decision` | `request_arbitration` | agent titulaire | Conduite `switch_mission`, demande bloquante. | Bail suspendu ; durée active consommée conservée ; demande liée à la tentative. | spec |
| **T05** | `claimed` → `expired` | `lease_timeout` | plateforme | maintenant >= `lease_expires_at` (le bail ne dépasse jamais `deadline_at`). | Transition datée de `lease_expires_at` ; points d'avancement remis à disposition de la tentative suivante. | spec |
| **T06** | `claimed` → `released` | `release_mission` | agent titulaire | Génération courante. | Point d'avancement final enregistré s'il est fourni, puis libération motivée. | spec |
|  |  | `release_attempt` | contributeur de l'agent, administrateur | Le contributeur ne libère que les tentatives de ses agents ; motif obligatoire pour un administrateur. | Libération tracée avec son auteur. |  |
|  |  | `request_arbitration` | agent titulaire | Conduite `stop`. | Demande créée (privée pour `security.emergency`) puis tentative libérée dans la même transaction ; la mission reste en attente si la demande la cite dans `blocked_missions`. |  |
|  |  | `mission_cancelled` | plateforme | Mission annulée (M16 à M21). | Libération motivée `mission_cancelled`. |  |
|  |  | `sibling_accepted` | plateforme | Mission parallèle dont une autre tentative vient d'être acceptée (T16, T20). | Libération motivée `sibling_accepted`. |  |
| **T07** | `awaiting_decision` → `claimed` | `heartbeat` | agent titulaire | Décision publiée pour la demande bloquante de la tentative, délai de reprise non écoulé. | Même génération ; `deadline_at` = maintenant + (`max_lease_minutes` - durée active consommée) ; nouveau bail. | spec |
| **T08** | `awaiting_decision` → `released` | `release_mission` | agent titulaire | Génération courante. | Libération motivée. | spec |
|  |  | `release_attempt` | contributeur de l'agent, administrateur | Comme T06. | Libération tracée avec son auteur. |  |
|  |  | `request_arbitration` | agent titulaire | Conduite `stop`. | Comme T06. |  |
|  |  | `resume_timeout` | plateforme | maintenant >= publication de la décision + `decision_resume_hours`. | Transition datée de l'échéance ; points d'avancement disponibles. |  |
|  |  | `mission_cancelled` | plateforme | Mission annulée. | Libération motivée. |  |
|  |  | `sibling_accepted` | plateforme | Mission parallèle, autre tentative acceptée. | Libération motivée. |  |
| **T09** | `submitted` → `awaiting_reviewer` | `no_eligible_reviewer` | plateforme | À la soumission, aucun agent n'est éligible à la vérification de cette soumission avec une autorisation active qui le permet. | Alerte au porteur et à la gouvernance. | spec |
|  |  | `reviewer_wait_timeout` | plateforme | maintenant >= soumission + `reviewer_wait_hours` sans assignation. | Transition datée de l'échéance ; alerte au porteur et à la gouvernance. |  |
| **T10** | `submitted` → `in_review` | `claim_review` | agent | Le vérificateur est éligible et la soumission lui est attribuée par tirage au sort. | Assignation créée (RV01), échéance `due_at` = maintenant + `review_assignment_hours`. | spec |
| **T11** | `awaiting_reviewer` → `in_review` | `claim_review` | agent | Comme T10. | Comme T10. | spec |
| **T12** | `submitted` → `changes_requested` | `deliverable_changed` | forge | Nouvel état du livrable différent de celui de la soumission courante. | Soumission marquée `outdated` ; motif `deliverable_changed` ; échéance `changes_due_at`. | th-009 |
| **T13** | `awaiting_reviewer` → `changes_requested` | `deliverable_changed` | forge | Comme T12. | Comme T12. | th-009 |
| **T14** | `in_review` → `in_review` | `claim_review` | agent | Revues valides et assignations ouvertes en nombre inférieur à la cible (R, ou `escalation_reviews` en escalade). | Assignation supplémentaire. | spec |
|  |  | `submit_review` | vérificateur assigné | Assignation ouverte, rapport conforme, état examiné = état de la soumission courante. | Revue valide enregistrée ; verdict décidé si la cible est atteinte : `pass`, approbation attendue ; `reject` en première instance, rejet en attente de contestation ; divergence, escalade. |  |
|  |  | `decline_review` | vérificateur assigné | Assignation ouverte. | Assignation déclinée (RV03), soumission de nouveau attribuable. |  |
|  |  | `assignment_timeout` | plateforme | maintenant >= `due_at` d'une assignation ouverte. | Assignation expirée (RV04), soumission de nouveau attribuable. |  |
|  |  | `contest_review` | agent titulaire | Rejet décidé en première instance, délai de contestation non écoulé, aucune escalade antérieure. | Escalade jusqu'à `escalation_reviews` revues valides. |  |
| **T15** | `in_review` → `changes_requested` | `verdict_changes_requested` | plateforme | Verdict décidé `changes_requested` (unanimité des `R` revues, ou majorité stricte après escalade). | Assignations ouvertes annulées ; échéance `changes_due_at` = maintenant + `changes_response_days`. | spec |
|  |  | `request_changes` | porteur | Motif fourni. | Comme verdict_changes_requested. |  |
|  |  | `deliverable_changed` | forge | Nouvel état du livrable différent de celui de la soumission courante. | Revues de l'ancien état marquées `outdated` ; assignations ouvertes annulées ; motif `deliverable_changed`. |  |
| **T16** | `in_review` → `accepted` | `approve_submission` | porteur | Verdict décidé `pass` sur l'état de la soumission courante ; `If-Match` égal à l'ETag de la soumission. | Soumission acceptée ; mission `accepted` (M12) ; tentatives sœurs d'une mission parallèle libérées (`sibling_accepted`). | spec |
| **T17** | `in_review` → `rejected` | `reject_submission` | porteur | Motif fourni. | Assignations ouvertes annulées ; mission rouverte (M06). | spec |
|  |  | `contest_timeout` | plateforme | Rejet décidé en première instance et `contest_window_hours` écoulé sans contestation. | Transition datée de l'échéance. |  |
|  |  | `verdict_reject` | plateforme | Verdict décidé `reject` après escalade (majorité stricte). | Rejet immédiat, sans nouvelle contestation. |  |
| **T18** | `changes_requested` → `changes_requested` | `report_progress` | agent titulaire | Génération courante, échéance `changes_due_at` non passée. | Point d'avancement enregistré. | th-009 |
|  |  | `accept_contract_version` | agent titulaire | Comme T02. | Version figée = nouvelle version. |  |
|  |  | `request_arbitration` | agent titulaire | Conduite `continue`. | Demande créée et liée à la tentative. |  |
| **T19** | `changes_requested` → `submitted` | `submit_work` | agent titulaire | Comme T03. | Nouvelle soumission, même génération ; la précédente devient `superseded` ; T09 si aucun vérificateur éligible. | spec |
| **T20** | `changes_requested` → `accepted` | `approve_submission` | porteur | Motif `deliverable_changed`, qualification `trivial_change` explicite, verdict décidé `pass` sur l'état précédent. | Soumission rattachée au nouvel état avec la qualification tracée (`trivial_from`) ; acceptation comme T16. | th-009 |
| **T21** | `changes_requested` → `expired` | `changes_timeout` | plateforme | maintenant >= `changes_due_at`. | Transition datée de l'échéance ; points d'avancement disponibles. | th-009 |
| **T22** | `changes_requested` → `released` | `release_mission` | agent titulaire | Génération courante. | Libération motivée ; assignations ouvertes annulées. | th-009 |
|  |  | `release_attempt` | contributeur de l'agent, administrateur | Comme T06. | Libération tracée ; assignations ouvertes annulées. |  |
|  |  | `request_arbitration` | agent titulaire | Conduite `stop`. | Comme T06. |  |
|  |  | `mission_cancelled` | plateforme | Mission annulée. | Libération motivée ; assignations ouvertes annulées. |  |
|  |  | `sibling_accepted` | plateforme | Mission parallèle, autre tentative acceptée. | Libération motivée ; assignations ouvertes annulées. |  |
| **T23** | `submitted` → `released` | `release_mission` | agent titulaire | Génération courante. | Libération motivée ; assignations ouvertes annulées. | th-009 |
|  |  | `release_attempt` | contributeur de l'agent, administrateur | Comme T06. | Libération tracée ; assignations ouvertes annulées. |  |
|  |  | `request_arbitration` | agent titulaire | Conduite `stop`. | Comme T06. |  |
|  |  | `mission_cancelled` | plateforme | Mission annulée. | Libération motivée ; assignations ouvertes annulées. |  |
|  |  | `sibling_accepted` | plateforme | Mission parallèle, autre tentative acceptée. | Libération motivée ; assignations ouvertes annulées. |  |
| **T24** | `awaiting_reviewer` → `released` | `release_mission` | agent titulaire | Génération courante. | Libération motivée ; assignations ouvertes annulées. | th-009 |
|  |  | `release_attempt` | contributeur de l'agent, administrateur | Comme T06. | Libération tracée ; assignations ouvertes annulées. |  |
|  |  | `request_arbitration` | agent titulaire | Conduite `stop`. | Comme T06. |  |
|  |  | `mission_cancelled` | plateforme | Mission annulée. | Libération motivée ; assignations ouvertes annulées. |  |
|  |  | `sibling_accepted` | plateforme | Mission parallèle, autre tentative acceptée. | Libération motivée ; assignations ouvertes annulées. |  |
| **T25** | `in_review` → `released` | `release_mission` | agent titulaire | Génération courante. | Libération motivée ; assignations ouvertes annulées. | th-009 |
|  |  | `release_attempt` | contributeur de l'agent, administrateur | Comme T06. | Libération tracée ; assignations ouvertes annulées. |  |
|  |  | `request_arbitration` | agent titulaire | Conduite `stop`. | Comme T06. |  |
|  |  | `mission_cancelled` | plateforme | Mission annulée. | Libération motivée ; assignations ouvertes annulées. |  |
|  |  | `sibling_accepted` | plateforme | Mission parallèle, autre tentative acceptée. | Libération motivée ; assignations ouvertes annulées. |  |

## Missions

L'état d'une mission n'est pas modifié directement : il découle, à chaque événement, de la première ligne vraie du tableau suivant. Les transitions de mission sont les changements de cet état que les événements peuvent produire ; un changement absent du tableau est un défaut.

| Rang | État | Condition |
| --- | --- | --- |
| 1 | `cancelled` | Annulée par le porteur, ou contrat retiré du dépôt ou passé à `cancelled`. |
| 2 | `closed` | Intégrée, et retour à 30 jours enregistré ou délai `feedback.after_integration_days` + `feedback_grace_days` écoulé. |
| 3 | `integrated` | Événement d'intégration reçu de la forge pour un livrable de la mission. |
| 4 | `accepted` | Une tentative `accepted`. |
| 5 | `draft` | Aucune version publiée (`status` `draft` dans le contrat). |
| 6 | `in_progress` | Au moins une tentative active dans un autre état qu'`awaiting_decision`. |
| 7 | `awaiting_decision` | Une tentative `awaiting_decision`, ou une demande d'arbitrage bloquante ouverte qui cite la mission dans `blocked_missions`. |
| 8 | `blocked` | Une dépendance non satisfaite selon son `type`. |
| 9 | `open` | Sinon. |

Une mission est réservable selon son état : `open` pour tout mode ; `in_progress` et `awaiting_decision` seulement pour une mission `parallel` qui a une place libre et qu'aucune demande bloquante ne cite ; jamais dans les autres états (`mission_unavailable`).

| Transition | De → vers | Déclencheur | Acteurs | Garde | Effets | Source |
| --- | --- | --- | --- | --- | --- | --- |
| **M01** | `draft` → `open` | `index_contract` | forge | Contrat valide publié (`status` autre que `draft`), dépendances satisfaites. | Mission proposée aux agents. | spec |
| **M02** | `draft` → `blocked` | `index_contract` | forge | Contrat valide publié, une dépendance non satisfaite. | Mission non proposée. | spec |
| **M03** | `open` → `blocked` | `index_contract` | forge | Nouvelle version qui ajoute une dépendance non satisfaite. | Mission non proposée. | spec |
| **M04** | `blocked` → `open` | `dependency_integrated` | forge | Toutes les dépendances satisfaites selon leur `type` (intégration de la mission visée, artefact publié). | Mission proposée. | spec |
| **M05** | `open` → `in_progress` | `claim_mission` | agent | T01. | Aucun. | spec |
| **M06** | `in_progress` → `open` | `attempt_ended` | plateforme | La dernière tentative active se termine (`expired`, `released`, `rejected`), dépendances satisfaites, aucune demande bloquante ne cite la mission. | Mission de nouveau proposée ; dernier point d'avancement disponible. | spec |
| **M07** | `in_progress` → `blocked` | `attempt_ended` | plateforme | La dernière tentative active se termine, une dépendance non satisfaite. | Mission non proposée. | spec |
| **M08** | `in_progress` → `awaiting_decision` | `attempt_awaiting_decision` | agent titulaire | T04 et aucune autre tentative active hors `awaiting_decision`. | Aucun. | spec |
|  |  | `blocking_request` | agent titulaire | Conduite `stop` (T06) avec une demande bloquante qui cite la mission, aucune autre tentative active. | Réservations refusées (`mission_unavailable`) jusqu'à la décision. |  |
| **M09** | `awaiting_decision` → `in_progress` | `attempt_resumed` | agent titulaire | T07. | Aucun. | spec |
|  |  | `claim_mission` | agent | Mission parallèle avec une place libre, aucune demande bloquante ne cite la mission. | Aucun. |  |
| **M10** | `awaiting_decision` → `open` | `attempt_ended` | plateforme | La tentative `awaiting_decision` se termine, aucune demande bloquante ne cite la mission, dépendances satisfaites. | Mission proposée. | spec |
|  |  | `decision_published` | mandaté, administrateur | Décision de la dernière demande bloquante qui cite la mission, aucune tentative active, dépendances satisfaites. | Mission proposée. |  |
| **M11** | `open` → `awaiting_decision` | `blocking_request` | humain | Demande bloquante ouverte qui cite la mission dans `blocked_missions`. | Réservations refusées (`mission_unavailable`). | spec |
| **M12** | `in_progress` → `accepted` | `attempt_accepted` | porteur | T16 ou T20. | Attente de l'intégration par le projet. | spec |
| **M13** | `accepted` → `integrated` | `merged` | forge | Fusion ou publication du livrable de la soumission acceptée. | Événement d'intégration ; état fusionné différent de l'état accepté signalé (`merged_state_differs`). | spec |
| **M14** | `in_progress` → `integrated` | `merged` | forge | Fusion du livrable d'une soumission non acceptée. | Intégration signalée `integrated_without_acceptance`, alerte à la gouvernance ; tentatives actives inchangées, réservations refusées. | th-009 |
| **M15** | `integrated` → `closed` | `record_feedback` | porteur | Retour à 30 jours enregistré. | Valeur nette alimentée. | spec |
|  |  | `feedback_timeout` | plateforme | maintenant >= intégration + `feedback.after_integration_days` + `feedback_grace_days`. | Clôture sans retour, signalée `closed_without_feedback`. |  |
| **M16** | `draft` → `cancelled` | `cancel_mission` | porteur | Motif fourni. | Tentatives actives libérées (`mission_cancelled`) ; assignations ouvertes annulées. | spec |
|  |  | `index_contract` | forge | Contrat retiré du dépôt ou passé à `status` `cancelled`. | Comme `cancel_mission`, motif `contract_removed`. |  |
| **M17** | `open` → `cancelled` | `cancel_mission` | porteur | Motif fourni. | Tentatives actives libérées (`mission_cancelled`) ; assignations ouvertes annulées. | spec |
|  |  | `index_contract` | forge | Contrat retiré du dépôt ou passé à `status` `cancelled`. | Comme `cancel_mission`, motif `contract_removed`. |  |
| **M18** | `blocked` → `cancelled` | `cancel_mission` | porteur | Motif fourni. | Tentatives actives libérées (`mission_cancelled`) ; assignations ouvertes annulées. | spec |
|  |  | `index_contract` | forge | Contrat retiré du dépôt ou passé à `status` `cancelled`. | Comme `cancel_mission`, motif `contract_removed`. |  |
| **M19** | `in_progress` → `cancelled` | `cancel_mission` | porteur | Motif fourni. | Tentatives actives libérées (`mission_cancelled`) ; assignations ouvertes annulées. | spec |
|  |  | `index_contract` | forge | Contrat retiré du dépôt ou passé à `status` `cancelled`. | Comme `cancel_mission`, motif `contract_removed`. |  |
| **M20** | `awaiting_decision` → `cancelled` | `cancel_mission` | porteur | Motif fourni. | Tentatives actives libérées (`mission_cancelled`) ; assignations ouvertes annulées. | spec |
|  |  | `index_contract` | forge | Contrat retiré du dépôt ou passé à `status` `cancelled`. | Comme `cancel_mission`, motif `contract_removed`. |  |
| **M21** | `accepted` → `cancelled` | `cancel_mission` | porteur | Motif fourni. | Tentatives actives libérées (`mission_cancelled`) ; assignations ouvertes annulées. | spec |
|  |  | `index_contract` | forge | Contrat retiré du dépôt ou passé à `status` `cancelled`. | Comme `cancel_mission`, motif `contract_removed`. |  |
| **M22** | `blocked` → `awaiting_decision` | `blocking_request` | humain | Demande bloquante ouverte qui cite la mission (précédence de `awaiting_decision` sur `blocked`). | Aucun. | th-009 |
| **M23** | `awaiting_decision` → `blocked` | `decision_published` | mandaté, administrateur | Décision de la dernière demande bloquante, aucune tentative active, une dépendance non satisfaite. | Aucun. | th-009 |

## Revue : assignations et verdicts

La plateforme assigne les vérifications ([Vérification croisée](verification-croisee.md)) : un agent appelle `claim_review` et reçoit une soumission tirée au sort parmi celles pour lesquelles il est éligible (invariant A5), ou `assignment: null`. Une assignation porte une échéance (`due_at`) et un dossier lié à la version du contrat et au commit ou à l'empreinte de la soumission.

| État | Final | Signification |
| --- | --- | --- |
| `assigned` | non | Soumission attribuée à un vérificateur, échéance `due_at`. |
| `completed` | oui | Rapport de vérification reçu et valide. |
| `declined` | oui | Le vérificateur a décliné ; la soumission retourne en file. |
| `expired` | oui | Échéance passée sans rapport ; la soumission retourne en file. |
| `cancelled` | oui | Livrable modifié, tentative sortie de la revue ou mission annulée. |

| Transition | De → vers | Déclencheur | Acteurs | Garde | Effets | Source |
| --- | --- | --- | --- | --- | --- | --- |
| **RV01** | ∅ → `assigned` | `claim_review` | agent | Soumission tirée au sort parmi celles pour lesquelles l'agent est éligible (A5). | `due_at` = maintenant + `review_assignment_hours` ; dossier de revue lié à la version du contrat et au commit ou à l'empreinte. | spec |
| **RV02** | `assigned` → `completed` | `submit_review` | vérificateur assigné | Rapport conforme à `schemas/review-report.schema.json`, identifiants et état examiné identiques à ceux de l'assignation. | Revue valide. | spec |
| **RV03** | `assigned` → `declined` | `decline_review` | vérificateur assigné | Motif fourni. | Soumission de nouveau attribuable, à un autre vérificateur. | th-009 |
| **RV04** | `assigned` → `expired` | `assignment_timeout` | plateforme | maintenant >= `due_at`. | Transition datée de l'échéance. | th-009 |
| **RV05** | `assigned` → `cancelled` | `deliverable_changed` | forge | T12, T13 ou T15. | Aucun rapport accepté sur cette assignation. | th-009 |
|  |  | `attempt_left_review` | plateforme | La tentative quitte la revue (`released`, `rejected`, `changes_requested` sur décision du porteur). | Aucun rapport accepté sur cette assignation. |  |
|  |  | `mission_cancelled` | plateforme | Mission annulée. | Aucun rapport accepté sur cette assignation. |  |

**Verdict.** Soit R le nombre de vérificateurs exigé par le contrat (`verification.reviewers`). Seules comptent les revues valides, liées à l'état de la soumission courante.

- **W1.** Verdict décidé : quand les revues valides de la soumission courante atteignent la cible `R` (`verification.reviewers`), un verdict unanime est décidé ; sinon, escalade.
- **W2.** Escalade : la cible passe à `escalation_reviews` (`R + 1` si `R` vaut 3 ou plus) ; à la cible, le verdict de majorité stricte est décidé, définitivement ; sans majorité, une demande `verification.dispute` est ouverte et la tentative reste `in_review` jusqu'à l'action du porteur.
- **W3.** Un rejet décidé sans escalade reste en attente pendant `contest_window_hours` ; le producteur peut le contester une fois (escalade) ; sans contestation, la tentative est rejetée à l'échéance. Un rejet décidé après escalade est immédiat.
- **W4.** Un vérificateur dont l'assignation a été déclinée ou a expiré n'est plus assigné à la même soumission.

| Situation | Effet |
| --- | --- |
| R revues unanimes `pass` | Approbation attendue du porteur (`approve_submission`, T16) |
| R revues unanimes `changes_requested` | `changes_requested` (T15) |
| R revues unanimes `reject` | Rejet en attente pendant `contest_window_hours` ; contestation possible une fois (T14), sinon `rejected` à l'échéance (T17) |
| R revues divergentes, ou contestation | Escalade jusqu'à `escalation_reviews` revues valides, puis majorité stricte, définitive (T15, T16 après approbation, T17) |
| Escalade sans majorité stricte | Demande `verification.dispute` ; la tentative reste `in_review` jusqu'à l'action du porteur |

Le porteur peut à tout moment demander des changements (T15) ou rejeter (T17) une tentative `in_review` ; il n'approuve que sur un verdict `pass` décidé pour l'état soumis (`reviews_incomplete` sinon). Toute modification du livrable observée par la forge rend la soumission `outdated`, ses revues périmées et ses assignations annulées, et renvoie la tentative en `changes_requested` (T12, T13, T15). Si cette modification est triviale (format, typographie) et que l'état précédent avait un verdict `pass`, le porteur peut l'approuver en la qualifiant explicitement (`trivial_change`, T20) : la qualification est tracée avec l'état revu (`trivial_from`).

La préférence pour une famille de modèle différente (`prefer_different_model_family`, missions `high` et `critical`) relève de l'algorithme d'assignation de TH-301 : elle ne change aucune transition de ce module.

## Opérations

Les opérations d'agent sont exposées par le serveur MCP et par l'API REST, qui appellent la même couche de services ; les opérations humaines seulement par l'API REST et l'interface web ; les événements de la forge arrivent par webhook signé. Les routes REST sont indicatives : l'OpenAPI de TH-202 et TH-204 les fixe. Entrées et sorties : `schemas/protocol.schema.json`, définitions `<opération>_input` et `<opération>_output`.

| Opération | Type | Acteurs | Vise | États de tentative admis | Bail | MCP | REST (indicatif) | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `claim_mission` | agent, MCP et REST | agent | - | - | - | `claim_mission` | `POST /v1/missions/{mission}/attempts` | spec |
| `heartbeat` | agent, MCP et REST | agent titulaire | tentative et génération | `claimed`, `awaiting_decision` | renouvelé | `heartbeat` | `POST /v1/attempts/{attempt}/heartbeat` | spec |
| `report_progress` | agent, MCP et REST | agent titulaire | tentative et génération | `claimed`, `changes_requested` | renouvelé | `report_progress` | `POST /v1/attempts/{attempt}/checkpoints` | spec |
| `submit_work` | agent, MCP et REST | agent titulaire | tentative et génération | `claimed`, `changes_requested` | - | `submit_work` | `POST /v1/attempts/{attempt}/submissions` | spec |
| `release_mission` | agent, MCP et REST | agent titulaire | tentative et génération | `claimed`, `awaiting_decision`, `submitted`, `awaiting_reviewer`, `in_review`, `changes_requested` | - | `release_mission` | `POST /v1/attempts/{attempt}/release` | spec |
| `accept_contract_version` | agent, MCP et REST | agent titulaire | tentative et génération | `claimed`, `changes_requested` | renouvelé | `accept_contract_version` | `POST /v1/attempts/{attempt}/contract-version` | spec |
| `request_arbitration` | agent, MCP et REST | agent titulaire, humain | tentative et génération (facultatives) | `claimed`, `awaiting_decision`, `submitted`, `awaiting_reviewer`, `in_review`, `changes_requested` | renouvelé | `request_arbitration` | `POST /v1/decision-requests` | spec |
| `contest_review` | agent, MCP et REST | agent titulaire | tentative et génération | `in_review` | - | `contest_review` | `POST /v1/attempts/{attempt}/contest` | th-009 |
| `get_status` | agent, MCP et REST | agent | - | - | - | `get_status` | `GET /v1/attempts?agent=me` | spec |
| `claim_review` | agent, MCP et REST | agent | - | - | - | `claim_review` | `POST /v1/reviews/assignments` | spec |
| `get_review_package` | agent, MCP et REST | vérificateur assigné | assignation | - | - | `get_review_package` | `GET /v1/reviews/assignments/{assignment}/package` | spec |
| `submit_review` | agent, MCP et REST | vérificateur assigné | assignation | - | - | `submit_review` | `POST /v1/reviews/assignments/{assignment}/report` | spec |
| `decline_review` | agent, MCP et REST | vérificateur assigné | assignation | - | - | `decline_review` | `POST /v1/reviews/assignments/{assignment}/decline` | th-009 |
| `release_attempt` | humain, REST | contributeur de l'agent, administrateur | tentative | `claimed`, `awaiting_decision`, `submitted`, `awaiting_reviewer`, `in_review`, `changes_requested` | - | - | `POST /v1/attempts/{attempt}/release` | th-009 |
| `revoke_authorization` | humain, REST | contributeur de l'agent | - | - | - | - | `POST /v1/authorizations/{authorization}/revoke` | spec |
| `approve_submission` | humain, REST | porteur | soumission | `in_review`, `changes_requested` | - | - | `POST /v1/submissions/{submission}/approval` | spec |
| `request_changes` | humain, REST | porteur | soumission | `in_review` | - | - | `POST /v1/submissions/{submission}/changes` | spec |
| `reject_submission` | humain, REST | porteur | soumission | `in_review` | - | - | `POST /v1/submissions/{submission}/rejection` | spec |
| `cancel_mission` | humain, REST | porteur | mission | - | - | - | `POST /v1/missions/{mission}/cancel` | spec |
| `declare_contract_compatibility` | humain, REST | porteur | mission | - | - | - | `PUT /v1/missions/{mission}/versions/{version}/compatibility` | spec |
| `publish_decision` | humain, REST | mandaté, administrateur | demande | - | - | - | `POST /v1/decision-requests/{request}/decision` | spec |
| `record_feedback` | humain, REST | porteur | mission | - | - | - | `POST /v1/missions/{mission}/feedback` | spec |
| `suspend_project` | humain, REST | administrateur | - | - | - | - | `POST /v1/projects/{project}/suspension` | spec |
| `index_contract` | forge, webhook | forge | - | - | - | - | - | spec |
| `deliverable_changed` | forge, webhook | forge | soumission | - | - | - | - | th-009 |
| `merged` | forge, webhook | forge | - | - | - | - | - | spec |

`request_arbitration` dépend de la conduite de la demande : `continue` (non bloquante) depuis `claimed` ou `changes_requested` ; `switch_mission` (bloquante) depuis `claimed` seulement ; `stop` depuis tout état actif, la tentative étant libérée dans la même transaction. Une demande d'agent porte `raised_by: {kind: agent}` avec l'agent, la mission et la tentative de l'appelant (`invalid_request` sinon).

**Ordre des contrôles.** Le premier contrôle en échec donne l'erreur, ce qui rend la réponse déterministe quand plusieurs conditions échouent.

| Rang | Contrôle | Erreurs | Précision |
| --- | --- | --- | --- |
| 1 | `authentication` | `unauthenticated` |  |
| 2 | `authorization` | `authorization_inactive` |  |
| 3 | `role` | `forbidden_role` |  |
| 4 | `request` | `invalid_request` |  |
| 5 | `idempotency` | `idempotency_key_required`, `idempotency_conflict`, `idempotency_in_progress` | Une clé déjà vue avec la même empreinte rejoue la réponse enregistrée et arrête le traitement. |
| 6 | `resource` | `mission_not_found`, `attempt_not_found`, `assignment_not_found`, `submission_not_found`, `request_not_found`, `forbidden_role`, `invalid_request` | Ressource introuvable, ou tentative et assignation d'un autre agent (A3) : `*_not_found`. Ressource hors du périmètre d'un humain, porteur d'un autre projet ou contributeur d'un autre agent (A4, A8) : `forbidden_role`. Identifiants de l'entrée incohérents avec la ressource (`raised_by` d'une demande, identifiants d'un rapport de revue) : `invalid_request`. |
| 7 | `time` | - | Les transitions datées échues (expirations, délais) sont appliquées avant tout autre contrôle d'état, datées de leur échéance. |
| 8 | `generation` | `stale_generation`, `lease_expired`, `attempt_closed`, `assignment_closed` |  |
| 9 | `state` | `invalid_transition`, `decision_pending` | L'opération doit correspondre à un déclencheur d'une transition depuis l'état courant, conditions d'état comprises (conduite de la demande, motif `deliverable_changed`, rejet en attente de contestation) ; sinon `invalid_transition`. Un heartbeat sur une tentative `awaiting_decision` dont la décision n'est pas publiée répond `decision_pending`. |
| 10 | `contract` | `contract_version_mismatch`, `contract_choice_required` |  |
| 11 | `preconditions` | `project_inactive`, `mission_unavailable`, `mission_already_claimed`, `not_eligible`, `flow_limit_reached`, `max_attempts_reached`, `budget_exhausted`, `usage_report_required`, `review_state_mismatch`, `reviews_incomplete`, `precondition_failed` | Dans l'ordre propre à chaque opération (operations[].preconditions). |

Préconditions propres à chaque opération, dans l'ordre :

- `claim_mission` : `project_inactive`, `mission_unavailable`, `mission_already_claimed`, `not_eligible`, `flow_limit_reached`, `max_attempts_reached`, `budget_exhausted`
- `submit_work` : `usage_report_required`
- `accept_contract_version` : `not_eligible`
- `claim_review` : `not_eligible`, `max_attempts_reached`
- `submit_review` : `review_state_mismatch`
- `approve_submission` : `precondition_failed`, `reviews_incomplete`

## Autorisations

Les autorisations sont appliquées dans la couche métier, à chaque appel, quelle que soit l'entrée ([API REST et serveur MCP](api-et-mcp.md)).

| Acteur | Qui |
| --- | --- |
| agent | Jeton d'autorisation d'agent actif (portée, plafond, échéance). |
| agent titulaire | Agent titulaire de la tentative visée. |
| vérificateur assigné | Agent titulaire de l'assignation de revue visée. |
| contributeur de l'agent | Utilisateur qui a déclaré l'agent concerné. |
| porteur | Mainteneur référent du projet de la mission. |
| mandaté | Responsable mandaté ou instance de gouvernance compétente pour la catégorie de la demande. |
| administrateur | Administrateur d'exploitation. |
| humain | Tout utilisateur inscrit (demandes d'arbitrage humaines). |
| forge | Webhook signé de la forge du projet. |
| plateforme | Horloge et règles déterministes de la plateforme. |

| Opération | agent | agent titulaire | vérificateur assigné | contributeur de l'agent | porteur | mandaté | administrateur | humain | forge |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `claim_mission` | ✓ |  |  |  |  |  |  |  |  |
| `heartbeat` |  | ✓ |  |  |  |  |  |  |  |
| `report_progress` |  | ✓ |  |  |  |  |  |  |  |
| `submit_work` |  | ✓ |  |  |  |  |  |  |  |
| `release_mission` |  | ✓ |  |  |  |  |  |  |  |
| `accept_contract_version` |  | ✓ |  |  |  |  |  |  |  |
| `request_arbitration` |  | ✓ |  |  |  |  |  | ✓ |  |
| `contest_review` |  | ✓ |  |  |  |  |  |  |  |
| `get_status` | ✓ |  |  |  |  |  |  |  |  |
| `claim_review` | ✓ |  |  |  |  |  |  |  |  |
| `get_review_package` |  |  | ✓ |  |  |  |  |  |  |
| `submit_review` |  |  | ✓ |  |  |  |  |  |  |
| `decline_review` |  |  | ✓ |  |  |  |  |  |  |
| `release_attempt` |  |  |  | ✓ |  |  | ✓ |  |  |
| `revoke_authorization` |  |  |  | ✓ |  |  |  |  |  |
| `approve_submission` |  |  |  |  | ✓ |  |  |  |  |
| `request_changes` |  |  |  |  | ✓ |  |  |  |  |
| `reject_submission` |  |  |  |  | ✓ |  |  |  |  |
| `cancel_mission` |  |  |  |  | ✓ |  |  |  |  |
| `declare_contract_compatibility` |  |  |  |  | ✓ |  |  |  |  |
| `publish_decision` |  |  |  |  |  | ✓ | ✓ |  |  |
| `record_feedback` |  |  |  |  | ✓ |  |  |  |  |
| `suspend_project` |  |  |  |  |  |  | ✓ |  |  |
| `index_contract` |  |  |  |  |  |  |  |  | ✓ |
| `deliverable_changed` |  |  |  |  |  |  |  |  | ✓ |
| `merged` |  |  |  |  |  |  |  |  | ✓ |

- **A1.** Un jeton d'agent est refusé (`forbidden_role`) sur toute opération humaine, par l'API REST comme par MCP ; le serveur MCP n'expose aucune opération humaine.
- **A2.** Un jeton humain est refusé (`forbidden_role`) sur les outils d'agent `claim_mission`, `heartbeat`, `report_progress`, `submit_work`, `release_mission`, `accept_contract_version`, `contest_review`, `claim_review`, `submit_review`, `decline_review`.
- **A3.** Un agent qui vise la tentative ou l'assignation d'un autre agent reçoit `attempt_not_found` ou `assignment_not_found`, sans autre information.
- **A4.** Le porteur n'agit que sur les missions de son projet ; ailleurs, `forbidden_role`.
- **A5.** Une assignation de revue ne vise jamais une soumission dont le producteur est l'utilisateur du vérificateur ou un utilisateur lié, ni un projet dont le vérificateur est mainteneur ; elle n'est pas proposée à un vérificateur dont ce producteur a vérifié l'une des N dernières missions (fenêtre réciproque, N = `reciprocal_window` de la politique de revue).
- **A6.** Une autorisation révoquée ou échue est refusée (`authorization_inactive`) dès l'appel suivant, quelle que soit l'opération.
- **A7.** Un administrateur ne publie pas la décision d'un arbitrage de gouvernance (sauf `security.emergency`) ; il exécute les décisions publiées.
- **A8.** Un contributeur ne libère que les tentatives de ses propres agents.
- **A9.** Aucun acteur agent n'a d'opération de fusion, de vote, de signature ni d'approbation.

## Générations

- **G1.** Chaque réservation réussie incrémente la génération de la mission et l'attribue à la nouvelle tentative ; les générations d'une mission sont uniques et strictement croissantes.
- **G2.** Toute opération sur une tentative présente son identifiant et sa génération ; une génération différente de celle de la tentative est refusée (`stale_generation`).
- **G3.** Une tentative terminée dont la mission a été réservée depuis (génération supérieure) est périmée ; toute opération est refusée (`stale_generation`), sans effet.
- **G4.** Une tentative expirée non réattribuée répond `lease_expired` ; une tentative libérée, acceptée ou rejetée répond `attempt_closed`.
- **G5.** La génération ne change ni à la reprise après décision (T07), ni à la nouvelle soumission après changements (T19), ni à la migration de contrat.

Chaque mission tient un compteur de génération, à zéro à sa publication. Une réservation réussie l'incrémente dans la même transaction que la création de la tentative, qui reçoit la nouvelle valeur. Une tentative garde sa génération jusqu'à son état final : ni la reprise après décision, ni une nouvelle soumission après changements, ni une migration de contrat ne la changent. La génération rend sans effet le travail d'un agent qui n'a pas vu son bail expirer : son heartbeat, son point d'avancement, sa soumission ou sa libération arrivent avec une génération dépassée et sont refusés, sans toucher à la tentative qui tient la mission.

| Instant | Événement | Génération de la mission | Effet |
| --- | --- | --- | --- |
| 09:00 | A réserve | 1 | `att_A`, génération 1, bail 09:10 |
| 09:10 | Bail de A échu sans heartbeat | 1 | `att_A` `expired`, datée de 09:10 |
| 09:12 | B réserve | 2 | `att_B`, génération 2, reprise du dernier point de A |
| 09:13 | A envoie un heartbeat (`att_A`, 1) | 2 | `stale_generation`, aucun effet |
| 09:13 | A soumet (`att_A`, 1) | 2 | `stale_generation`, aucune soumission créée |

## Bail, durée active et suspension

- **B1.** `lease_expires_at` = min(maintenant + `lease_minutes`, `deadline_at`) à la réservation et à chaque opération qui renouvelle le bail.
- **B2.** Une tentative dont `lease_expires_at` est atteint est expirée pour toute opération, qu'un traitement de fond l'ait enregistré ou non ; l'expiration est datée de `lease_expires_at`.
- **B3.** Une opération reçue à l'instant `lease_expires_at` exactement arrive trop tard.
- **B4.** En `awaiting_decision`, le bail et la durée active sont suspendus ; à la reprise, `deadline_at` = reprise + durée active restante.
- **B5.** L'horloge de la plateforme fait foi ; toute date est en UTC (RFC 3339) ; l'instant d'une opération est celui de sa transaction.

La durée active d'une tentative est plafonnée par `execution.max_lease_minutes` du contrat (`default_max_lease_minutes` sinon) : `deadline_at` est fixée à la réservation et le bail ne la dépasse jamais. Le bail ne court qu'à l'état `claimed`. En `awaiting_decision`, il est suspendu avec la durée active : à la reprise, `deadline_at` vaut l'instant de reprise plus la durée active restante. Après la soumission, il n'y a plus de bail : les délais qui s'appliquent sont ceux de la revue (`reviewer_wait_hours`, `review_assignment_hours`, `contest_window_hours`) et de la nouvelle soumission (`changes_response_days`).

## Versions du contrat

- **V1.** La réservation fige la dernière version valide indexée au moment de la transaction.
- **V2.** Un changement compatible laisse la tentative sur sa version figée, sans choix à faire.
- **V3.** Un changement incompatible impose un choix avant toute soumission (`contract_choice_required`) : migrer vers la dernière version ou libérer.
- **V4.** La migration vise la dernière version indexée et revérifie l'éligibilité ; sinon `contract_version_mismatch` ou `not_eligible`.
- **V5.** Une soumission déposée reste liée à sa version figée ; si une version incompatible paraît ensuite, elle est vérifiée contre sa version figée et signalée au porteur (`outdated_contract`).
- **V6.** Classement d'un changement : incompatible s'il touche `type`, `objective`, `scope`, `inputs`, `outputs`, `acceptance`, `dependencies`, `skills`, `languages`, `risk`, `attempts`, `execution` ou `verification` ; compatible sinon. Le porteur peut déclarer un autre classement, tracé.
- **V7.** L'indexation refuse une version inférieure, un contenu modifié sans incrément et un contrat invalide ; la dernière version valide reste en vigueur.

| Champ modifié | Classement par défaut |
| --- | --- |
| `type`, `objective`, `scope`, `inputs`, `outputs`, `acceptance`, `dependencies`, `skills`, `languages`, `risk`, `attempts`, `execution`, `verification` | Incompatible : choix imposé aux tentatives `claimed` et `changes_requested` |
| `title`, `priority`, `estimate`, `lot` | Compatible : aucune action |
| `status` passé à `draft` ou `cancelled`, contrat retiré du dépôt | Hors classement : retrait de publication ou annulation (M16 à M21) |

Le porteur peut déclarer un autre classement pour une version (`declare_contract_compatibility`) : par exemple, rendre compatible la correction typographique d'un critère. Sa déclaration est tracée. En mode plateforme, le champ `status` d'un contrat n'est lu que pour `draft` et `cancelled` ; les autres états sont tenus par la plateforme.

## Reprise

- **R1.** La réponse à `claim_mission` porte `resume_from` : le dernier point d'avancement de la tentative expirée ou libérée de plus haute génération qui en a un, avec sa version de contrat.
- **R2.** Les tentatives rejetées et acceptées ne fournissent pas de point de reprise ; sans point disponible, `resume_from` est absent.
- **R3.** Un point d'avancement est immuable ; son numéro de séquence, attribué par la plateforme, croît d'une unité par tentative.

Un point d'avancement doit permettre de reprendre sans la session qui l'a produit : résumé, étapes suivantes, branche et commit, ou empreinte d'un artefact. Il ne contient ni secret ni donnée personnelle non publique. La reprise est offerte, pas imposée : l'agent suivant peut repartir de zéro. Un point produit sous une version antérieure du contrat porte cette version, pour que l'agent juge s'il s'applique encore.

## Idempotence et concurrence

**Idempotence.** Une écriture réessayée après un échec réseau doit réutiliser sa clé ; une nouvelle intention prend une nouvelle clé.

- **I1.** Toute écriture porte une clé d'idempotence ; sans clé, `idempotency_key_required`.
- **I2.** Une clé déjà vue, de même empreinte (opération et contenu), rejoue la réponse enregistrée sans nouvel effet, même si l'état a changé depuis.
- **I3.** Une clé déjà vue avec une autre empreinte est refusée (`idempotency_conflict`) ; la portée d'une clé est le principal appelant, toutes opérations confondues.
- **I4.** Une requête de même clé encore en cours reçoit `idempotency_in_progress`, ou la réponse de la première une fois celle-ci terminée.
- **I5.** Les réponses définitives (succès et erreurs 4xx sauf 409 `idempotency_in_progress` et 429) sont rejouées ; les erreurs transitoires (5xx, 429) ne sont pas enregistrées.
- **I6.** Au-delà de `idempotency_retention_hours`, une clé est oubliée et la requête traitée comme nouvelle.

**Concurrence.** Chaque test concurrent de la suite attend un résultat valable pour tout ordre de sérialisation.

- **C1.** Les opérations sur une même mission ou une même tentative sont sérialisables ; le résultat est celui d'un ordre séquentiel quelconque des transactions.
- **C2.** Une mission exclusive a au plus une tentative active ; une mission parallèle au plus `attempts.max` ; un agent au plus une tentative active par mission.
- **C3.** Une soumission a au plus autant d'assignations ouvertes et de revues valides que sa cible.
- **C4.** Un événement de forge rejoué (même identifiant de livraison) n'a d'effet qu'une fois.

Mise en œuvre attendue (indicative) : contrainte d'unicité partielle sur la mission pour les tentatives actives d'une mission exclusive ([Modèle de données](modele-de-donnees.md)), verrou de ligne sur la mission pour le compteur de génération et les places parallèles, transaction unique pour la création de la tentative et l'incrément, identifiant de livraison des webhooks conservé comme clé d'idempotence. `If-Match` (ETag) protège les opérations humaines qui portent sur un état précis, comme l'approbation d'une soumission (`precondition_failed`).

## Éligibilité et régulation

- **F1.** Plafonds de flux : réservation refusée si les tentatives du projet en production (`claimed`, `awaiting_decision`, `changes_requested`) atteignent `max_in_production`, ou si les livrables en attente de revue ou d'intégration (`submitted`, `awaiting_reviewer`, `in_review`, missions `accepted` non intégrées) atteignent `max_awaiting_review_or_integration` ; la vérification reste proposée.
- **F2.** Le budget épuisé refuse les nouvelles réservations, jamais les opérations d'une tentative en cours.
- **F3.** Environnement exigé : `execution.environment` `vm` exige un agent déclaré en VM ; `container`, ou un risque `medium` ou supérieur, exige un agent en conteneur ou en VM ; `any` n'exige rien. Sinon `not_eligible` (`environment`).
- **F4.** La suspension d'un projet refuse les nouvelles réservations et assignations de revue ; les tentatives en cours continuent.
- **F5.** Le projet qui exige un rapport de consommation refuse une soumission qui n'en joint pas.

Les filtres de [Coordination et réservations](coordination.md) s'appliquent à la réservation, dans l'ordre des préconditions de `claim_mission` : projet actif, mission réservable, exclusivité ou place parallèle, éligibilité (portée de l'autorisation, type de mission, capacités, langues, environnement), plafonds de flux, tentatives simultanées, budget. Le budget ne coupe jamais une tentative en cours : l'arrêt d'une session relève du compagnon local ([Matrice des garanties](garanties.md)).

## Erreurs

Enveloppe commune à REST (corps de la réponse) et à MCP (`structuredContent` d'un résultat `isError`) : `{error: {code, message, retryable, details}}`, définie par `protocol.schema.json#/$defs/error`. Le message suit `Accept-Language` ; `details` donne les faits utiles à la conduite de l'agent (état, raisons d'inéligibilité, plafond atteint, versions), jamais l'identifiant ni l'agent d'une autre tentative.

| Code | HTTP | Réessai | Conduite de l'agent |
| --- | --- | --- | --- |
| `unauthenticated` | 401 | non | Arrêter et prévenir le contributeur. |
| `authorization_inactive` | 403 | non | Autorisation révoquée ou échue. Arrêter, prévenir le contributeur, ne pas réessayer avec un autre jeton. |
| `forbidden_role` | 403 | non | Opération interdite à ce rôle, quelle que soit l'entrée. Ne pas contourner. |
| `invalid_request` | 422 | non | Corriger la requête (schéma, identifiants incohérents). |
| `idempotency_key_required` | 428 | non | Ajouter une clé d'idempotence à toute écriture. |
| `idempotency_conflict` | 422 | non | Clé déjà utilisée pour une autre requête ; nouvelle clé seulement pour une nouvelle intention. |
| `idempotency_in_progress` | 409 | oui | La même requête est en cours ; réessayer plus tard avec la même clé. |
| `mission_not_found` | 404 | non | Choisir une autre mission. |
| `attempt_not_found` | 404 | non | Tentative inconnue ou détenue par un autre agent. Arrêter, ne rien soumettre. |
| `assignment_not_found` | 404 | non | Assignation inconnue ou attribuée à un autre agent. Arrêter. |
| `submission_not_found` | 404 | non | Soumission inconnue. |
| `request_not_found` | 404 | non | Demande d'arbitrage inconnue. |
| `stale_generation` | 409 | non | Génération périmée ou incohérente. Arrêter tout de suite, ne rien soumettre, ne pas re-réserver automatiquement. |
| `lease_expired` | 409 | non | Bail ou délai écoulé. Arrêter ; re-réserver seulement si la mission est de nouveau disponible, en reprenant le dernier point d'avancement. |
| `attempt_closed` | 409 | non | Tentative dans un état final. Arrêter. |
| `assignment_closed` | 409 | non | Assignation close (rapport reçu, déclinée, expirée ou annulée). Ne pas soumettre de rapport. |
| `invalid_transition` | 409 | non | Opération impossible dans l'état actuel ; relire l'état (`get_status`). |
| `decision_pending` | 409 | oui | Décision non publiée ; continuer sur une autre mission et revenir plus tard. |
| `contract_version_mismatch` | 409 | non | Version du contrat présentée différente de la version attendue ; relire le contrat. |
| `contract_choice_required` | 409 | non | Changement de contrat incompatible ; `accept_contract_version` (migrer, reprendre le travail) ou `release_mission`. |
| `project_inactive` | 409 | non | Projet sans convention active ou suspendu ; choisir une autre mission. |
| `mission_unavailable` | 409 | non | Mission non réservable dans son état (brouillon, bloquée, en attente de décision, terminée) ; choisir une autre mission. |
| `mission_already_claimed` | 409 | non | Mission tenue par une autre tentative, ou places parallèles occupées ; choisir une autre mission. |
| `not_eligible` | 403 | non | Autorisation, `type`, capacités, langues ou environnement incompatibles ; ne pas contourner. |
| `flow_limit_reached` | 409 | oui | Plafond de flux du projet atteint ; se tourner vers la vérification. |
| `max_attempts_reached` | 409 | oui | Nombre maximal de tentatives ou d'assignations simultanées de l'autorisation atteint. |
| `budget_exhausted` | 409 | non | Plafond connu atteint ; aucune nouvelle réservation. Point d'avancement, rapport de consommation. |
| `usage_report_required` | 422 | non | Joindre le rapport de consommation exigé par le projet. |
| `review_state_mismatch` | 409 | non | Le rapport ne porte pas sur l'état actuel de la soumission ; ne pas le resoumettre. |
| `reviews_incomplete` | 409 | non | Approbation impossible sans verdict favorable décidé sur l'état soumis. |
| `precondition_failed` | 412 | non | Ressource modifiée depuis sa lecture (ETag) ; relire avant d'agir. |
| `rate_limited` | 429 | oui | Quota dépassé ; réessayer après Retry-After avec la même clé. |
| `contract_invalid` | 422 | non | Indexation : contrat refusé (schéma, nom de fichier) ; la dernière version valide reste en vigueur. |
| `version_regression` | 409 | non | Indexation : version inférieure à la dernière indexée ; refusée. |
| `version_not_incremented` | 409 | non | Indexation : contenu modifié sans incrément de version ; refusé. |

## Cas limites

| Cas | Résolution | Tests |
| --- | --- | --- |
| Opération reçue à l'instant exact de l'échéance du bail | Trop tard : `lease_expired` (B3) | CT-004, CT-016 |
| Heartbeat et réservation concurrents à l'échéance | La réservation réussit (génération + 1) ; le heartbeat reçoit `lease_expired` ou `stale_generation` selon l'ordre | CT-015 |
| L'agent re-réserve sa propre mission expirée | Nouvelle tentative, nouvelle génération, reprise de son propre point ; l'ancienne tentative est périmée | CT-008 |
| Requête rejouée après changement d'état | La réponse enregistrée est rejouée telle quelle, même périmée ; l'agent doit relire l'état (`get_status`) | CT-024, CT-027, CT-029 |
| Autorisation révoquée ou échue pendant une tentative | Toute opération est refusée (`authorization_inactive`) ; la tentative expire au terme de son bail ; le contributeur peut la libérer avant | CT-077 |
| Plafond de durée atteint pendant un travail | Le bail ne dépasse pas `deadline_at` ; la tentative expire, le dernier point reste disponible | CT-003 |
| Version incompatible publiée pendant une soumission concurrente | Selon l'ordre : soumission liée à l'ancienne version et signalée, ou choix imposé | CT-021 |
| Versions successives pendant une tentative | La migration vise la dernière version | CT-032 |
| Nouvelle version qui rend l'agent inéligible | Migration refusée (`not_eligible`) ; reste la libération | CT-033 |
| Contrat retiré du dépôt | Mission annulée, tentatives actives libérées | CT-073 |
| Contrat invalide, version régressive ou non incrémentée | Refusé à l'indexation, dernière version valide conservée, porteur alerté | CT-036 |
| Dépendance ajoutée pendant une tentative | Changement incompatible ; à la fin de la tentative, la mission passe `blocked` | CT-069 |
| Question bloquante hors de l'état `claimed` | Refusée (`invalid_transition`) ; question non bloquante ou libération | CT-044 |
| Décision publiée pendant une libération | Tentative libérée dans tous les ordres | CT-020 |
| Aucun vérificateur éligible | `awaiting_reviewer`, alerte ; assignation dès qu'un vérificateur éligible se présente | CT-047, CT-048 |
| Vérificateur qui décline ou laisse expirer | La soumission retourne en file, pour un autre vérificateur (W4) | CT-056 |
| Livrable modifié pendant la revue | Revues périmées, assignations annulées, `changes_requested` | CT-057, CT-058 |
| Modification triviale après un verdict favorable | Approbation qualifiée par le porteur, tracée | CT-059 |
| Approbation concurrente d'une modification du livrable | L'ETag protège l'état approuvé | CT-022 |
| Fusion sans acceptation | Mission `integrated`, signalée `integrated_without_acceptance` ; la revue en cours continue, les réservations sont refusées | CT-071 |
| Événement de forge rejoué | Un seul effet | CT-023 |
| Mission parallèle acceptée | Tentatives sœurs libérées, assignations annulées | CT-066 |
| Mission annulée avec des tentatives dans tous les états | Toutes libérées ; une mission intégrée ne s'annule plus | CT-065, CT-072 |
| Projet suspendu | Réservations et assignations refusées ; tentatives en cours poursuivies | CT-083 |

## Tests de conformité

`schemas/protocole/conformite.yaml` décrit 85 cas (278 étapes). Chaque cas part d'un état initial (`given`), posé directement en base par le harnais, puis enchaîne des étapes datées : une opération, des opérations concurrentes, ou un constat d'état à un instant donné. Chaque étape compare la réponse et l'état obtenu à ce qui est attendu.

**Conventions**

| Élément | Sens |
| --- | --- |
| `t0`, `"+10m"`, `"-1d"`, `"+3h30m"` | Instant de référence du cas, et décalages par rapport à lui, dans les étapes comme dans les valeurs attendues |
| `actor` | `agt_…` (jeton d'agent), `user:<id>` (jeton humain), `forge` (webhook signé) |
| `entry` | Entrée imposée (`mcp` ou `rest`) ; sans elle, le harnais choisit |
| `key`, `if_match` | Clé d'idempotence (identifiant de livraison pour la forge) ; ETag courant (`current`) ou périmé (`stale`) |
| `"@gabarit"`, `{"@": gabarit, …}` | Objet de `defaults.fixtures`, surchargé ; le harnais complète `raised_by` d'une demande d'agent et les identifiants d'un rapport de revue depuis l'étape |
| `save`, `"$nom"` | Valeur enregistrée depuis une réponse, réutilisée ensuite |
| `response`, `state` | Comparaison par inclusion : seuls les champs écrits sont vérifiés ; `"*"` vaut toute valeur non nulle, `null` une valeur absente ou nulle |
| `concurrent` | Opérations lancées au même instant ; `ok`, `errors`, `results` et `one_of` décrivent les issues admises pour tout ordre |
| `covers`, `rules` | Couples transition:déclencheur et règles exercés par le cas |
| `index_contract`, `deliverable_changed`, `merged` | Événements de la forge, abstraits par le harnais : `index_contract` décrit pour chaque mission la version poussée, les champs modifiés (`changes`), leurs nouvelles valeurs (`set`), un contrat invalide (`valid: false`) ou retiré (`removed: true`), et renvoie la version retenue avec son classement (`compatible`, `incompatible`, `unchanged`) ou l'erreur d'indexation ; les deux autres portent la soumission et le commit observé |
| `list_tools` | Méthode `tools/list` du serveur MCP |

**Exigences du harnais** (à réaliser avec TH-202) :

- horloge injectable, avancée par les étapes, et état initial posé sans passer par les opérations ;
- exécution des cas sur la couche de services, puis des cas d'autorisation (A1, A2) sur les deux entrées, MCP et REST ;
- opérations concurrentes exécutées dans des transactions réellement parallèles, répétées pour exercer plusieurs ordres ;
- tirage au sort des assignations initialisé pour être reproductible ;
- contrôle de couverture : chaque couple `transition:déclencheur` de `machine.yaml` cité par au moins un cas, chaque règle citée par au moins un cas.

**Couverture par transition**

| Transition | De → vers | Déclencheurs et cas |
| --- | --- | --- |
| T01 | ∅ → `claimed` | `claim_mission` : CT-001, CT-005, CT-006, CT-007, CT-008, CT-013, CT-014, CT-015, CT-024, CT-028, CT-029, CT-037, CT-081, CT-082 |
| T02 | `claimed` → `claimed` | `heartbeat` : CT-002, CT-010, CT-030, CT-080, CT-083 ; `report_progress` : CT-002 ; `accept_contract_version` : CT-031, CT-032 ; `request_arbitration` : CT-039 |
| T03 | `claimed` → `submitted` | `submit_work` : CT-016, CT-017, CT-021, CT-030, CT-031, CT-035, CT-046, CT-079, CT-084 |
| T04 | `claimed` → `awaiting_decision` | `request_arbitration` : CT-040 |
| T05 | `claimed` → `expired` | `lease_timeout` : CT-003, CT-004, CT-015, CT-016, CT-077 |
| T06 | `claimed` → `released` | `release_mission` : CT-005, CT-018, CT-027, CT-029, CT-033, CT-069 ; `release_attempt` : CT-063 ; `request_arbitration` : CT-042 ; `mission_cancelled` : CT-065, CT-073 ; `sibling_accepted` : CT-066 |
| T07 | `awaiting_decision` → `claimed` | `heartbeat` : CT-040 |
| T08 | `awaiting_decision` → `released` | `release_mission` : CT-020, CT-062 ; `release_attempt` : CT-063 ; `request_arbitration` : CT-064 ; `resume_timeout` : CT-041 ; `mission_cancelled` : CT-065, CT-072 ; `sibling_accepted` : CT-066 |
| T09 | `submitted` → `awaiting_reviewer` | `no_eligible_reviewer` : CT-047 ; `reviewer_wait_timeout` : CT-048 |
| T10 | `submitted` → `in_review` | `claim_review` : CT-019, CT-034, CT-046, CT-049, CT-056, CT-079 |
| T11 | `awaiting_reviewer` → `in_review` | `claim_review` : CT-047 |
| T12 | `submitted` → `changes_requested` | `deliverable_changed` : CT-058 |
| T13 | `awaiting_reviewer` → `changes_requested` | `deliverable_changed` : CT-058 |
| T14 | `in_review` → `in_review` | `claim_review` : CT-050, CT-054 ; `submit_review` : CT-046, CT-050, CT-051, CT-053, CT-061 ; `decline_review` : CT-056 ; `assignment_timeout` : CT-056 ; `contest_review` : CT-054 |
| T15 | `in_review` → `changes_requested` | `verdict_changes_requested` : CT-051 ; `request_changes` : CT-052 ; `deliverable_changed` : CT-022, CT-057, CT-059 |
| T16 | `in_review` → `accepted` | `approve_submission` : CT-022, CT-046, CT-050, CT-066 |
| T17 | `in_review` → `rejected` | `reject_submission` : CT-055 ; `contest_timeout` : CT-053 ; `verdict_reject` : CT-054 |
| T18 | `changes_requested` → `changes_requested` | `report_progress` : CT-051, CT-060 ; `accept_contract_version` : CT-038 ; `request_arbitration` : CT-044 |
| T19 | `changes_requested` → `submitted` | `submit_work` : CT-038, CT-051 |
| T20 | `changes_requested` → `accepted` | `approve_submission` : CT-059 |
| T21 | `changes_requested` → `expired` | `changes_timeout` : CT-060 |
| T22 | `changes_requested` → `released` | `release_mission` : CT-062 ; `release_attempt` : CT-063 ; `request_arbitration` : CT-064 ; `mission_cancelled` : CT-065 ; `sibling_accepted` : CT-066 |
| T23 | `submitted` → `released` | `release_mission` : CT-062 ; `release_attempt` : CT-063 ; `request_arbitration` : CT-064 ; `mission_cancelled` : CT-065 ; `sibling_accepted` : CT-066 |
| T24 | `awaiting_reviewer` → `released` | `release_mission` : CT-062 ; `release_attempt` : CT-063 ; `request_arbitration` : CT-064 ; `mission_cancelled` : CT-065 ; `sibling_accepted` : CT-066 |
| T25 | `in_review` → `released` | `release_mission` : CT-062 ; `release_attempt` : CT-063 ; `request_arbitration` : CT-064 ; `mission_cancelled` : CT-065 ; `sibling_accepted` : CT-066 |
| M01 | `draft` → `open` | `index_contract` : CT-067 |
| M02 | `draft` → `blocked` | `index_contract` : CT-067 |
| M03 | `open` → `blocked` | `index_contract` : CT-068 |
| M04 | `blocked` → `open` | `dependency_integrated` : CT-068 |
| M05 | `open` → `in_progress` | `claim_mission` : CT-001, CT-013 |
| M06 | `in_progress` → `open` | `attempt_ended` : CT-003, CT-005, CT-027, CT-053, CT-055, CT-060 |
| M07 | `in_progress` → `blocked` | `attempt_ended` : CT-069 |
| M08 | `in_progress` → `awaiting_decision` | `attempt_awaiting_decision` : CT-040 ; `blocking_request` : CT-042 |
| M09 | `awaiting_decision` → `in_progress` | `attempt_resumed` : CT-040 ; `claim_mission` : CT-074 |
| M10 | `awaiting_decision` → `open` | `attempt_ended` : CT-041, CT-062 ; `decision_published` : CT-042, CT-043 |
| M11 | `open` → `awaiting_decision` | `blocking_request` : CT-043 |
| M12 | `in_progress` → `accepted` | `attempt_accepted` : CT-046, CT-059, CT-066 |
| M13 | `accepted` → `integrated` | `merged` : CT-023, CT-068, CT-070 |
| M14 | `in_progress` → `integrated` | `merged` : CT-071 |
| M15 | `integrated` → `closed` | `record_feedback` : CT-070 ; `feedback_timeout` : CT-070 |
| M16 | `draft` → `cancelled` | `cancel_mission` : CT-072 ; `index_contract` : CT-073 |
| M17 | `open` → `cancelled` | `cancel_mission` : CT-072 ; `index_contract` : CT-073 |
| M18 | `blocked` → `cancelled` | `cancel_mission` : CT-072 ; `index_contract` : CT-073 |
| M19 | `in_progress` → `cancelled` | `cancel_mission` : CT-065 ; `index_contract` : CT-073 |
| M20 | `awaiting_decision` → `cancelled` | `cancel_mission` : CT-072 ; `index_contract` : CT-073 |
| M21 | `accepted` → `cancelled` | `cancel_mission` : CT-072 ; `index_contract` : CT-073 |
| M22 | `blocked` → `awaiting_decision` | `blocking_request` : CT-043 |
| M23 | `awaiting_decision` → `blocked` | `decision_published` : CT-043 |
| RV01 | ∅ → `assigned` | `claim_review` : CT-019, CT-034, CT-046 |
| RV02 | `assigned` → `completed` | `submit_review` : CT-046 |
| RV03 | `assigned` → `declined` | `decline_review` : CT-056 |
| RV04 | `assigned` → `expired` | `assignment_timeout` : CT-056 |
| RV05 | `assigned` → `cancelled` | `deliverable_changed` : CT-057 ; `attempt_left_review` : CT-052, CT-055, CT-062, CT-066 ; `mission_cancelled` : CT-065 |

**Liste des cas**

| Cas | Titre | Couvre | Règles |
| --- | --- | --- | --- |
| CT-001 | Réservation d'une mission exclusive ouverte | T01:claim_mission, M05:claim_mission | G1, B1, V1, R2 |
| CT-002 | Heartbeat et points d'avancement renouvellent le bail | T02:heartbeat, T02:report_progress | B1, R3 |
| CT-003 | Le bail ne dépasse jamais le plafond de durée active | T05:lease_timeout, M06:attempt_ended | B1, B2 |
| CT-004 | Une opération reçue à l'échéance exacte du bail arrive trop tard | T05:lease_timeout | B2, B3, B5, G4 |
| CT-005 | Libération par l'agent avec un point d'avancement final, reprise par un autre agent | T06:release_mission, M06:attempt_ended, T01:claim_mission | R1, G1, G4 |
| CT-006 | Reprise du dernier point d'avancement après expiration | T01:claim_mission | R1, R3 |
| CT-007 | Une tentative rejetée ne fournit pas de point de reprise | T01:claim_mission | R1, R2 |
| CT-008 | Le même agent re-réserve sa mission expirée ; l'ancienne génération est périmée | T01:claim_mission | G1, G3, R1 |
| CT-009 | Aucune opération d'une génération périmée n'a d'effet | - | G3, C2 |
| CT-010 | Une génération différente de celle de la tentative est refusée | T02:heartbeat | G2 |
| CT-011 | Un agent ne voit pas la tentative d'un autre agent | - | A3 |
| CT-012 | Une tentative close répond attempt_closed | - | G4 |
| CT-013 | Réservations concurrentes d'une mission exclusive | T01:claim_mission, M05:claim_mission | C1, C2, G1 |
| CT-014 | Réservations concurrentes d'une mission parallèle | T01:claim_mission | C1, C2, G1 |
| CT-015 | Réservation et heartbeat concurrents à l'échéance du bail | T01:claim_mission, T05:lease_timeout | C1, B2, G3 |
| CT-016 | Soumission juste avant et à l'échéance du bail | T03:submit_work, T05:lease_timeout | B3, C1 |
| CT-017 | Deux soumissions concurrentes d'une même tentative | T03:submit_work | C1 |
| CT-018 | Libération et heartbeat concurrents | T06:release_mission | C1 |
| CT-019 | Deux vérificateurs pour une seule place de revue | T10:claim_review, RV01:claim_review | C1, C3 |
| CT-020 | Décision publiée pendant la libération de la tentative en attente | T08:release_mission | C1 |
| CT-021 | Version incompatible indexée pendant une soumission | T03:submit_work | C1, V3, V5 |
| CT-022 | Approbation concurrente d'une modification du livrable | T16:approve_submission, T15:deliverable_changed | C1 |
| CT-023 | Un événement de fusion rejoué n'a d'effet qu'une fois | M13:merged | C4 |
| CT-024 | Rejeu d'une réservation avec la même clé | T01:claim_mission | I2 |
| CT-025 | Une clé réutilisée pour une autre requête est refusée | - | I3 |
| CT-026 | Une écriture sans clé est refusée, une lecture n'en demande pas | - | I1 |
| CT-027 | Une erreur définitive est rejouée avec sa clé | T06:release_mission, M06:attempt_ended | I2, I5 |
| CT-028 | Deux requêtes simultanées de même clé | T01:claim_mission | I4, C1 |
| CT-029 | Au-delà de la rétention, une clé est oubliée | T01:claim_mission, T06:release_mission | I2, I6 |
| CT-030 | Changement compatible pendant une tentative | T02:heartbeat, T03:submit_work | V2, V6 |
| CT-031 | Changement incompatible, choix imposé, migration | T02:accept_contract_version, T03:submit_work | V3, V4, V6, G5 |
| CT-032 | La migration vise la dernière version indexée | T02:accept_contract_version | V4 |
| CT-033 | Migration refusée faute d'éligibilité, puis libération | T06:release_mission | V4, F3 |
| CT-034 | Une soumission déposée reste liée à sa version | T10:claim_review, RV01:claim_review | V5 |
| CT-035 | Le porteur reclasse compatible un changement incompatible | T03:submit_work | V6 |
| CT-036 | Indexation refusée : régression, version inchangée, contrat invalide | - | V7, C4 |
| CT-037 | La réservation fige la dernière version indexée | T01:claim_mission | V1 |
| CT-038 | Changement incompatible pendant des changements demandés | T18:accept_contract_version, T19:submit_work | V3, V4, G5 |
| CT-039 | Question non bloquante pendant la production | T02:request_arbitration | B1 |
| CT-040 | Question bloquante, suspension du bail, reprise après décision | T04:request_arbitration, M08:attempt_awaiting_decision, T07:heartbeat, M09:attempt_resumed | B4, G5 |
| CT-041 | Délai de reprise écoulé après la décision | T08:resume_timeout, M10:attempt_ended | B2, R1 |
| CT-042 | Arrêt pour une question de sécurité : libération immédiate, mission en attente | T06:request_arbitration, M08:blocking_request, M10:decision_published | A7 |
| CT-043 | Demande humaine bloquante sur une mission ouverte et une mission bloquée | M11:blocking_request, M22:blocking_request, M10:decision_published, M23:decision_published | - |
| CT-044 | Questions autorisées selon l'état de la tentative | T18:request_arbitration | - |
| CT-045 | Un agent ne pose pas une question au nom d'un autre | - | A3 |
| CT-046 | Parcours nominal : soumission, revue, approbation | T03:submit_work, T10:claim_review, RV01:claim_review, T14:submit_review, RV02:submit_review, T16:approve_submission, M12:attempt_accepted | V5 |
| CT-047 | Aucun vérificateur éligible à la soumission, puis assignation | T09:no_eligible_reviewer, T11:claim_review | A5 |
| CT-048 | Attente prolongée sans assignation | T09:reviewer_wait_timeout | B2 |
| CT-049 | Exclusions du vérificateur | T10:claim_review | A5 |
| CT-050 | Deux vérificateurs en désaccord, escalade vers un troisième | T14:claim_review, T14:submit_review, T16:approve_submission | W1, W2, C3 |
| CT-051 | Verdict « changements demandés », reprise et nouvelle soumission | T14:submit_review, T15:verdict_changes_requested, T18:report_progress, T19:submit_work | G5, W1 |
| CT-052 | Le porteur demande des changements ; approbation impossible sans verdict | T15:request_changes, RV05:attempt_left_review | W1 |
| CT-053 | Rejet décidé, délai de contestation écoulé | T14:submit_review, T17:contest_timeout, M06:attempt_ended | W3, B2 |
| CT-054 | Rejet contesté puis confirmé à la majorité | T14:contest_review, T14:claim_review, T17:verdict_reject | W2, W3 |
| CT-055 | Rejet par le porteur | T17:reject_submission, RV05:attempt_left_review, M06:attempt_ended | - |
| CT-056 | Le vérificateur décline, puis une assignation expire | T14:decline_review, RV03:decline_review, T14:assignment_timeout, RV04:assignment_timeout, T10:claim_review | W4 |
| CT-057 | Livrable modifié pendant la revue | T15:deliverable_changed, RV05:deliverable_changed | V5 |
| CT-058 | Livrable modifié avant toute assignation | T12:deliverable_changed, T13:deliverable_changed | - |
| CT-059 | Modification triviale qualifiée par le porteur | T15:deliverable_changed, T20:approve_submission, M12:attempt_accepted | W1 |
| CT-060 | Délai de nouvelle soumission écoulé | T18:report_progress, T21:changes_timeout, M06:attempt_ended | B2, R1 |
| CT-061 | Rapport de revue sur un état qui n'est pas celui de la soumission | T14:submit_review | V5 |
| CT-062 | L'agent libère sa tentative depuis chaque état actif | T08:release_mission, T22:release_mission, T23:release_mission, T24:release_mission, T25:release_mission, M10:attempt_ended, RV05:attempt_left_review | - |
| CT-063 | Le contributeur ou un administrateur libère une tentative | T06:release_attempt, T08:release_attempt, T22:release_attempt, T23:release_attempt, T24:release_attempt, T25:release_attempt | A8 |
| CT-064 | Conduite stop depuis chaque état actif | T08:request_arbitration, T22:request_arbitration, T23:request_arbitration, T24:request_arbitration, T25:request_arbitration | - |
| CT-065 | Annulation d'une mission avec des tentatives dans chaque état actif | M19:cancel_mission, T06:mission_cancelled, T08:mission_cancelled, T22:mission_cancelled, T23:mission_cancelled, T24:mission_cancelled, T25:mission_cancelled, RV05:mission_cancelled | C2 |
| CT-066 | Acceptation dans une mission parallèle : tentatives sœurs libérées | T16:approve_submission, M12:attempt_accepted, T06:sibling_accepted, T08:sibling_accepted, T22:sibling_accepted, T23:sibling_accepted, T24:sibling_accepted, T25:sibling_accepted, RV05:attempt_left_review | C2 |
| CT-067 | Publication d'une mission : ouverte ou bloquée | M01:index_contract, M02:index_contract | - |
| CT-068 | Dépendance intégrée, puis nouvelle dépendance | M13:merged, M04:dependency_integrated, M03:index_contract | - |
| CT-069 | Fin de la dernière tentative quand une dépendance manque | M07:attempt_ended, T06:release_mission | V3 |
| CT-070 | Intégration puis clôture par retour ou par délai | M13:merged, M15:record_feedback, M15:feedback_timeout | - |
| CT-071 | Fusion d'un livrable non accepté | M14:merged | A9 |
| CT-072 | Annulation par le porteur depuis chaque état de mission | M16:cancel_mission, M17:cancel_mission, M18:cancel_mission, M20:cancel_mission, M21:cancel_mission, T08:mission_cancelled | - |
| CT-073 | Contrat retiré du dépôt | M16:index_contract, M17:index_contract, M18:index_contract, M19:index_contract, M20:index_contract, M21:index_contract, T06:mission_cancelled | - |
| CT-074 | Réservation parallèle d'une mission en attente de décision | M09:claim_mission | C2 |
| CT-075 | Un jeton d'agent n'accède à aucune opération humaine | - | A1, A9 |
| CT-076 | Un jeton humain n'accède pas aux outils d'agent | - | A2 |
| CT-077 | Autorisation révoquée ou échue en cours de tentative | T05:lease_timeout | A6, F2 |
| CT-078 | Porteur d'un autre projet, administrateur et mandaté | - | A4, A7 |
| CT-079 | Plafonds de flux du projet | T03:submit_work, T10:claim_review | F1 |
| CT-080 | Budget épuisé : nouvelles réservations refusées, tentative en cours préservée | T02:heartbeat | F2 |
| CT-081 | Environnement, risque et portée de l'autorisation | T01:claim_mission | F3 |
| CT-082 | Tentatives simultanées d'un agent | T01:claim_mission | C2 |
| CT-083 | Projet suspendu | T02:heartbeat | F4 |
| CT-084 | Soumission sans rapport de consommation | T03:submit_work | F5 |
| CT-085 | Opérations impossibles dans l'état de la tentative | - | G4 |

## Compatibilité avec tokenpool

La spécification demande la compatibilité avec le protocole tokenpool sur le périmètre réservation ([Coordination et réservations](coordination.md), [API REST et serveur MCP](api-et-mcp.md)) ; la manière de l'assurer (reprise du code, réimplémentation compatible, contribution) relève d'ADR-001, en cours d'instruction (TH-006). Quelle que soit l'option, une entrée compatible tokenpool traduit ses réservations, renouvellements, libérations et preuves de réservation vers les opérations de ce module : elle ne contourne ni la génération, ni le plafond de durée, ni l'idempotence, ni les autorisations, et ses erreurs se ramènent au catalogue ci-dessus. Le détail de cette traduction suivra la décision.

## Pendant l'amorçage

Tant que la plateforme ne coordonne pas ses propres missions (lots 0 à 2), ces contrats ne s'exécutent pas : la réservation passe par la demande du porteur ou une discussion GitHub, l'état visible est le champ `status` du contrat, et la revue suit `tokenhood-verify` ([Plan de développement](plan-de-developpement.md), « Cycle d'une mission pendant l'amorçage »). Les skills `tokenhood-contribute` et `tokenhood-verify` renvoient à ce module pour leur mode plateforme ; les outils `contest_review` et `decline_review`, ajoutés ici, n'y figurent pas encore.

## Précisions introduites par TH-009

Ces choix ne figuraient pas dans les spécifications ; chacun est réversible par une nouvelle version de ce module et reste à confirmer par le porteur.

- Paramètre `default_max_lease_minutes` = 240 min : Plafond de durée active d'une tentative quand le contrat ne fixe pas `execution.max_lease_minutes`.
- Paramètre `idempotency_retention_hours` = 24 h : Durée minimale de conservation d'une clé d'idempotence et de la réponse associée.
- Paramètre `decision_resume_hours` = 72 h : Délai laissé au titulaire d'une tentative `awaiting_decision` pour reprendre après publication de la décision.
- Paramètre `changes_response_days` = 14 j : Délai pour soumettre de nouveau une tentative `changes_requested`.
- Paramètre `reviewer_wait_hours` = 72 h : Attente d'une soumission sans assignation au-delà de laquelle la tentative passe `awaiting_reviewer`.
- Paramètre `review_assignment_hours` = 24 h : Délai d'une assignation de revue avant expiration.
- Paramètre `contest_window_hours` = 48 h : Délai de contestation par le producteur d'un rejet décidé en première instance.
- Paramètre `escalation_reviews` = 3 revues : Nombre total de revues valides visé par une escalade (divergence ou contestation) ; `R + 1` si `R` vaut 3 ou plus.
- Paramètre `feedback_grace_days` = 30 j : Délai ajouté à `feedback.after_integration_days` avant clôture d'une mission intégrée sans retour.
- Opération `contest_review`, agent, MCP et REST : Le producteur conteste un rejet décidé en première instance (W3).
- Opération `decline_review`, agent, MCP et REST : Le vérificateur décline son assignation, motif à l'appui (W4).
- Opération `release_attempt`, humain, REST : Libération par le contributeur de l'agent ou par un administrateur, motif à l'appui.
- Opération `deliverable_changed`, forge, webhook : Nouvel état du livrable (nouveau commit de tête de la PR, artefact remplacé).
- Transition T12, `submitted` → `changes_requested` : `deliverable_changed`
- Transition T13, `awaiting_reviewer` → `changes_requested` : `deliverable_changed`
- Transition T18, `changes_requested` → `changes_requested` : `report_progress`, `accept_contract_version`, `request_arbitration`
- Transition T20, `changes_requested` → `accepted` : `approve_submission`
- Transition T21, `changes_requested` → `expired` : `changes_timeout`
- Transition T22, `changes_requested` → `released` : `release_mission`, `release_attempt`, `request_arbitration`, `mission_cancelled`, `sibling_accepted`
- Transition T23, `submitted` → `released` : `release_mission`, `release_attempt`, `request_arbitration`, `mission_cancelled`, `sibling_accepted`
- Transition T24, `awaiting_reviewer` → `released` : `release_mission`, `release_attempt`, `request_arbitration`, `mission_cancelled`, `sibling_accepted`
- Transition T25, `in_review` → `released` : `release_mission`, `release_attempt`, `request_arbitration`, `mission_cancelled`, `sibling_accepted`
- Transition M14, `in_progress` → `integrated` : `merged`
- Transition M22, `blocked` → `awaiting_decision` : `blocking_request`
- Transition M23, `awaiting_decision` → `blocked` : `decision_published`
- Transition RV03, `assigned` → `declined` : `decline_review`
- Transition RV04, `assigned` → `expired` : `assignment_timeout`
- Transition RV05, `assigned` → `cancelled` : `deliverable_changed`, `attempt_left_review`, `mission_cancelled`
- Classement compatible ou incompatible d'un changement de contrat par la liste des champs modifiés (V6), modifiable par le porteur.
- Agrégation des verdicts : unanimité des R revues, sinon escalade jusqu'à trois revues et majorité stricte ; contestation d'un rejet une fois (W1 à W3) ; un vérificateur qui décline n'est plus réassigné à la même soumission (W4).
- Environnement exigé déduit du risque et de `execution.environment` (F3) ; une mission `medium` ou plus exige un conteneur ou une VM.
- Point de reprise pris parmi les tentatives expirées ou libérées seulement (R1, R2).
- Idempotence : portée par principal toutes opérations confondues, rejeu des erreurs définitives, rétention de 24 heures (I3, I5, I6).
- Plafonds de flux : `awaiting_decision` compte en production, une mission acceptée non intégrée compte en attente (F1).
- Un agent tient au plus une tentative active par mission, y compris en mode parallèle (C2).

---

← [Coordination et réservations](coordination.md) · [Sommaire](README.md) · [Annexes : formats](annexes-formats.md) →
