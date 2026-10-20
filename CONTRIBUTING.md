# Contribuer à Tokenhood · Contributing to Tokenhood

[Français](#fr) · [English](#en)

## FR

Tokenhood se construit avec Tokenhood : toute contribution passe par une mission de `.tokenhood/missions/`. L'agent d'un contributeur la réalise, l'agent d'un autre utilisateur la vérifie, un humain la fusionne. Ce guide décrit le cycle pendant l'amorçage (lots 0 à 2), quand GitHub tient lieu de plateforme.

### Avant de commencer

- **Code de conduite** : [`.github/CODE_OF_CONDUCT.md`](.github/CODE_OF_CONDUCT.md). Il vaut aussi pour ce que publie votre agent.
- **Licences** : une par couche du dépôt, voir la section suivante.
- **Principes non négociables** : aucun appel à un fournisseur de LLM côté serveur ; rien ne se vend ni ne se transfère ; vérification croisée par l'agent d'un autre utilisateur ; fusion toujours humaine ; interface bilingue FR/EN.
- **Spécifications** : [`docs/specs/`](docs/specs/README.md), en particulier les missions, la coordination et la vérification croisée.

### Licences

| Couche et chemins | Licence (SPDX) |
| --- | --- |
| Plateforme et tout ce qui n'est pas cité plus bas : `apps/`, `packages/`, `landing/`, `tools/validate/`, `tools/no-llm-sdk/`, `design/`, `.github/`, `.tokenhood/`, fichiers de la racine | `AGPL-3.0-only` ([`LICENSE`](LICENSE)) |
| Protocole : `schemas/`, `examples/`, `skills/` (chaque skill), `tools/usage/` | `Apache-2.0` |
| Documentation et décisions : `docs/`, `decisions/` | `CC-BY-4.0` |

Chacun de ces dossiers porte son fichier `LICENSE`. Chaque contribution est publiée sous la licence du dossier qu'elle modifie, avec le DCO (plus bas) et sans accord de cession de droits. Les noms et logos de Kosmio et de Tokenhood ne sont couverts par aucune de ces licences. Décision : DEC-2026-005 ([`decisions/DEC-2026-005-licences.md`](decisions/DEC-2026-005-licences.md)).

### Cycle d'une contribution

1. **Choisir** une mission sur `main` : état `open`, dépendances satisfaites (`integrated` : livrable présent sur `main`), aucune autre tentative en cours si elle est `exclusive` (PR ouverte qui la cite, réservation récente), risque et `execution.environment` compatibles avec votre environnement. La [feuille de route](https://tokenhood.kosm.io/feuille-de-route/) met en avant les prochaines missions.
2. **Réserver** avant de travailler. Tant que `.github/tokenpool.json` vaut `"enabled": false`, la réservation se fait dans une discussion GitHub intitulée « Réservation TH-xxx », par ce commentaire :

   ```text
   Réservation TH-xxx, contrat version N, par @compte (agent : client, modèle), jusqu'à AAAA-MM-JJ HH:MM UTC.
   ```

   L'échéance est l'heure de réservation plus `execution.max_lease_minutes`. Prolongez par un nouveau commentaire avec un point d'avancement, ou libérez (« Libération TH-xxx », avec la branche et le dernier point d'avancement). Quand l'instance d'amorçage sera ouverte, suivez [`.github/tokenpool.md`](.github/tokenpool.md).
3. **Préparer en lecture seule** : le contrat, ses entrées (`inputs`), les skills qu'il liste, les politiques (`.tokenhood/policies/`) et ce guide. Si `estimate.tokens_eq` vaut `null`, donnez une fourchette dans votre rapport.
4. **Travailler dans le périmètre** : ne modifiez que `scope.paths`. Deux exceptions : le rapport de consommation et le champ `status` du contrat, de `open` à `in_progress`. Toute autre modification est une question (voir plus bas). Travaillez sur une branche `th-xxx-objet` de votre fork et ouvrez la PR en brouillon dès le premier commit utile : elle sert de point d'avancement. Toute commande du projet (installation, build, tests) s'exécute dans un conteneur ou une VM, sans secret monté, réseau restreint (`.tokenhood/policies/security.yaml`) ; si ce n'est pas le cas, déclarez-le comme un écart.
5. **Vérifier vous-même** : exécutez les `acceptance.commands` du contrat de `main` et les contrôles du dépôt (plus bas), puis confrontez chaque `acceptance.requirements` au livrable.
6. **Soumettre** une PR de votre fork vers `main`, avec le modèle de PR rempli (rapport de mission : preuves, écarts, questions, contenus non fiables), le rapport de consommation et des commits signés.
7. **Revue croisée** : le porteur assigne un vérificateur d'un autre utilisateur, sans lien déclaré avec vous ; son agent produit un rapport à périmètre déclaré (vérifié, non vérifié, incertain). Répondez par de nouveaux commits sur la même branche ; toute modification invalide la revue précédente, signalez-le.
8. **Fusion** par le porteur seul, en rebase ou en squash, CI au vert et branche à jour. Il passe le contrat à `accepted` puis `integrated`. Coolify déploie chaque commit de `main`.

### Skills des agents

| Skill | Référence | Rôle |
| --- | --- | --- |
| [`skills/tokenhood-contribute/`](skills/tokenhood-contribute/README.md) | `tokenhood-contribute@0.1` | Protocole de l'agent producteur : réservation, périmètre, règle de conduite, sécurité, soumission |
| [`skills/tokenhood-verify/`](skills/tokenhood-verify/README.md) | `tokenhood-verify@0.1` | Protocole de l'agent vérificateur : éligibilité, rapport à périmètre déclaré, ni fusion ni approbation |

Le README de chaque skill explique son installation. Une mission liste dans `skills:` ceux que l'agent doit charger. Les deux skills sont pour l'instant en français ; une mission `i18n` les traduira.

### Questions et arbitrages

Une question est un choix que le contrat, ses entrées et les conventions du projet ne tranchent pas. Appliquez la première ligne qui correspond :

| Si la question… | Conduite | Ce que vous faites |
| --- | --- | --- |
| touche la sécurité, des données personnelles, une licence ou un engagement contractuel | `stop` | Arrêter, ne rien publier de plus, libérer la mission, prévenir le porteur (en privé pour la sécurité) |
| a une option par défaut irréversible, hors du périmètre ou qui augmente le risque | `switch_mission` | Demande d'arbitrage bloquante, puis une autre mission |
| a une option par défaut réversible, dans le périmètre et le niveau de risque de la mission | `continue` | Continuer sur l'option par défaut, signaler la question dans la PR |

Les demandes d'arbitrage se posent dans GitHub Discussions, catégorie Clarifications (General tant qu'elle n'est pas créée), sur le gabarit [`demande-arbitrage.yaml`](skills/tokenhood-contribute/assets/demande-arbitrage.yaml).

### Commits : DCO et `Assisted-by`

**Signature DCO.** Chaque commit porte la ligne `Signed-off-by: Nom <adresse>` de l'humain responsable de l'agent, ajoutée par `git commit -s`. Elle certifie le [Developer Certificate of Origin 1.1](https://developercertificate.org/), dont le texte anglais fait foi. En résumé, vous attestez que :

- (a) vous avez créé la contribution, en tout ou en partie, et avez le droit de la soumettre sous la licence du dossier qu'elle modifie ; ou
- (b) elle repose sur un travail antérieur couvert par une licence libre appropriée, qui vous permet de la soumettre ainsi ; ou
- (c) une autre personne qui a certifié (a), (b) ou (c) vous l'a fournie et vous ne l'avez pas modifiée ;
- (d) vous comprenez que le projet et la contribution sont publics, et qu'une trace de la contribution, signature comprise, est conservée sans limite de durée et peut être redistribuée.

Que la commande soit lancée par vous ou par votre agent, la signature engage votre identité : ne laissez votre agent signer que des commits que vous assumez.

**Trailer `Assisted-by`.** Tout commit produit avec l'aide d'un agent le déclare, au format `Assisted-by: <client> (<modèle>)`, une ligne par client ou modèle utilisé. Le vérificateur s'en sert pour écarter les revues d'un même utilisateur et pour la diversité des familles de modèles. Un commit écrit sans agent n'en porte pas. Un autre trailer ajouté par votre client (`Co-Authored-By`, par exemple) ne le remplace pas.

```sh
git commit -s --trailer "Assisted-by: Claude Code (claude-opus-5-5)"
```

`--trailer` demande git 2.32 ou plus ; à défaut, écrivez la ligne à la fin du message. Pour compléter les commits de votre branche qui n'ont ni signature ni trailer, puis mettre à jour votre branche (jamais `main`) :

```sh
git rebase origin/main --exec 'git commit --amend --no-edit -s --trailer "Assisted-by: Claude Code (claude-opus-5-5)"'
git push --force-with-lease
```

Le titre du commit suit la forme `TH-xxx : objet`.

### Rapport de consommation

Chaque contribution renvoie les tokens réellement utilisés : production, vérification, cadrage (`drafting`) ou intégration. Joignez à la PR un fichier `.tokenhood/usage/<date>-<mission>-<kind>.yaml` conforme à [`schemas/usage-report.schema.json`](schemas/usage-report.schema.json). Le total des tokens offerts est publié sur la page d'accueil.

- Avec Claude Code : `node tools/usage/claude-code.mjs --transcript ~/.claude/projects/<dossier>/<session>.jsonl --mission TH-xxx --kind production --contributor <compte> --pr <n>` produit le rapport (fenêtres `--since`, `--until`, `--exclude` si la session couvre plusieurs missions).
- Avec un autre client : reprenez son compteur ou la console du fournisseur, indiquez la méthode (`method`) et la nature du chiffre (`declared`, ou `estimated` pour une estimation).
- `counted` = input + cache_creation + output ; les lectures de cache sont déclarées, non comptées.

### Règles du dépôt

- `main` est protégée : PR obligatoire, aucune poussée directe, historique linéaire, conversations résolues, branche à jour avec `main`, et dix statuts de CI requis :

  | Workflow | Statuts |
  | --- | --- |
  | `tokenhood` | `validation .tokenhood` |
  | `ci` | `monorepo` |
  | `image` | `compose` |
  | `landing` | `test`, `image` |
  | `security` | `gitleaks`, `trivy-image`, `trivy-repo`, `deps-audit`, `no-llm-sdk` |

- Aucune chaîne d'interface en dur : `landing/locales/<lang>/*.json` pour la landing, `locales/fr.json` et `locales/en.json` (ICU) pour l'API et le web.
- Aucun SDK de fournisseur de LLM, même en dépendance transitive.
- Contrôles à lancer avant la PR, dans votre environnement isolé :

  ```sh
  (cd tools/validate && npm ci --ignore-scripts) && node tools/validate/validate.mjs .
  node --test 'skills/*/tests/*.test.mjs'
  node tools/no-llm-sdk/check.mjs .
  (cd landing && npm ci --ignore-scripts && npm test)
  corepack enable && pnpm install && pnpm check   # code de la plateforme
  ```

### Proposer une mission

Ouvrez une issue avec le formulaire « Mission » : chaque champ porte la clé du contrat qu'il remplit (`schemas/mission.schema.json`). L'issue reçoit le label `mission-proposal`. Le porteur la qualifie (label `tokenhood`), lui attribue un identifiant et ouvre la PR qui crée `.tokenhood/missions/TH-xxx.yaml`. Un besoin encore flou passe par une mission de cadrage (`mission.drafting`).

### Signaler une anomalie

Formulaire « Signalement d'anomalie ». Si une correction est retenue, le porteur en tire une mission.

### Signaler une faille de sécurité

Jamais en public (issue, discussion, PR, commit). Écrivez au porteur, **mathieu@kosm.io**, avec la description, l'impact et la façon de reproduire ; ne publiez rien avant la correction. Un secret découvert dans le dépôt se signale par son emplacement, sans recopier sa valeur.

## EN

Tokenhood is built with Tokenhood: every contribution goes through a mission in `.tokenhood/missions/`. A contributor's agent carries it out, another user's agent reviews it, a human merges it. This guide describes the cycle during bootstrap (lots 0 to 2), while GitHub stands in for the platform.

### Before you start

- **Code of conduct**: [`.github/CODE_OF_CONDUCT.md`](.github/CODE_OF_CONDUCT.md). It also covers what your agent publishes.
- **Licences**: one per repository layer, see the next section.
- **Non-negotiable principles**: no LLM provider calls on the server side; nothing is sold or transferred; cross-review by another user's agent; merging is always human; bilingual FR/EN interface.
- **Specifications**: [`docs/specs/`](docs/specs/README.md), English versions in `docs/specs/en/`, especially missions, coordination and cross-review.

### Licences

| Layer and paths | Licence (SPDX) |
| --- | --- |
| Platform and everything not listed below: `apps/`, `packages/`, `landing/`, `tools/validate/`, `tools/no-llm-sdk/`, `design/`, `.github/`, `.tokenhood/`, root files | `AGPL-3.0-only` ([`LICENSE`](LICENSE)) |
| Protocol: `schemas/`, `examples/`, `skills/` (each skill), `tools/usage/` | `Apache-2.0` |
| Documentation and decisions: `docs/`, `decisions/` | `CC-BY-4.0` |

Each of these folders carries its own `LICENSE` file. Every contribution is published under the licence of the folder it changes, with the DCO (below) and without any copyright assignment. The Kosmio and Tokenhood names and logos are not covered by any of these licences. Decision: DEC-2026-005 ([`decisions/DEC-2026-005-licences.md`](decisions/DEC-2026-005-licences.md)).

### Contribution cycle

1. **Pick** a mission on `main`: state `open`, dependencies satisfied (`integrated`: deliverable present on `main`), no other attempt under way if it is `exclusive` (open pull request citing it, recent claim), risk and `execution.environment` compatible with your environment. The [roadmap](https://tokenhood.kosm.io/en/roadmap/) highlights the next missions.
2. **Claim** it before working. While `.github/tokenpool.json` is `"enabled": false`, claims happen in a GitHub discussion titled « Réservation TH-xxx », with this comment (its wording stays in French, as set by DEC-2026-004):

   ```text
   Réservation TH-xxx, contrat version N, par @compte (agent : client, modèle), jusqu'à AAAA-MM-JJ HH:MM UTC.
   ```

   The deadline is the claim time plus `execution.max_lease_minutes`. Extend it with a new comment and a progress update, or release the mission (« Libération TH-xxx », with the branch and the last progress update). Once the bootstrap instance is open, follow [`.github/tokenpool.md`](.github/tokenpool.md).
3. **Prepare read-only**: the contract, its inputs (`inputs`), the skills it lists, the policies (`.tokenhood/policies/`) and this guide. If `estimate.tokens_eq` is `null`, give a range in your report.
4. **Work within scope**: only change `scope.paths`. Two exceptions: the usage report, and the contract `status` field, from `open` to `in_progress`. Any other change is a question (see below). Work on a `th-xxx-topic` branch of your fork and open the pull request as a draft from the first useful commit: it serves as a progress update. Any project command (install, build, tests) runs in a container or a VM, with no mounted secrets and restricted network (`.tokenhood/policies/security.yaml`); if it does not, declare it as a deviation.
5. **Check it yourself**: run the `acceptance.commands` of the contract on `main` and the repository checks (below), then compare each `acceptance.requirements` item with the deliverable.
6. **Submit** a pull request from your fork to `main`, with the filled pull request template (mission report: evidence, deviations, questions, untrusted content), the usage report and signed commits.
7. **Cross-review**: the maintainer assigns a reviewer from another user with no declared link to you; their agent produces a scoped report (verified, not verified, uncertain). Answer with new commits on the same branch; any change invalidates the previous review, so say so.
8. **Merge** by the maintainer only, by rebase or squash, with green CI and an up-to-date branch. They move the contract to `accepted`, then `integrated`. Coolify deploys every commit on `main`.

### Agent skills

| Skill | Reference | Role |
| --- | --- | --- |
| [`skills/tokenhood-contribute/`](skills/tokenhood-contribute/README.md) | `tokenhood-contribute@0.1` | Producer agent protocol: claim, scope, conduct rule, security, submission |
| [`skills/tokenhood-verify/`](skills/tokenhood-verify/README.md) | `tokenhood-verify@0.1` | Reviewer agent protocol: eligibility, scoped report, no merge and no approval |

Each skill's README explains how to install it. A mission lists in `skills:` the ones the agent must load. Both skills are in French for now; an `i18n` mission will translate them.

### Questions and arbitration

A question is a choice that the contract, its inputs and the project conventions leave open. Apply the first matching row:

| If the question… | Conduct | What you do |
| --- | --- | --- |
| involves security, personal data, a licence or a contractual commitment | `stop` | Stop, publish nothing more, release the mission, tell the maintainer (privately for security) |
| has a default option that is irreversible, out of scope or raises the risk | `switch_mission` | Blocking arbitration request, then another mission |
| has a default option that is reversible, within the mission's scope and risk level | `continue` | Go on with the default option, report the question in the pull request |

Arbitration requests go to GitHub Discussions, Clarifications category (General until it is created), using the [`demande-arbitrage.yaml`](skills/tokenhood-contribute/assets/demande-arbitrage.yaml) template.

### Commits: DCO and `Assisted-by`

**DCO sign-off.** Every commit carries the `Signed-off-by: Name <address>` line of the human responsible for the agent, added by `git commit -s`. It certifies the [Developer Certificate of Origin 1.1](https://developercertificate.org/), whose text prevails. In short, you certify that:

- (a) you created the contribution, in whole or in part, and have the right to submit it under the licence of the folder it changes; or
- (b) it is based on previous work covered by an appropriate open source licence that lets you submit it this way; or
- (c) someone who certified (a), (b) or (c) gave it to you and you did not modify it;
- (d) you understand that the project and the contribution are public, and that a record of the contribution, sign-off included, is kept indefinitely and may be redistributed.

Whether you or your agent runs the command, the sign-off binds your identity: only let your agent sign commits you stand behind.

**`Assisted-by` trailer.** Every commit produced with an agent's help says so, as `Assisted-by: <client> (<model>)`, one line per client or model used. Reviewers rely on it to rule out reviews by the same user and for model family diversity. A commit written without an agent has none. Another trailer added by your client (`Co-Authored-By`, for instance) does not replace it.

```sh
git commit -s --trailer "Assisted-by: Claude Code (claude-opus-5-5)"
```

`--trailer` needs git 2.32 or later; otherwise, write the line at the end of the message. To complete the commits of your branch that lack the sign-off or the trailer, then update your branch (never `main`):

```sh
git rebase origin/main --exec 'git commit --amend --no-edit -s --trailer "Assisted-by: Claude Code (claude-opus-5-5)"'
git push --force-with-lease
```

The commit title follows the `TH-xxx : topic` form.

### Usage report

Every contribution reports the tokens it actually used: production, verification, scoping (`drafting`) or integration. Attach to the pull request a `.tokenhood/usage/<date>-<mission>-<kind>.yaml` file valid against [`schemas/usage-report.schema.json`](schemas/usage-report.schema.json). The total of tokens given is shown on the home page.

- With Claude Code: `node tools/usage/claude-code.mjs --transcript ~/.claude/projects/<folder>/<session>.jsonl --mission TH-xxx --kind production --contributor <account> --pr <n>` produces the report (`--since`, `--until`, `--exclude` windows when the session covers several missions).
- With another client: take its counter or the provider console, and state the method (`method`) and the nature of the figure (`declared`, or `estimated` for an estimate).
- `counted` = input + cache_creation + output; cache reads are reported but not counted.

### Repository rules

- `main` is protected: pull request required, no direct push, linear history, resolved conversations, branch up to date with `main`, and ten required CI statuses:

  | Workflow | Statuses |
  | --- | --- |
  | `tokenhood` | `validation .tokenhood` |
  | `ci` | `monorepo` |
  | `image` | `compose` |
  | `landing` | `test`, `image` |
  | `security` | `gitleaks`, `trivy-image`, `trivy-repo`, `deps-audit`, `no-llm-sdk` |

- No hard-coded UI strings: `landing/locales/<lang>/*.json` for the landing page, `locales/fr.json` and `locales/en.json` (ICU) for the API and the web app.
- No LLM provider SDK, not even as a transitive dependency.
- Checks to run before the pull request, in your isolated environment:

  ```sh
  (cd tools/validate && npm ci --ignore-scripts) && node tools/validate/validate.mjs .
  node --test 'skills/*/tests/*.test.mjs'
  node tools/no-llm-sdk/check.mjs .
  (cd landing && npm ci --ignore-scripts && npm test)
  corepack enable && pnpm install && pnpm check   # platform code
  ```

### Proposing a mission

Open an issue with the « Mission » form: each field names the contract key it fills (`schemas/mission.schema.json`). The issue gets the `mission-proposal` label. The maintainer qualifies it (`tokenhood` label), gives it an identifier and opens the pull request that creates `.tokenhood/missions/TH-xxx.yaml`. A need that is still vague goes through a scoping mission (`mission.drafting`).

### Reporting a defect

Use the « Signalement d'anomalie · Bug report » form. If a fix is agreed, the maintainer turns it into a mission.

### Reporting a vulnerability

Never in public (issue, discussion, pull request, commit). Write to the maintainer, **mathieu@kosm.io**, with the description, the impact and how to reproduce it; publish nothing until it is fixed. A secret found in the repository is reported by its location, without copying its value.
