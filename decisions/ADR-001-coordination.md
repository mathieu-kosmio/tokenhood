# ADR-001 · Coordination des agents : place de tokenpool

- Type : `architecture.choice`, catégorie 2
- Instruction : TH-006, `decisions/ADR-001-dossier-options.md` (audit de tokenpool au commit `328acb9`, 19/10/2026)
- Statut : **proposée**. Adoptée par les mainteneurs compétents (le porteur pendant l'amorçage) à la fusion de la PR qui l'introduit ; la date de fusion fait foi. Recours possible en gouvernance. L'agent qui a instruit le dossier ne décide pas : les mainteneurs peuvent retenir une autre option du dossier en modifiant ce fichier avant la fusion.

## Décision proposée

Option B du dossier : **réimplémentation compatible**, avec deux ajustements tirés de l'audit.

| Point | Choix proposé |
|---|---|
| Code de tokenpool | Non repris. Aucune dépendance d'exécution à une instance tokenpool après le lot 2 |
| Module de coordination | TH-202, dans `packages/core` (TypeScript, PostgreSQL, ADR-002), conforme aux contrats de TH-009 |
| Mécanismes alignés sur tokenpool | Réservation par une seule mise à jour conditionnelle, preuve opaque remplacée à chaque réservation, bail de 600 secondes renouvelé par heartbeat, rejeu par identifiant de requête |
| Ajouts de Tokenhood | Génération entière présentée à chaque opération, durée plafonnée par `max_lease_minutes` côté serveur, `Idempotency-Key` sur toutes les écritures, points d'avancement, états de soumission et de revue, preuves stockées hachées |
| Façade compatible tokenpool | Mission distincte de taille S, après TH-202, limitée au périmètre réservation (`/v1/tasks` en lecture, `/v1/claim`, `/v1/heartbeat`, `/v1/release`, `/v1/pause`, `/v1/complete`), écrite et testée contre une version figée du protocole tokenpool (commit `328acb9`, ou version déclarée par TH-009) |
| Report possible | Si, à la porte du lot 2, aucun client tokenpool autre que la CLI de référence n'existe et que le protocole amont reste instable, la façade est reportée sans effet sur le module (option D du dossier) |
| Contributions amont | Après le MVP, au cas par cas, pour des améliorations génériques ; jamais comme condition du fonctionnement de Tokenhood |

## Options non retenues

- **A, reprise du code** : le code vise Cloudflare Workers et D1, incompatible avec ADR-002 ; le porter revient à le réécrire, sans économie et avec un suivi de provenance en plus.
- **C, tokenpool comme coordinateur** : dépendance forte à un projet d'une semaine à mainteneur unique, que `coordination.md` écarte ; deux sources d'état pour une même tentative ; hébergement hors de Coolify et de l'UE.
- **D, sans compatibilité** : reste le repli si la façade est reportée ; elle exigerait de corriger `api-et-mcp.md` et `coordination.md`.

## Conséquences

- TH-009 fixe la génération, le plafond de durée, l'idempotence et la sémantique de soumission, et tranche la place de la file préparée de tokenpool (le contrat publié peut tenir lieu de proposition préparée).
- TH-202 reste dépendante de TH-201 et de cette décision ; « compatibles tokenpool » s'y entend au sens du tableau ci-dessus : mécanismes alignés, façade séparée.
- Une mission de taille S, « façade compatible tokenpool », est à ajouter au plan du lot 2 et au backlog, par une mission de mise à jour du plan.
- Le qualificatif « éprouvé » donné au protocole de tokenpool dans `coordination.md` (FR et EN) est à corriger par une mission `docs`.
- L'instance tokenpool d'amorçage reste une décision distincte du porteur (catégorie 1). Une inscription, publique ou sur une instance propre, suppose d'abord une licence reconnue par GitHub pour le dépôt.
