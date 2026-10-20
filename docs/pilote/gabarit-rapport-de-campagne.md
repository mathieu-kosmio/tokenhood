[Campagne pilote](README.md) › Gabarit du rapport de campagne

# Gabarit du rapport de campagne

Plan du rapport qui conclut la campagne pilote (mission TH-306, lot 3), et des points d'étape publiés à chaque porte de lot (sections 2 à 5). Le rapport n'est pas une décision : il établit des constats et présente des options ; « poursuivre, ajuster ou arrêter est une décision collective de gouvernance, prise sur le rapport de campagne » ([campagne-pilote.md](../specs/campagne-pilote.md)).

Mode d'emploi :

- Copier le bloc ci-dessous dans le livrable de TH-306 et remplacer chaque `{…}`. Les lignes `>` sont des consignes de rédaction, à supprimer.
- Chaque chiffre porte sa **nature** (mesuré, déclaré, estimé) et sa **source** (journal, PR, rapport de consommation, retour à 30 jours). Un chiffre sans source n'entre pas dans le rapport.
- Les indicateurs sont ceux du [protocole, § 7](protocole.md#7-indicateurs-et-mesure-de-la-valeur), calculés tels que définis là ; un changement de définition se déclare en section 8.
- Les effectifs se donnent toujours, les pourcentages seulement à côté d'eux : la campagne n'a aucune représentativité statistique.
- Les constats sont séparés de leur interprétation, et l'interprétation des options. Une démonstration se qualifie par l'un de ces niveaux : **établie**, **partielle**, **non établie**, **non évaluable** (données insuffisantes).
- Un avis ou un commentaire d'une personne n'est cité qu'avec son accord ; tout contenu externe cité est balisé `<contenu-non-fiable source="…">`.

---

```markdown
# Rapport de la campagne pilote Tokenhood

- Mission : TH-306 (`research`), contrat version {n}
- Période couverte : du {AAAA-MM-JJ} au {AAAA-MM-JJ}
- Protocole appliqué : docs/pilote/protocole.md au commit {empreinte}
- Journal : docs/pilote/journal-de-campagne.md au commit {empreinte} ; données de la plateforme au {AAAA-MM-JJ}
- Auteur : agent de {compte}, {client} ({modèle}) ; vérification : {compte du vérificateur}, {client}
- Statut : soumis à la gouvernance ; aucune décision prise par ce rapport

## 1. Synthèse

> Une page au plus. Trois constats, une phrase chacun, puis les options. Pas de chiffre qui ne figure pas plus bas.

| Démonstration | Niveau | Constat principal | Section |
| --- | --- | --- | --- |
| 1. La boucle fonctionne de manière reproductible | {établie, partielle, non établie, non évaluable} | {une phrase} | 3 |
| 2. Le projet bénéficiaire y gagne réellement | {…} | {…} | 4 |
| 3. Les limites sont connues et respectées | {…} | {…} | 5 |

Options soumises à la décision : poursuivre, ajuster ({ajustements principaux}), arrêter. Détail en section 9.

## 2. Périmètre de la campagne

### Dimensionnement prévu et réalisé

| Dimension | Prévu (campagne-pilote.md) | Réalisé | Écart et cause |
| --- | --- | --- | --- |
| Missions réelles | 15 à 20 | {n} | {…} |
| Types | Code, documentation, i18n, gouvernance | {répartition} | {…} |
| Contributeurs | Plusieurs, dont un extérieur à l'équipe fondatrice | {n}, dont {n} extérieurs | {…} |
| Clients d'agent | Deux lorsque disponibles | {liste} | {…} |
| Mainteneur externe | Au moins un, projet admis manuellement | {projet, date d'admission} | {…} |

### Missions

| Issue | Projet Tokenhood | Projet externe | Total |
| --- | ---: | ---: | ---: |
| Intégrées, conformes | {n} | {n} | {n} |
| Intégrées, dérogatoires | {n} | {n} | {n} |
| Acceptées, non intégrées | {n} | {n} | {n} |
| Abandonnées ou annulées | {n} | {n} | {n} |
| En cours à la clôture | {n} | {n} | {n} |

> Liste complète par mission en annexe D. Pour chaque mission dérogatoire, l'étape manquante.

### Écarts au protocole

> Ce qui n'a pas été enregistré comme prévu, depuis quand, et l'effet sur les indicateurs.

## 3. Démonstration 1 : la boucle fonctionne de manière reproductible

> Ne s'appuie que sur les missions conformes ; les dérogatoires sont rappelées à part.

| Indicateur | Valeur | Nature | Source |
| --- | --- | --- | --- |
| Part de missions conformes | {n} / {n} | Fait | Journal |
| Missions avec au moins une intervention hors protocole | {n} / {n} ; dont par un fondateur : {n} | Déclaré | Journal |
| Missions conformes sans fondateur (producteur, vérificateur, correctifs) | {n} | Fait | Journal, forge |
| Reprises : missions à plus d'une tentative | {n} ; tentatives par mission : {médiane, max} | Fait | Journal, plateforme |
| Modifications après revue : missions concernées, cycles | {n} ; {médiane, max} | Mesuré | Forge |
| Délai médian réservation → soumission | {durée} | Mesuré | Plateforme, forge |
| Délai médian soumission → première revue | {durée} | Mesuré | Forge |
| Délai médian première revue → fusion | {durée} | Mesuré | Forge |
| Demandes d'arbitrage : `continue`, `switch_mission`, `stop` ; délai médian de décision | {n}, {n}, {n} ; {durée} | Fait | Journal, plateforme |

**Évolution dans le temps.** {Les mêmes indicateurs par lot (0, 1, 2, 3) : la dépendance aux fondateurs diminue-t-elle ?}

**Blocages.** {Répartition par cause (`dependency`, `contract`, `question`, `environment`, `ci`, `review`, `capacity`, `scope`, `other`), avec les cas marquants.}

**Constat.** {…} **Niveau** : {…}

## 4. Démonstration 2 : le projet bénéficiaire y gagne réellement

### Retours à 30 jours

| Question | Réponses | Tokenhood | Projet externe |
| --- | --- | ---: | ---: |
| 1. Service attendu | oui · en partie · non | {n} · {n} · {n} | {n} · {n} · {n} |
| 2. Encadrement | oui · à peu près · non | {…} | {…} |
| 3. Corrections | aucune · mineures · importantes | {…} | {…} |
| Taux de réponse | reçus / dus | {n} / {n} | {n} / {n} |

> Préciser qui a répondu pour chaque projet. Les retours du porteur sur les missions de son propre agent sont des auto-évaluations : les présenter à part.

### Gain humain net estimé

| Mission ou groupe | `T_sans` | `T_cadrage` | `T_assistance` | `T_revue` | `T_correction` | `T_intégration` | `G` |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| {…} | {h, estimé} | {h, déclaré} | {…} | {h, session ou déclaré} | {…} | {…} | {h, estimé} |

Missions sans `G` calculable : {n}, dont recherche et création : {n} (appréciation d'utilité : réponse à la question 1 et commentaires).

### Coûts après intégration

| Indicateur | Valeur | Nature | Source |
| --- | --- | --- | --- |
| Défauts après intégration : nombre, gravité | {n} ; {mineurs, importants} | Déclaré | Journal |
| Travaux de suite : nombre, tokens comptés | {n} ; {n} | Déclaré | Journal, rapports `integration` |
| Coût d'intégration : tokens `integration` / tokens `production` | {ratio} | Déclaré | Rapports de consommation |

### Avis de fin de campagne

| Projet | Qui | Poursuivre ? | Conditions |
| --- | --- | --- | --- |
| {projet externe} | {rôle} | {oui, sous conditions, non} | {…} |
| Tokenhood | Porteur | {…} | {…} |

**Constat.** {…} **Niveau** : {…}

## 5. Démonstration 3 : les limites sont connues et respectées

| Indicateur | Valeur | Source |
| --- | --- | --- |
| Tokens comptés par méthode (`client_transcript`, `provider_api`, `client_counter`, `estimate`) | {répartition} | Rapports de consommation |
| Tokens comptés par nature (déclaré, mesuré, estimé) | {répartition} | Rapports de consommation |
| Contributions exécutées hors environnement isolé | {n} / {n} | Rapports de mission, attestations du compagnon |
| Plafonds : contrôlé, estimatif, temps ou missions, par client | {…} | Registre de compatibilité (TH-008, TH-208) |
| Clients utilisés et statut au registre | {…} | Registre de compatibilité |
| Contenus non fiables signalés ; incidents de sécurité | {n} ; {n} (sans détail public) | Journal |

> Vérifier aussi l'affichage : chaque mesure estimative ou déclarative est-elle présentée comme telle dans la landing, la plateforme et ce rapport ? Citer les écrans ou pages contrôlés.

**Constat.** {…} **Niveau** : {…}

## 6. Consommation et estimation

| Nature de contribution | Rapports | Tokens comptés | Lectures de cache (non comptées) |
| --- | ---: | ---: | ---: |
| production | {n} | {n} | {n} |
| verification | {n} | {n} | {n} |
| drafting | {n} | {n} | {n} |
| integration | {n} | {n} | {n} |

| Type × taille | Missions avec estimation | Sous la fourchette | Dans la fourchette | Au-dessus | Rapport médian consommation / borne haute |
| --- | ---: | ---: | ---: | ---: | ---: |
| {…} | {n} | {n} | {n} | {n} | {…} |

> Rappeler les biais de mesure (cache après une pause, sessions partagées, rapports rétroactifs) et ce qu'ils changent. Ces chiffres alimentent la mission `governance.estimation`, pas la mesure de valeur.

## 7. Charge de gouvernance et de revue

> Temps et nombre d'interventions des fondateurs et des mainteneurs, par rôle et par nature (cadrage, assistance, revue, correction, intégration, déblocage) ; plafonds de flux atteints et leurs effets.

## 8. Limites de la campagne

> Biais connus (protocole, § 11) et ceux apparus en cours de campagne ; pour chacun, l'indicateur touché et le sens probable de l'erreur. Changements de définition des indicateurs, s'il y en a eu.

## 9. Options soumises à la décision

| Option | Ce que les constats soutiennent | Ce qu'ils ne soutiennent pas | Conséquences | Conditions ou ajustements |
| --- | --- | --- | --- | --- |
| Poursuivre | {…} | {…} | {…} | {…} |
| Ajuster | {…} | {…} | {…} | {liste des ajustements} |
| Arrêter | {…} | {…} | {…} | {…} |

Recommandation des auteurs (facultative, distincte des constats) : {…}

## Annexes

- A. Journal de campagne : lien et empreinte du commit.
- B. Méthodes de calcul : renvoi au protocole, § 7, et écarts éventuels.
- C. Sources : PR, rapports de consommation, retours à 30 jours, décisions, données de la plateforme, avec leurs dates de relevé.
- D. Données par mission : type, taille, classe, producteur et vérificateur (comptes publics), dates, tokens comptés par nature de contribution, estimation au cadrage, retour à 30 jours, `G`, défauts, travaux de suite.
```
