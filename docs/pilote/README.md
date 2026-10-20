# Campagne pilote · Pilot campaign

**FR** · Protocole de la campagne pilote et mesure de la valeur nette, livrés par la mission [TH-010](../../.tokenhood/missions/TH-010.yaml). Ils précisent ce que la spécification laisse au protocole ([Campagne pilote](../specs/campagne-pilote.md), [Valeur nette](../specs/valeur-nette.md)) : quelles missions entrent dans la campagne, ce qui est enregistré et par qui, comment se recueille le retour à 30 jours, et la forme du rapport qui conclura la campagne (mission TH-306, lot 3).

**EN** · Pilot campaign protocol and net value measurement, delivered by mission [TH-010](../../.tokenhood/missions/TH-010.yaml). They specify what the specification leaves to the protocol ([Pilot campaign](../specs/en/campagne-pilote.md), [Net value](../specs/en/valeur-nette.md)): which missions enter the campaign, what is recorded and by whom, how the 30-day feedback is collected, and the shape of the report that will close the campaign (mission TH-306, lot 3). The 30-day questionnaire is bilingual; the other documents are in French, their translation being left to an `i18n` mission.

Statut : **proposé**. Le protocole s'applique dès sa fusion par le porteur ; les mainteneurs le modifient par une PR. Il ne fixe aucun seuil de poursuite : la décision de poursuivre, d'ajuster ou d'arrêter reste collective.

| Document | Contenu | Pour qui |
| --- | --- | --- |
| [protocole.md](protocole.md) | Questions d'évaluation, phases, missions de la campagne, données enregistrées, causes de blocage, interventions humaines, indicateurs et gain humain net, données personnelles, rôles, limites de la mesure | Porteur, contributeurs, vérificateurs, TH-304, TH-306 |
| [retour-a-30-jours.md](retour-a-30-jours.md) | Questionnaire en trois questions (FR, EN), codes, définitions, calendrier, canal en amorçage | Mainteneurs, TH-304 |
| [journal-de-campagne.md](journal-de-campagne.md) | Registre de la campagne ; état initial au 2026-10-20 reconstitué depuis le dépôt, les rapports de consommation et la forge ; calendrier des premiers retours | Porteur, TH-306 |
| [gabarit-rapport-de-campagne.md](gabarit-rapport-de-campagne.md) | Plan du rapport de campagne et des points d'étape | TH-306, porteur |

À retenir de l'état initial (détail et sources dans le [journal](journal-de-campagne.md)) :

- 13 missions intégrées au 2026-10-20, toutes produites, intégrées et fusionnées par le même compte, sans aucune revue sur les PR #1 à #22 : elles sont classées dérogatoires, et la démonstration 1 reste entièrement à faire.
- 5 668 022 tokens comptés (déclarés) : 3 807 429 en production, 1 860 593 en intégration ; aucune vérification.
- Les 13 premiers retours à 30 jours sont dus le 2026-11-17.
- Cases vides de la grille de couverture : mission i18n, second contributeur, contributeur extérieur, second client, mainteneur externe.
