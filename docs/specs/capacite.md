[Spécifications V2.1](README.md) › Module 14/28 · [English version](en/capacite.md)

# Capacité et économie non marchande

Tokenhood organise une contribution en capacité agentique sans vente ni transfert de tokens ; aucun paiement ne transite par la plateforme. Son exploitation repose sur des engagements identifiés en infrastructure, en travail humain et, lorsque nécessaire, en financement (section [Exploitation et continuité](exploitation.md)).

**Quatre notions distinctes**

| Notion | Signification | Source |
| --- | --- | --- |
| Capacité promise | Ce que le contributeur prévoit de consacrer sur une période | Engagement (pledge) |
| Capacité mobilisable | Ce qu'un agent disponible et compatible peut prendre en charge maintenant | Agents vus récemment, capacités et langues compatibles, plafond restant |
| Capacité consommée | Ce que les rapports d'exécution indiquent | Rapports d'usage, avec leur provenance |
| Résultat obtenu | Ce qui a été accepté, intégré et jugé utile | Vérification, forge, retour à 30 jours |

**Engagement.** Un contributeur engage une capacité pour une période, dans l'unité native de son mode :

| Mode | Unité native | Méthode de mesure |
| --- | --- | --- |
| API | Tokens ou montant | Compteur du fournisseur, rapporté par le client |
| Abonnement | Heures d'agent ou nombre de missions | Durée ou décompte, rapportés par le client |
| Modèle local | Heures d'agent | Durée rapportée |

Un engagement a un statut : `active`, `expired`, `withdrawn`, ou `allocated` (déjà affecté à une tentative en cours).

**Méthode de mesure et niveau de confiance** sont deux dimensions séparées. La méthode dit d'où vient le chiffre : compteur du fournisseur, durée, estimation. La confiance dit ce que Tokenhood en sait : `client_reported` (transmis par le client), `evidenced` (justificatif joint, par exemple un export du fournisseur), `reconciled` (rapproché avec une autre source). Une mesure issue d'un compteur puis transmise par un client reste `client_reported` tant qu'aucun rapprochement n'est fait.

**Tokens-équivalents.** Unité de projection du tableau de bord, calculée avec des barèmes publics, versionnés et décidés en gouvernance. Ils ne mesurent pas une valeur intrinsèque, ne prouvent pas une dépense et ne fondent aucun droit politique.

**Règles d'agrégation**

- Les engagements expirés, retirés ou déjà affectés ne comptent pas dans la capacité mobilisable.
- Toute agrégation conserve l'unité native, la source et le niveau de confiance des données sous-jacentes, consultables au survol et à l'export.
- Une même enveloppe n'est jamais comptée deux fois, ni entre fléché et mutualisé, ni entre deux périodes.

**Fléchage.** Un engagement est fléché vers un projet précis (seules ses missions sont proposées à l'agent) ou mutualisé dans le pot commun (la gouvernance fixe des pondérations d'allocation entre projets). La plateforme ne déplace aucun token : une allocation se traduit par un ordre de priorité dans les missions proposées.

**Preuve attendue** : le tableau de bord ne compte pas deux fois une même enveloppe et ne présente pas une promesse ancienne comme une ressource disponible.

---

← [Contributions non-code et internationalisation](non-code-et-i18n.md) · [Sommaire](README.md) · [Exploitation et continuité](exploitation.md) →
