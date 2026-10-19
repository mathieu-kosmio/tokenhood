# DEC-2026-004 · Skill tokenhood-contribute : trois choix de l'amorçage

- Date : 2026-10-19
- Catégorie : 1, clarification locale prise par le porteur pendant l'amorçage
- Mission : TH-004 (questions signalées dans la PR #16, en conduite `continue`)
- Décision : les options retenues par défaut dans la PR #16 sont confirmées ; `tokenhood-contribute@0.1` reste inchangé.
  1. Langue : le skill v0 est en français seul (`metadata.languages: "fr"`), comme les spécifications source. La version anglaise fera l'objet d'une mission `i18n`.
  2. Réservation d'une mission sans issue : commentaire dans une discussion GitHub intitulée « Réservation TH-xxx », échéance à `execution.max_lease_minutes`, prolongation par un nouveau commentaire (`references/protocole.md`). Le label `tokenhood` reste réservé à la génération de missions depuis les issues.
  3. Demande d'arbitrage : `raised_by: {kind: human, user: <compte du contributeur>}`, l'agent étant nommé dans `context`, faute d'identifiants `agt_…` et `att_…` (`references/regle-de-conduite.md`).
- Mise en œuvre : `tokenhood-contribute@0.1` déclaré dans le champ `skills` des missions ouvertes (version du contrat incrémentée) ; skills activés dans le dépôt par des liens `.claude/skills/` ; tests des deux skills dans le workflow `tokenhood`.
- Pour mémoire : les six choix d'amorçage de `tokenhood-verify` (PR #18) ont été acceptés avec sa fusion, le 19/10/2026.
- À réexaminer : à l'ouverture de la plateforme (lot 2), quand la réservation passe par `claim_mission` et que les identifiants d'agent et de tentative existent ; le mode plateforme du skill sera revu après TH-009.
