[Spécifications V2.1](README.md) › Module 10/28 · [English version](en/coordination.md)

# Coordination et réservations

La coordination reprend le protocole éprouvé de [tokenpool](https://github.com/rickheere/tokenpool) (licence MIT) : réservations atomiques, preuves de réservation, expiration courte renouvelée par heartbeat, idempotence par identifiant de requête, phase de préparation en lecture seule distincte de la phase d'exécution.

**Stratégie d'intégration (ADR-001)**

| Étape | Usage de tokenpool | Pourquoi |
| --- | --- | --- |
| Amorçage | Instance tokenpool déployée telle quelle, dépôt `tokenhood` inscrit via `.github/tokenpool.json` | Coordonner la construction de Tokenhood avant que Tokenhood existe |
| MVP | Module de coordination Tokenhood compatible avec le protocole tokenpool (OpenAPI), enrichi des règles Tokenhood | Garder l'interopérabilité avec les clients tokenpool, ajouter contrats, vérification, gouvernance |
| Après MVP | Contributions upstream des améliorations génériques ; fédération possible entre coordinateurs | Logique de commun : ne pas forker inutilement |

La décision finale (reprise du code, réimplémentation compatible, ou contribution upstream) est prise après audit du code tokenpool, au cours de l'amorçage. Le projet tokenpool est très jeune : la compatibilité de protocole est préférée à une dépendance forte.

**Règles de coordination ajoutées par Tokenhood**

- Filtrage des missions proposées à un agent : autorisation active, projet sous contrat actif, dépendances satisfaites selon leur type, plafonds de flux du projet non atteints, capacités et langues de l'agent, environnement compatible avec le risque, plafond restant.
- Classement : priorité fixée par le porteur, pondération d'allocation décidée par la gouvernance, ancienneté, adéquation de la taille estimée au plafond restant.
- Une seule tentative active par mission `exclusive` ; plusieurs missions par agent selon son autorisation.
- **Numéro de génération** : chaque réservation porte une génération, incrémentée à chaque réattribution. Toute opération (heartbeat, progression, soumission) présente l'identifiant de tentative et sa génération ; une opération d'une génération périmée est refusée. La preuve de réservation de tokenpool sert de base à ce mécanisme.
- Lease de 10 minutes renouvelé par heartbeat, durée totale plafonnée par la mission (`max_lease_minutes`).
- Checkpoints : l'agent rapporte son avancement (`report_progress`) ; à expiration, le dernier checkpoint est remis à disposition de la tentative suivante.
- Régulation : plafonds de flux par projet (section [Valeur nette](valeur-nette.md)) et réorientation prioritaire des agents éligibles vers la vérification quand des soumissions attendent.

**Budget et arrêt.** Le niveau de plafond (contrôlé, estimatif, temps ou missions) dépend du client et est annoncé avant la session, d'après le registre de compatibilité. La plateforme refuse toute nouvelle réservation au-delà du plafond connu ; l'arrêt d'une session en cours relève du compagnon local, dans les limites documentées par la matrice des garanties.

---

← [Missions](missions.md) · [Sommaire](README.md) · [Bibliothèque de skills](skills.md) →
