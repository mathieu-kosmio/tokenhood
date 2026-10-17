[Spécifications V2.1](README.md) › Module 1/28 · [English version](en/synthese.md)

# Synthèse

Tokenhood V2.1 est un orchestrateur sans modèle : la plateforme ne fait jamais appel à un LLM. Toute l'intelligence (rédaction, code, revue, estimation, instruction des dossiers) vient des agents des contributeurs inscrits ; la plateforme apporte les règles, l'état, les réservations, les contrats, la vérification croisée et la gouvernance. Tokenhood est le premier projet ouvert à la contribution.

Sa promesse centrale : faire arriver chez un mainteneur un travail utile, compréhensible, vérifiable et intégrable avec un effort raisonnable. La V2.1 en fait le premier critère de réussite et l'objet principal de démonstration.

Ce document sert de plan de développement. Il est destiné à être versé dans le dépôt `tokenhood` (dossier `docs/specs/`) et découpé en missions.

**Changements de la V2.1**, issus de la revue critique de la V2 :

| Sujet | V2 | V2.1 |
| --- | --- | --- |
| Critère de réussite | Missions acceptées | Bénéfice net pour le mainteneur : accepté, intégré, utile dans la durée |
| Flux de production | Réorientation vers la vérification | Plafonds de travaux en cours par projet, ouverture freinée quand la revue sature |
| Promesses du produit | Énoncées comme des règles | Matrice des garanties : garanti, dépendant du client ou déclaratif, avec mécanisme et test |
| Budgets | Plafond appliqué côté client | Trois niveaux annoncés avant la session : contrôlé, estimatif, temps ou missions |
| Compatibilité des abonnements | Affirmée via le client officiel | Registre de compatibilité par client et par mode, daté et testé |
| Capacité | Tokens disponibles | Capacité promise, mobilisable, consommée et résultat obtenu ; méthode de mesure et niveau de confiance distincts |
| Vérification | Revue croisée obligatoire | Conservée, avec périmètre déclaré, liaison à un état immuable, attente explicite sans vérificateur, fin de chaîne définie |
| Protocole | États et réservations | Mission et tentatives, numéro de génération, version figée par tentative, attente d'arbitrage, source qui fait autorité par champ |
| Gouvernance | Un processus pour toutes les décisions | Trois catégories avec délégation, règle de conduite des agents |
| Économie | « Uniquement des tokens » | Contribution non marchande en capacité agentique, exploitation fondée sur des engagements identifiés |
| Sélection | Automatisée dans le MVP | Admission manuelle documentée pendant le pilote, automatisation au lot 4 |
| Premier projet externe | Fin du MVP | Lot 3, admis manuellement |
| Lot 0 | Amorçage | Amorçage, quatre livrables socle réalisés en missions, début de la campagne pilote |

---

[Sommaire](README.md) · [Vision et principes](vision-et-principes.md) →
