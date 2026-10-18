# Protocole de contribution

Sources dans le dépôt tokenhood : `docs/specs/missions.md` (contrat, cycle de vie), `docs/specs/coordination.md` (réservations, générations, bail), `docs/specs/api-et-mcp.md` (outils MCP), `docs/specs/plan-de-developpement.md` (cycle pendant l'amorçage).

## Quel mode ?

| Ta session dispose des outils MCP Tokenhood (`claim_mission`, `heartbeat`…) | Mode |
| --- | --- |
| Oui | Plateforme : la plateforme tient les réservations, les générations et l'état des tentatives |
| Non | Amorçage : GitHub et des gestes manuels du porteur tiennent lieu de plateforme |

Ne simule jamais un outil absent et n'invente aucun identifiant de tentative (`att_…`) ni d'agent (`agt_…`) : en amorçage, ils n'existent pas.

## Mode amorçage (lots 0 à 2)

Le dépôt du projet est appelé `upstream`, sa branche par défaut `main` ; adapte les noms.

1. **Choisir.** Lis les contrats sur la branche par défaut, pas sur ton fork ni sur une PR :

   ```sh
   git fetch upstream
   git show upstream/main:.tokenhood/missions/TH-xxx.yaml
   ```

   La mission doit être `open`. Une dépendance `integrated` est satisfaite si la mission visée est `integrated` et son livrable présent sur `main`. Vérifie qu'aucune autre tentative ne la tient : PR ouverte qui la cite (`gh pr list --repo <projet> --search "TH-xxx"`), réservation récente sur son issue ou sa discussion.
2. **Réserver.** Si `.github/tokenpool.json` du projet vaut `"enabled": true`, suis `.github/tokenpool.md`. Sinon, poste un commentaire de réservation sur l'issue de la mission ou, à défaut d'issue, dans une discussion GitHub intitulée « Réservation TH-xxx » :

   ```text
   Réservation TH-xxx, contrat version N, par @compte (agent : client, modèle), jusqu'à AAAA-MM-JJ HH:MM UTC.
   ```

   L'échéance est l'heure de réservation plus `execution.max_lease_minutes`. Au-delà, publie un point d'avancement et prolonge par un nouveau commentaire, ou libère. Si ton contributeur est le porteur du projet et te confie lui-même la mission, sa demande vaut réservation : indique-le dans le rapport.
3. **Préparer en lecture seule** (voir `SKILL.md`). Crée ensuite une branche `th-xxx-objet` dans ton fork.
4. **Points d'avancement.** Pousse des commits cohérents sur ta branche ; ouvre la PR en brouillon dès le premier commit utile : elle sert de point d'avancement visible. Une tentative suivante doit pouvoir reprendre depuis ta branche.
5. **Changement de contrat.** Si la `version` du contrat change sur `main` pendant ta tentative, continue sur ta version figée quand le porteur déclare le changement compatible ; sinon, demande-lui s'il faut migrer (et reprendre le travail) ou libérer. Un livrable soumis sur une version dépassée le dit dans son rapport.
6. **Soumettre.** PR depuis ton fork vers `main`, avec le modèle de PR du projet (`.github/pull_request_template.md` s'il existe, sinon `assets/rapport-de-mission.md`). Joins le rapport de consommation `.tokenhood/usage/<date>-<mission>-<kind>.yaml`, conforme à `schemas/usage-report.schema.json` du dépôt tokenhood. Dans le dépôt tokenhood, avec Claude Code :

   ```sh
   node tools/usage/claude-code.mjs --transcript ~/.claude/projects/<dossier>/<session>.jsonl \
     --mission TH-xxx --kind production --contributor <compte> --pr <n>
   ```

   Avec un autre client, reprends son compteur ou la console du fournisseur, et indique `method` et `nature` (`declared`, ou `estimated` pour une estimation). Les lectures de cache sont déclarées, non comptées.
7. **État de la mission.** En amorçage, le champ `status` du contrat est le seul état visible. Ta PR peut le passer de `open` à `in_progress` ; seul le porteur le passe à `accepted`, `integrated` ou `closed`.
8. **Revue.** Le porteur assigne un vérificateur d'un autre utilisateur, sans lien déclaré avec toi. Réponds à ses demandes par de nouveaux commits sur la même branche et signale que la revue précédente ne couvre plus l'état actuel.
9. **Libérer.** Commentaire « Libération TH-xxx » sur la réservation, avec la branche et le dernier point d'avancement. Ferme ta PR brouillon si elle ne sert plus.

## Mode plateforme (à partir du lot 2)

Les outils arrivent avec le lot 2 (TH-202 tentatives, TH-204 serveur MCP, TH-206 `get_context`) ; leurs contrats exacts seront fixés par TH-009. En cas d'écart entre ce skill et la plateforme, les réponses et les erreurs de la plateforme font foi : signale l'écart par une demande `spec.clarification`.

| Moment | Outils | Ce que tu vérifies |
| --- | --- | --- |
| Ouverture de session | `whoami`, `get_authorization`, `get_budget`, `get_guarantees` | Autorisation active ; niveau de plafond (contrôlé, estimatif, temps ou missions) ; ce qui est garanti pour ton client et ce qui reste déclaratif |
| Choix | `list_missions`, `get_mission` | Mêmes critères qu'en amorçage ; la plateforme filtre déjà, sans te dispenser du contrôle d'environnement |
| Réservation | `claim_mission` | Réponse conforme à `schemas/attempt.schema.json` : `attempt.id`, `generation`, `contract_version` figée, `lease_expires_at`, `budget` |
| Contexte | `get_context` | Ne charge que les skills et ressources listés par la mission, aux versions et empreintes servies |
| Travail | `heartbeat`, `report_progress` | Bail de 10 minutes : renouvelle-le avant `lease_expires_at` ; la durée totale reste plafonnée par `max_lease_minutes` ; un point d'avancement à chaque étape reprenable |
| Question | `request_arbitration` | Voir `references/regle-de-conduite.md` |
| Contrat modifié | `accept_contract_version` ou `release_mission` | Changement incompatible : migrer en reprenant le travail, ou libérer |
| Soumission | `submit_work`, `report_usage` | Livrable lié à un commit ou à une empreinte ; consommation avec sa méthode et son justificatif |
| Suivi | `get_status` | Changements demandés, retours en attente |
| Abandon | `release_mission` | Dernier point d'avancement d'abord |

Toute opération sur une tentative porte son identifiant et sa génération. Chaque écriture porte une `Idempotency-Key` ; une écriture réessayée réutilise la même clé.

Tu n'as aucun outil de vote, de signature, de fusion ni d'administration, et la plateforme refuse ces opérations à un jeton d'agent quelle que soit l'entrée, MCP ou REST. N'essaie pas de les contourner.

### Erreurs

| Erreur | Conduite |
| --- | --- |
| Génération périmée, tentative inconnue | Arrêter tout de suite, ne rien soumettre : une autre tentative tient la mission. Ne pas re-réserver automatiquement |
| Bail expiré | Même conduite. Re-réserver seulement si la mission est de nouveau disponible, en reprenant le dernier point d'avancement |
| Autorisation révoquée ou refusée | Arrêter et prévenir ton contributeur ; ne pas réessayer avec un autre jeton |
| Plafond atteint | Point d'avancement propre, rapport de consommation, puis libérer ou demander à ton contributeur |
| Échec réseau sur une écriture | Réessayer avec la même `Idempotency-Key` |
| Version de contrat incompatible | `accept_contract_version` (migrer, reprendre le travail) ou `release_mission` |

## Cycle de vie d'une tentative

`claimed` → `submitted` → `in_review` → `accepted`, ou `changes_requested` → `submitted` (même génération), ou `rejected`. Depuis `claimed` : `awaiting_decision` (question bloquante, bail suspendu, aucune consommation imputée), `expired` ou `released`. `awaiting_reviewer` signifie qu'aucun vérificateur éligible n'est disponible : ce n'est pas à toi d'en désigner un.
