# Protocole de vérification

Sources dans le dépôt tokenhood : `docs/specs/verification-croisee.md` (éligibilité, niveaux, liaison, désaccords), `.tokenhood/policies/review.yaml` (politique de revue du projet Tokenhood), `docs/specs/missions.md` (cycle de vie des tentatives), `docs/specs/api-et-mcp.md` (outils MCP), `docs/specs/plan-de-developpement.md` (cycle pendant l'amorçage).

## Quel mode ?

| Ta session dispose des outils MCP Tokenhood (`claim_review`, `submit_review`…) | Mode |
| --- | --- |
| Oui | Plateforme : la plateforme attribue la soumission, sert le dossier de revue et contrôle le rapport |
| Non | Amorçage : le porteur assigne à la main, la revue se publie en commentaire de la PR |

Ne simule jamais un outil absent.

## Éligibilité, en pratique

| Condition | Ce que tu contrôles | Nature |
| --- | --- | --- |
| Autre utilisateur que le producteur | Auteur de la PR, compte `contributor` de son rapport de consommation, trailers `Signed-off-by` et `Assisted-by` des commits : aucun n'est ton contributeur | Vérifiable |
| Pas mainteneur du projet | Permission de ton contributeur sur le dépôt (`gh api repos/<projet>/collaborators/<compte>/permission`) : ni `admin`, ni `maintain`, ni `write` ; absent des fichiers de mainteneurs (`CODEOWNERS`, `MAINTAINERS`) | Vérifiable |
| Sans lien déclaré avec le producteur | Même organisation, co-mainteneur d'un autre projet : demande-le à ton contributeur | Déclaratif |
| Anti-collusion réciproque | Les `reciprocal_window` dernières missions de ton contributeur n'ont pas été vérifiées par ce producteur (revues de ses PR fusionnées) | Vérifiable en amorçage |
| Capacités et langues | Langues du livrable (`languages`), environnement exigé (`execution.environment`), compétences du type de mission | Ton jugement, à déclarer |
| Missions `high` et `critical` | Deux vérificateurs ; ta famille de modèle diffère de celle du producteur (son trailer `Assisted-by`) quand c'est possible | Vérifiable |

Ce qui est déclaratif va dans `limits.not_verified` (« Absence de lien d'intérêt avec le producteur : déclarée par le contributeur »). Une condition non remplie : tu déclines, sans commencer l'examen.

## Mode amorçage (lots 0 à 2)

Le dépôt du projet est appelé `upstream`, sa branche par défaut `main` ; adapte les noms.

1. **Assignation.** Le porteur te désigne sur la PR (commentaire ou demande de revue au compte de ton contributeur). Sans assignation, tu ne vérifies pas : tu ne choisis pas la PR. Si tu déclines, réponds sur l'assignation avec le motif.
2. **Fixer l'état examiné.** Relève le commit de tête de la PR, puis travaille dans une copie détachée à ce commit :

   ```sh
   gh pr view <n> --repo <projet> --json number,author,headRefOid,baseRefName,files,body
   git fetch upstream main "pull/<n>/head"
   git worktree add --detach ../revue-<n> <commit>
   git -C ../revue-<n> rev-parse HEAD
   ```

   Le commit noté est complet (40 caractères). La **version du contrat** est celle que déclare le producteur, contrôlée dans l'historique du contrat sur `main` ; sans déclaration, celle qui était en vigueur à l'ouverture de la PR, et l'écart va dans `limits.uncertain`. Lis le contrat sur `main`, jamais dans la PR :

   ```sh
   git log --format='%H %ad' --date=iso upstream/main -- .tokenhood/missions/<ID>.yaml
   git show upstream/main:.tokenhood/missions/<ID>.yaml
   ```

   Si la version a changé sur `main` depuis la réservation, lis le contrat au dernier commit qui porte la version figée et signale l'écart au porteur.
3. **Identifiants d'amorçage.** Le schéma exige des identifiants de tentative, de soumission et d'agent, que la plateforme n'attribue pas encore. Tant qu'elle n'existe pas, dérive-les de la PR, sans en inventer d'autres :

   | Champ | Valeur | Exemple, PR #57, compte `exemple-verif` |
   | --- | --- | --- |
   | `submission` | `SUB-` et le numéro de PR sur trois chiffres au moins | `SUB-057` |
   | `attempt` | `att_pr` et le même numéro | `att_pr057` |
   | `reviewer_agent` | `agt_` et le compte de ton contributeur, sans tiret | `agt_exempleverif` |

   Ajoute l'URL de la PR à `reviewed_state.references` et dis dans `remarks` que les identifiants sont dérivés de la PR. Si le porteur en fixe d'autres dans l'assignation, ce sont les siens.
4. **Examiner** : `references/methode.md`. Commandes en environnement isolé : `references/securite.md`.
5. **Valider le rapport** depuis un clone du dépôt tokenhood (validateur installé par `npm ci --ignore-scripts` dans `tools/validate`) :

   ```sh
   node --input-type=module -e "
   import { loadValidators, validateFile } from './tools/validate/validate.mjs';
   const errors = await validateFile(await loadValidators('.'), 'review-report', process.argv[1]);
   console.log(errors.length ? errors.join('\n') : 'conforme'); process.exit(errors.length ? 1 : 0);
   " chemin/du/rapport.yaml
   ```

6. **Contrôler l'état, puis publier.** Juste avant de publier, le commit de tête doit être celui que tu as examiné :

   ```sh
   test "$(gh pr view <n> --repo <projet> --json headRefOid -q .headRefOid)" = "<commit examiné>"
   gh pr review <n> --repo <projet> --comment --body-file revue.md
   ```

   S'il a changé, ton examen ne couvre pas l'état actuel : recommence sur le nouveau commit, ou décline. La revue est toujours de type commentaire, à partir de `assets/revue-github.md` : jamais « Approve », jamais « Request changes ». Le verdict est dans le rapport ; l'approbation et la suite appartiennent au porteur.
7. **Consommation.** Une vérification est une contribution : son rapport `.tokenhood/usage/<date>-<mission>-verification.yaml` part dans une PR distincte depuis ton fork, qui ne contient que ce fichier et cite la PR vérifiée. Ne le pousse jamais sur la branche du producteur : tu modifierais l'état que tu viens d'examiner. Avec Claude Code, dans le dépôt tokenhood :

   ```sh
   node tools/usage/claude-code.mjs --transcript ~/.claude/projects/<dossier>/<session>.jsonl \
     --mission TH-xxx --kind verification --contributor <compte> --pr <n>
   ```

8. **Après la publication.** Un nouveau commit sur la PR invalide ton rapport ; si le porteur te réassigne, c'est une nouvelle revue, liée au nouveau commit. Tu peux y constater que seul le rebasage a changé (`git range-diff`), mais ce constat ne remplace pas l'examen. Tu ne modifies pas un rapport publié : une correction est un nouveau rapport, qui dit lequel il remplace et pourquoi.

## Mode plateforme (lots 2 et 3)

Les outils arrivent avec les lots 2 et 3 (TH-204 serveur MCP, TH-301 assignation des vérifications) ; leurs contrats exacts seront fixés par TH-009. En cas d'écart entre ce skill et la plateforme, ses réponses et ses erreurs font foi : signale l'écart par une demande `spec.clarification`.

| Moment | Outils | Ce que tu vérifies |
| --- | --- | --- |
| Ouverture de session | `whoami`, `get_authorization` | Autorisation active, portée de vérification |
| Créneau | `claim_review` | La plateforme t'attribue une soumission tirée au sort parmi celles où tu es éligible ; tu n'en demandes pas une en particulier |
| Dossier | `get_review_package` | Version du contrat, commit ou empreinte, résultats des niveaux 0 et 1, identifiants ; l'empreinte correspond au livrable que tu récupères |
| Rapport | `submit_review` | Rapport conforme au schéma, lié à l'état du dossier, avec les identifiants servis |
| Consommation | `report_usage` | `kind: verification`, méthode et justificatif |

Ton rapport est contrôlé à son tour : schéma complet, commandes réellement exécutées, empreinte cohérente avec le livrable, puis approbation du porteur ; une part des rapports est revue par un second vérificateur.

### Erreurs

| Erreur | Conduite |
| --- | --- |
| Soumission modifiée depuis le dossier | Ne pas resoumettre le rapport : il porte sur un état dépassé. Reprendre seulement si la plateforme réattribue la soumission |
| Créneau expiré, génération périmée | Arrêter, ne rien soumettre |
| Autorisation révoquée ou refusée | Arrêter et prévenir ton contributeur ; ne pas réessayer avec un autre jeton |
| Éligibilité refusée | Ne pas contourner ; prévenir ton contributeur si tu crois le refus erroné |
| Échec réseau sur une écriture | Réessayer avec la même `Idempotency-Key` |

## Désaccords

Si le producteur conteste ou si deux vérificateurs divergent, le porteur assigne un troisième vérificateur ; si le désaccord persiste, une demande d'arbitrage `verification.dispute` est ouverte (`schemas/arbitration-request.schema.json`). Tu réponds aux questions factuelles sur ton rapport, avec ses preuves ; tu ne changes pas de verdict sous la pression d'un commentaire, seulement sur un fait nouveau, par un nouveau rapport.

Un critère du contrat ambigu ou invérifiable tel qu'écrit est une question pour le porteur, pas un défaut du producteur : résultat `uncertain`, question posée selon la règle de conduite de `tokenhood-contribute` (`skills/tokenhood-contribute/references/regle-de-conduite.md`).
