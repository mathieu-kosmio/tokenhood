# Contribuer à Tokenhood · Contributing

## FR

Pendant l'amorçage (lots 0 à 2), le cycle d'une contribution est le suivant :

1. Choisir une mission ouverte dans `.tokenhood/missions/` (état `open`, dépendances satisfaites).
2. La réserver via l'instance tokenpool d'amorçage (ou, à défaut, en commentant l'issue de la mission).
3. Faire travailler votre agent avec votre client officiel (Claude Code, Codex CLI, etc.), dans un conteneur si la mission exécute du code.
4. Ouvrir une PR depuis votre fork, avec le rapport de mission, les preuves (commandes exécutées, résultats) et le **rapport de consommation** : un fichier `.tokenhood/usage/<date>-<mission>-<kind>.yaml` qui déclare les tokens réellement utilisés (voir ci-dessous).
5. Le porteur assigne un vérificateur d'un autre utilisateur, sans lien déclaré avec vous. Son agent produit un rapport de vérification à périmètre déclaré.
6. Le porteur approuve et fusionne. Le déploiement sur Coolify est automatique à chaque commit sur `main`.

Règles :

- Aucune poussée directe sur `main`.
- Chaque commit est signé DCO (`git commit -s`) par l'humain responsable de l'agent, avec le trailer `Assisted-by: <client/modèle>`.
- Aucune chaîne d'interface en dur : tout passe par `locales/fr` et `locales/en`.
- Aucun appel à un fournisseur de LLM côté serveur.
- Une question bloquante se pose dans GitHub Discussions (catégorie Clarifications) ; voir la règle de conduite des agents dans les spécifications.
- **Chaque contribution renvoie le nombre de tokens utilisés** (production, vérification, cadrage, intégration), dans un rapport conforme à `schemas/usage-report.schema.json`. Le total des tokens offerts est publié sur la page d'accueil. Avec Claude Code, `node tools/usage/claude-code.mjs --transcript <session.jsonl> --mission TH-xxx --contributor <compte> --pr <n>` produit le rapport ; avec un autre client, reprenez le compteur du client ou la console du fournisseur (`method`) et indiquez la nature du chiffre (`declared` ou `estimated`). Les lectures de cache sont déclarées mais pas comptées.

## EN

During bootstrap (lots 0 to 2): pick an open mission in `.tokenhood/missions/`, claim it via the bootstrap tokenpool instance (or by commenting on the mission issue), run your agent with your official client, open a PR from your fork with the mission report and evidence. The maintainer assigns a reviewer from another user with no declared link to you; their agent produces a scoped review report. The maintainer approves and merges; Coolify deploys every commit on `main`.

Rules: no direct push to `main`; DCO sign-off (`git commit -s`) by the human responsible for the agent plus an `Assisted-by:` trailer; no hard-coded UI strings; no LLM provider calls on the server side; blocking questions go to GitHub Discussions (Clarifications). **Every contribution reports the tokens it used** in `.tokenhood/usage/<date>-<mission>-<kind>.yaml` (`schemas/usage-report.schema.json`); with Claude Code, `tools/usage/claude-code.mjs` produces it. Cache reads are reported but not counted; the total of tokens given is shown on the home page.
