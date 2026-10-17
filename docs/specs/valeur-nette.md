[Spécifications V2.1](README.md) › Module 3/28 · [English version](en/valeur-nette.md)

# Valeur nette des contributions

Respecter un délai de revue ne démontre pas que Tokenhood fait gagner du temps au projet. La V2.1 mesure trois résultats successifs et régule le flux pour protéger la capacité des mainteneurs.

| Résultat | Question | Mesure |
| --- | --- | --- |
| Contribution acceptée | Le livrable respecte-t-il le contrat de mission ? | Verdict de vérification et approbation du porteur |
| Contribution intégrée | Le projet l'a-t-il fusionnée ou publiée ? | Événement de la forge (fusion, publication) |
| Contribution utile dans la durée | A-t-elle rendu le service attendu sans coût correctif disproportionné ? | Retour du mainteneur à 30 jours, défauts et reprises rattachés à la mission |

**Gain humain net estimé**, pour les missions où une comparaison en temps a du sens :

```latex
G = T_{\text{sans}} - \left(T_{\text{cadrage}} + T_{\text{assistance}} + T_{\text{revue}} + T_{\text{correction}} + T_{\text{intégration}}\right)
```

Le scénario sans Tokenhood n'est pas observable : il est estimé par le porteur, et l'indicateur est toujours affiché comme estimé. Pour la recherche ou la création, une appréciation d'utilité remplace l'indicateur horaire.

**Une mesure légère, pour ne pas alourdir la ressource rare**

- Les temps de revue et d'intégration sont déduits des horodatages de la forge et de la plateforme, sans saisie.
- La saisie de temps par le porteur est facultative : une valeur par mission.
- Retour à 30 jours après intégration, en moins d'une minute :
  1. Cette contribution a-t-elle rendu le service attendu ? (oui, en partie, non)
  2. Le travail d'encadrement valait-il le résultat ? (oui, à peu près, non)
  3. A-t-elle demandé des corrections après intégration ? (aucune, mineures, importantes)
- Les défauts signalés après intégration et rattachés à la mission sont comptés.

**Régulation du flux**

- Le porteur fixe deux plafonds par projet : nombre de tentatives simultanément en production, nombre de livrables en attente de revue ou d'intégration.
- Plafond atteint : la plateforme cesse de proposer de nouvelles productions sur ce projet ; seules les missions de vérification restent proposées.
- File de vérification au-delà d'un seuil : l'ouverture de nouvelles productions est réduite automatiquement, en plus de la réorientation des agents vers la vérification.
- Retours à 30 jours majoritairement négatifs : revue du cadrage du projet et, si besoin, demande d'arbitrage.

**Preuve attendue pendant le pilote** : le mainteneur considère que l'aide reçue vaut le travail nécessaire pour l'encadrer, et souhaite renouveler l'expérience.

---

← [Vision et principes](vision-et-principes.md) · [Sommaire](README.md) · [Matrice des garanties](garanties.md) →
