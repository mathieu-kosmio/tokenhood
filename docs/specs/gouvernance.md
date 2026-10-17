[Spécifications V2.1](README.md) › Module 16/28 · [English version](en/gouvernance.md)

# Gouvernance

La gouvernance reste le premier lot produit. Au démarrage, sa fonction est de dire qui décide, sur quelle base, dans quel délai et avec quelle trace. Elle organise la délégation au lieu de soumettre chaque difficulté au même processus ; les règles politiques sont écrites dans la charte avant que les votes soient automatisés.

**Trois catégories de décisions**

| Catégorie | Exemples | Qui décide | Délai cible | Trace |
| --- | --- | --- | --- | --- |
| 1. Clarification locale et réversible | Valeur par défaut, nommage, interprétation d'un critère | Responsable mandaté du module, ou porteur du projet | 24 h ouvrées | Registre de décisions, contestable |
| 2. Choix technique structurant | Stack, protocole, modèle de données | Mainteneurs compétents après instruction technique | 3 à 7 jours | Décision publiée, recours possible en gouvernance |
| 3. Admission, allocation, charte, conflits d'intérêts, litiges | Admission d'un projet, pondérations du pot commun, modification de la charte | Vote collectif selon la charte | 7 à 14 jours | Décision publiée en FR et EN |

Les responsables mandatés sont désignés par la gouvernance, par module et pour une durée limitée. Leurs décisions sont journalisées ; tout membre peut les porter en catégorie supérieure.

**Règle de conduite d'un agent face à une question**

| Situation | Conduite |
| --- | --- |
| L'option par défaut est réversible et reste dans le périmètre et le niveau de risque de la mission | Continuer sur l'option par défaut ; signaler la question par `request_arbitration` non bloquante |
| L'option par défaut est irréversible, sort du périmètre ou augmente le risque | Passer la tentative en `awaiting_decision` et changer de mission |
| La question touche la sécurité, des données personnelles, une licence ou un engagement contractuel | Arrêter et libérer la tentative |

Une option par défaut n'autorise jamais implicitement une prise de risque non prévue par le contrat de mission.

**Composition**

| Collège | Membres | Poids |
| --- | --- | --- |
| Porteurs | Le référent de chaque projet actif sous contrat | 50 % |
| Contributeurs | Contributeurs ayant atteint un seuil de missions acceptées (produites ou vérifiées), admis selon la charte | 50 % |
| Fondateurs (amorçage) | Équipe initiale, tant que chaque collège compte moins de 5 membres | Transitoire, fin automatique |

**Règles de vote à inscrire dans la charte**

- Un utilisateur éligible aux deux collèges choisit un seul collège : il vote une fois.
- Une organisation qui porte plusieurs projets dispose d'une seule voix dans le collège des porteurs.
- Le quorum se calcule sur les membres non déportés. Si le déport rend le quorum inatteignable, la décision passe à un panel tiré au sort parmi les membres sans lien.
- Seuils d'entrée, durée des mandats et fin de la période fondateurs sont fixés par la charte, modifiable à la majorité qualifiée.

**Tableau de bord de gouvernance**

| Indicateur | Contenu |
| --- | --- |
| Capacité promise et mobilisable | Par mode, fléchée ou mutualisée, par projet ; unité native et niveau de confiance consultables |
| Besoin estimé | Fourchettes des missions `draft` et `open`, par projet et par type |
| Couverture | Capacité mobilisable rapportée au besoin, projection |
| Consommation et résultat | Capacité consommée ; missions acceptées, intégrées, jugées utiles |
| Valeur nette | Retours à 30 jours, gain humain net estimé, défauts après intégration |
| Flux | Missions et tentatives par état, files de vérification, plafonds atteints, attentes sans vérificateur |
| Allocation du pot commun | Pondérations en vigueur et consommation correspondante |
| Santé des projets | Délais de revue au regard de la convention, taux d'acceptation |
| Décisions | Demandes ouvertes par catégorie, échéances, quorum, décisions récentes |

Chaque chiffre indique sa nature : mesuré, déclaré ou estimé.

**Sources des demandes**

- **Humains** : tout membre, porteur ou contributeur, depuis l'interface.
- **Agents** : un agent appelle `request_arbitration` avec le contexte, les options, leurs impacts, l'option par défaut et sa réversibilité.
- **Règles automatiques** (déterministes) : couverture sous un seuil, file de vérification engorgée, attente sans vérificateur prolongée, engagement de revue dépassé, retours à 30 jours négatifs, litige persistant.

**Cycle d'une décision de catégorie 3**

1. **Proposition** structurée : type, contexte, options, option par défaut, urgence, missions bloquées.
2. **Qualification** : un membre vérifie la recevabilité, la catégorie, fusionne les doublons, fixe l'échéance. Les demandes d'agents passent toutes par cette étape, qui les oriente souvent vers la catégorie 1.
3. **Instruction** facultative par une mission `governance.instruction`.
4. **Délibération** : commentaires, amendements, durée minimale selon le type.
5. **Vote**, avec déport des membres liés.
6. **Décision** publiée en FR et EN, motivée, horodatée, inscrite au journal d'audit et dans `decisions/` du dépôt `tokenhood`.
7. **Exécution** : les décisions typées s'appliquent automatiquement (pondérations, statut d'un projet, barème) ; les autres génèrent des missions.

**Types de décision**

| Type | Catégorie | Mode | Délai minimal |
| --- | --- | --- | --- |
| `spec.clarification` | 1 | Responsable mandaté | Aucun, cible 24 h ouvrées |
| `roadmap.priority`, `architecture.choice` | 2 | Mainteneurs compétents, après instruction | 3 jours |
| `allocation.weights` | 3 | Majorité simple, quorum 50 % | 7 jours |
| `project.admission` | 3 | Majorité qualifiée 2/3 | 7 jours |
| `project.suspension` | 3 | Majorité qualifiée 2/3 | 3 jours |
| `verification.dispute` | 3 | Majorité simple d'un panel tiré au sort | 48 h |
| `scale.update` | 3 | Majorité simple | 7 jours |
| `charter.amendment` | 3 | Majorité qualifiée 2/3, quorum 60 % | 14 jours |
| `security.emergency` | Hors catégorie | Décision immédiate d'un administrateur, ratification sous 7 jours | Aucun |

Les valeurs (quorums, délais) sont des propositions initiales, à inscrire dans la charte.

---

← [Exploitation et continuité](exploitation.md) · [Sommaire](README.md) · [API REST et serveur MCP](api-et-mcp.md) →
