[Charte d'amorçage](README.md) · [English version](en/charte-amorcage.md)

# Charte opérationnelle d'amorçage

| | |
| --- | --- |
| Version | 0.1, 20 octobre 2026 |
| Rédaction | Mission [TH-011](../../.tokenhood/missions/TH-011.yaml), par l'agent d'un contributeur ; aucune valeur n'y est décidée par l'agent |
| Adoption | Par la fusion sur `main`, qui vaut décision du collège des fondateurs (section 10) |
| Langue source | Français ; la [version anglaise](en/charte-amorcage.md) est une traduction (statut `machine`, à relire) |
| Valeurs réglables | [Annexe A](#annexe-a--paramètres), avec l'origine de chacune |

## 1. Objet et portée

La charte dit qui décide, qui exploite et qui s'engage pendant l'amorçage de Tokenhood, tant que la plateforme ne porte pas sa propre gouvernance. Elle fixe ce que les spécifications V2.1 lui délèguent : règles de vote, seuils d'entrée au collège des contributeurs, mandats, fin de la période fondateurs ([Gouvernance](../specs/gouvernance.md)), titulaires des fonctions d'exploitation ([Exploitation et continuité](../specs/exploitation.md)), coordination de repli sans tokenpool ([plan de développement](../specs/plan-de-developpement.md), risques du plan).

Elle s'applique au projet Tokenhood (projet n° 1, contrat d'amorçage `CTR-2026-000` du [manifeste](../../.tokenhood/project.yaml)) et, pour l'admission, au projet externe pilote du lot 3.

**Ordre de priorité**

1. Les principes de la section 2 et les politiques du projet (`.tokenhood/policies/`), que la charte ne peut assouplir.
2. La charte, pour les points que les spécifications lui délèguent.
3. Les spécifications V2.1 (`docs/specs/`) et le plan de développement.
4. Les décisions publiées dans `decisions/`, qui appliquent la charte ou la modifient selon la section 10.

Une contradiction entre la charte et les spécifications sur un autre point se traite par une demande `spec.clarification`, jamais par une dérogation silencieuse.

## 2. Principes

- **Non marchand** : rien ne se vend ni ne se transfère ; aucun paiement ne transite par Tokenhood.
- **Orchestrateur sans modèle** : aucun appel à un fournisseur de LLM côté serveur, aucune clé de fournisseur stockée.
- **Les humains décident** : seuls des humains votent, signent, approuvent et fusionnent. Un agent produit, vérifie, instruit et demande un arbitrage ; il n'a aucun rôle de décision.
- **Vérification croisée** par l'agent d'un autre utilisateur, sans lien déclaré avec le producteur ; fusion toujours humaine.
- **Tout travail passe par une mission** de `.tokenhood/missions/`, y compris la rédaction de cette charte.
- **Bilingue** : les décisions de catégorie 3 et les documents de gouvernance sont publiés en français et en anglais.
- **Transparence** : décisions, tokens offerts et résultats sont publics ; chaque chiffre indique s'il est mesuré, déclaré ou estimé.

## 3. Acteurs de l'amorçage

Les rôles sont ceux des spécifications ([Acteurs et rôles](../specs/acteurs-et-roles.md)) ; le tableau dit comment ils s'exercent avant la plateforme.

| Rôle | Pendant l'amorçage | Titulaires au 20/10/2026 |
| --- | --- | --- |
| Porteur du projet Tokenhood | Publie les missions, assigne les vérificateurs, approuve et fusionne, tient les fonctions d'exploitation sans autre titulaire | `@mathieu-kosmio` (Kosmio) |
| Collège des fondateurs | Exerce le poids des collèges qui comptent moins de 5 membres (section 5.2) et sert de comité de sélection provisoire | Équipe initiale : le porteur. Tout autre fondateur est inscrit par une décision dans `decisions/` |
| Collège des porteurs | Référent de chaque projet actif sous convention, une voix par organisation | Tokenhood seul |
| Collège des contributeurs | Contributeurs admis selon la section 5.1 | Aucun membre admis |
| Responsable mandaté | Tranche les clarifications de catégorie 1 d'un module (section 4.2) | Aucun désigné : le porteur par défaut |
| Comité de sélection | Admission provisoire du projet pilote (section 7) | Collège des fondateurs |
| Administrateur | Forge, Coolify, modération, incidents, exécution technique des décisions | Le porteur |
| Contributeur, agent producteur, agent vérificateur | Comme dans les spécifications ; coordination selon la section 6 | Ouverts à toute personne inscrite sur GitHub |

## 4. Décisions et délégations

### 4.1 Trois catégories

| Catégorie | Qui décide pendant l'amorçage | Délai | Où | Trace |
| --- | --- | --- | --- | --- |
| 1. Clarification locale et réversible | Responsable mandaté du module, à défaut le porteur | Cible 24 h ouvrées | Discussion « [TH-xxx] objet » (catégorie Clarifications, General tant qu'elle n'existe pas) ou PR de la mission | Réponse dans le fil ; fichier `decisions/DEC-AAAA-NNN-titre.md` si la réponse fixe une règle durable |
| 2. Choix technique structurant | Mainteneurs compétents (au 20/10/2026, le porteur, seul mainteneur), après instruction par une mission `governance.instruction` | Au moins 3 jours entre la publication du dossier et la décision | PR qui verse le dossier et le projet de décision dans `decisions/` | Décision (ADR) dans `decisions/`, adoptée par la fusion |
| 3. Décision collective | Vote selon la section 5 | Délai minimal du type (section 5.5), cible 7 à 14 jours | Discussion « [Vote] type : objet » (catégorie Décisions, General tant qu'elle n'existe pas) | Décision motivée en FR et EN dans `decisions/`, avec le décompte |

La charte ne s'applique pas rétroactivement : les décisions DEC-2026-001 à DEC-2026-004, prises par le porteur avant son adoption, restent en vigueur.

### 4.2 Responsables mandatés

- **Désignation** : par le collège des fondateurs pendant la période fondateurs, puis par vote de catégorie 3 ; avec l'accord de la personne désignée ; inscrite dans `decisions/`.
- **Modules** : au moins « spécifications » (`docs/specs/`, `schemas/`, `skills/`) et « infrastructure » (image, `compose.yaml`, CI, Coolify), conformément au jour 0 du plan. D'autres modules se créent par la même voie.
- **Mandat** : durée fixée en annexe A, renouvelable, révocable à tout moment par l'instance qui l'a confié.
- **Limites** : un responsable ne tranche pas une question qui concerne sa propre contribution ; il la renvoie au porteur ou à un autre responsable. Ses décisions sont journalisées dans le fil de la question.
- **Défaut** : tant qu'un module n'a pas de responsable, le porteur en tient lieu.

### 4.3 Questions des agents

Une demande d'arbitrage suit `schemas/arbitration-request.schema.json`. En amorçage, `raised_by` désigne le contributeur humain et l'agent est nommé dans `context` ([DEC-2026-004](../../decisions/DEC-2026-004-skill-contribute-amorcage.md)).

| Conduite de l'agent | Traitement pendant l'amorçage |
| --- | --- |
| `continue` | Question listée dans la PR avec l'option retenue ; le porteur la confirme ou la modifie avant la fusion. Une confirmation qui fixe une règle durable est consignée dans `decisions/` |
| `switch_mission` | Discussion de clarification, label `awaiting-decision` sur la PR ou l'issue ; la décision est rendue dans le délai de sa catégorie |
| `stop` | Canal privé de la section 8.3 ; rien de public au-delà de la mention qu'une question a été transmise |

La qualification (recevabilité, catégorie, doublons, échéance) revient au porteur ou au responsable mandaté du module ; elle oriente la plupart des questions d'agents vers la catégorie 1.

### 4.4 Recours

Toute personne membre d'un collège, et pendant l'amorçage tout contributeur ayant au moins une mission acceptée, peut porter une décision de catégorie 1 ou 2 en catégorie supérieure par une discussion motivée. La décision contestée reste appliquée jusqu'à la nouvelle décision.

## 5. Règles de vote provisoires

Elles valent pour les décisions de catégorie 3 tant que les votes ne sont pas outillés dans Tokenhood (lot 1). Les valeurs chiffrées sont reprises en annexe A.

### 5.1 Admission aux collèges

- **Collège des porteurs** : le référent de chaque projet actif sous convention y entre à la signature de la convention. Une organisation qui porte plusieurs projets n'y dispose que d'une voix.
- **Collège des contributeurs** : y est admis, sur sa demande, l'utilisateur qui a atteint le seuil de l'annexe A en missions acceptées (produites ou vérifiées) sur des projets sous convention, Tokenhood compris.
- **Demande** : discussion « [Collège] admission de @compte », avec les liens vers les missions acceptées et la déclaration publique des liens d'intérêt (organisations, projets liés par l'emploi, la maintenance ou le financement).
- **Identité** : la vérification renforcée exigée des membres de gouvernance se fait en privé auprès du porteur. Aucune pièce ni donnée d'identité n'est publiée, versée dans le dépôt ou transmise à un agent ; la décision d'admission atteste seulement que la vérification a eu lieu.
- **Constat** : le porteur ou un responsable mandaté vérifie les conditions et publie l'admission dans `decisions/` sous 5 jours ouvrés. C'est un constat de catégorie 1, contestable selon la section 4.4.
- **Un seul collège** : un utilisateur éligible aux deux collèges choisit le sien dans sa demande ; il vote une fois.
- **Perte de la qualité de membre** : après la période d'inactivité de l'annexe A sans mission acceptée, ou à la fin de la convention du projet pour un référent. Une nouvelle mission acceptée rouvre l'admission.

### 5.2 Électorat et poids

Un vote de catégorie 3 réunit deux moitiés de même poids :

| Moitié | Poids | Détenue par |
| --- | --- | --- |
| Porteurs | 50 % | Le collège des porteurs s'il compte au moins 5 membres, sinon le collège des fondateurs |
| Contributeurs | 50 % | Le collège des contributeurs s'il compte au moins 5 membres, sinon le collège des fondateurs |

- Dans chaque moitié, chaque membre non déporté de son détenteur dispose d'une voix.
- Chaque utilisateur vote une seule fois. Un fondateur membre d'un collège qui détient sa moitié choisit, pour toute la période fondateurs, de voter comme fondateur ou dans ce collège ; son choix est publié.
- Quand le collège des fondateurs détient les deux moitiés, il vote une seule fois et son résultat vaut pour les deux.

### 5.3 Quorum et résultat

- **Quorum** : dans chaque moitié, le nombre de votants (pour, contre ou abstention) atteint au moins le quorum du type, rapporté aux membres non déportés de son détenteur.
- **Part favorable** d'une moitié : voix pour / (voix pour + voix contre). Les abstentions comptent pour le quorum, pas dans la part. Si une moitié n'exprime aucune voix pour ou contre, le résultat est la part de l'autre moitié.
- **Résultat** : moyenne des deux parts favorables. Majorité simple : résultat strictement supérieur à 1/2. Majorité qualifiée : résultat au moins égal à 2/3.
- **Quorum non atteint** : le vote est prolongé une fois, d'une durée égale au délai minimal du type et d'au moins 48 h. Faute de quorum à l'issue, la proposition n'est pas adoptée ; elle peut être présentée à nouveau.

### 5.4 Déport et panel tiré au sort

- **Déport obligatoire** d'un membre pour toute décision qui le concerne directement : sa propre contribution, une mission qu'il a produite ou vérifiée, un projet qu'il maintient, finance ou auquel il a déclaré un lien, l'organisation qui l'emploie ou qu'il représente, sa propre désignation ou révocation.
- **Déclaration** : par un commentaire « Déport : motif » avant l'échéance. Tout membre peut demander le déport d'un autre ; la contestation est tranchée par les fondateurs non concernés, à défaut par un panel.
- **Quorum** : calculé sur les membres non déportés.
- **Panel** : si le déport rend le quorum inatteignable dans une moitié, la décision passe à un panel de la taille fixée en annexe A, tiré au sort selon l'annexe B parmi les membres des collèges et les fondateurs sans lien avec l'objet. Le panel décide à la majorité du type, avec un délai d'au moins 48 h. Un membre du panel qui ne vote pas dans ce délai est remplacé par le suivant du tirage.
- **Panel impossible** (moins de personnes éligibles que sa taille) : section 5.7.

### 5.5 Types de décision

| Type | Majorité | Quorum | Délai minimal | Origine |
| --- | --- | --- | --- | --- |
| `allocation.weights` | Simple | 50 % | 7 jours | Spécifications |
| `project.admission` | Qualifiée 2/3 | 50 % | 7 jours | Spécifications, quorum proposé |
| `project.suspension` | Qualifiée 2/3 | 50 % | 3 jours | Spécifications, quorum proposé |
| `verification.dispute` | Simple, panel tiré au sort | Panel complet | 48 h | Spécifications |
| `scale.update` | Simple | 50 % | 7 jours | Spécifications, quorum proposé |
| `charter.amendment` | Qualifiée 2/3 | 60 % | 14 jours | Spécifications |
| Autre décision de catégorie 3 (licence, structure signataire, porte de lot, poursuite après le pilote) | Simple | 50 % | 7 jours | Proposé |
| `security.emergency` | Décision immédiate d'un administrateur, ratifiée sous 7 jours à la majorité simple | 50 % | Aucun | Spécifications |

Pour `verification.dispute`, le panel est tiré parmi les membres sans lien avec le producteur, les vérificateurs et le projet concerné.

### 5.6 Déroulement d'un vote dans GitHub

1. **Proposition** : discussion « [Vote] type : objet », avec une demande structurée conforme à `schemas/arbitration-request.schema.json` (type, contexte, options, option par défaut, urgence, missions bloquées), en français ou en anglais.
2. **Qualification** : un fondateur ou un responsable mandaté vérifie la recevabilité et la catégorie, fusionne les doublons, fige la version soumise au vote (lien du commentaire) et annonce l'échéance : qualification plus délai minimal du type, et au moins 48 h. Cible : 2 jours ouvrés après la proposition.
3. **Délibération et vote** : jusqu'à l'échéance, chaque membre vote par un nouveau commentaire « Vote : pour », « Vote : contre » ou « Vote : abstention ». Seul le dernier vote de chacun compte. Les commentaires modifiés, les réactions et les sondages GitHub ne comptent pas. Un amendement de la version figée annule les votes et ouvre une nouvelle échéance.
4. **Décompte** : à l'échéance, un fondateur ou un responsable mandaté publie dans le fil la liste des votes, les déports, le quorum de chaque moitié, les parts favorables et le résultat. Tout membre peut contester le décompte sous 48 h ; la correction est une décision de catégorie 1.
5. **Publication** : la décision, motivée, horodatée, en FR et EN, avec le décompte et le lien du fil, est versée dans `decisions/` par une PR sous 7 jours.
6. **Exécution** : la décision génère les missions ou les gestes humains qu'elle appelle.

### 5.7 Clause d'amorçage : un seul fondateur

Tant que le collège des fondateurs ne compte qu'une personne et détient les deux moitiés, une décision de catégorie 3 est de fait une décision du porteur. Elle n'est prise qu'après le délai minimal de délibération publique du type, et la décision publiée répond à chaque objection motivée reçue dans le fil. Tout contributeur ayant au moins une mission acceptée peut formuler une objection.

Si le porteur doit se déporter et qu'aucun panel n'est possible, la décision est différée, sauf si elle bloque une mission ou une porte de lot. Dans ce cas, le porteur la prend en déclarant publiquement le conflit, et elle est réexaminée d'office par la gouvernance installée au lot 1.

### 5.8 Fin de la période fondateurs et passage à la plateforme

- **Fin automatique** de la période fondateurs quand chacun des deux collèges compte au moins 5 membres. Le constat est publié dans `decisions/` sous 7 jours ; les votes ouverts après le constat se tiennent sans le collège des fondateurs. Chaque moitié passe à son collège dès qu'il atteint 5 membres, sans attendre l'autre.
- **Revue à chaque porte de lot** : la composition du collège des fondateurs, les seuils et le tableau d'exploitation sont revus et publiés.
- **Passage à la plateforme** : quand les votes sont outillés dans Tokenhood (TH-104 à TH-108), la gouvernance provisoire de GitHub est fermée et son historique importé. Les décisions provisoires restent en vigueur ; tout membre peut en demander le réexamen en catégorie 3 dans les trois mois qui suivent.

## 6. Coordination des missions

Tant que la plateforme ne coordonne pas ses propres missions (lots 0 à 2), la coordination s'appuie sur GitHub. La voie manuelle ci-dessous est la voie courante tant que `.github/tokenpool.json` vaut `"enabled": false`, et le repli si l'instance tokenpool devient indisponible.

| Étape | Règle | Responsable |
| --- | --- | --- |
| Publication | Contrat `.tokenhood/missions/TH-xxx.yaml` versé par PR, `status: open`, priorité fixée par le porteur | Porteur |
| Réservation | Avec tokenpool : `.github/tokenpool.md`. Sans tokenpool : commentaire « Réservation TH-xxx, contrat version N, par @compte (agent : client, modèle), jusqu'à AAAA-MM-JJ HH:MM UTC » dans une discussion « Réservation TH-xxx » ou sur l'issue de la mission ([DEC-2026-004](../../decisions/DEC-2026-004-skill-contribute-amorcage.md)). Une mission confiée par le porteur à son propre agent est réservée par sa demande | Contributeur |
| Exclusivité et échéance | Une seule tentative active par mission `exclusive`, la première réservation publiée l'emporte ; échéance à `execution.max_lease_minutes`, prolongée par un nouveau commentaire ; « Libération TH-xxx » avec la branche et le dernier point d'avancement | Contributeur |
| Plafonds de flux | Au plus 3 missions en production et 5 en attente de revue ou d'intégration (manifeste). Au-delà, le porteur suspend les nouvelles réservations ; seules les vérifications restent ouvertes | Porteur |
| État | Champ `status` du contrat : `in_progress` par la PR de la mission ; `accepted`, `integrated` ou `closed` par le porteur | Contributeur, porteur |
| Vérification | Le porteur assigne un vérificateur d'un autre utilisateur, éligible selon [Vérification croisée](../specs/verification-croisee.md) et `.tokenhood/policies/review.yaml`. Labels `needs-reviewer` en attente, `in-review` pendant la revue. Sans vérificateur éligible, la PR attend ; une dérogation n'est possible que par une décision tracée dans `decisions/` | Porteur |
| Question bloquante | Label `awaiting-decision`, traitement selon la section 4.3 | Porteur |
| Intégration | Approbation et fusion humaines, CI au vert, rapport de consommation joint ; retour à 30 jours recueilli selon le protocole de la campagne pilote (TH-010) | Porteur |

## 7. Admission provisoire

### 7.1 Champ

Pendant les lots 0 à 3, l'admission du projet externe pilote se fait à la main, selon les exigences du processus cible ([Sélection des projets et contractualisation](../specs/selection-et-contractualisation.md)), documentée puis enregistrée dans Tokenhood quand la plateforme le permet. Le lot 4 automatise ce processus à partir de ces dossiers réels.

### 7.2 Comité de sélection provisoire

Le collège des fondateurs fait office de comité de sélection ; un membre lié au projet candidat se déporte. Les pièces et résultats du contrôle KYB restent au comité : ils ne sont jamais versés dans un dépôt, une discussion ou un paquet de mission, ni transmis à un agent (politique `kyb_documents_in_mission_packages`). Le dossier public ne mentionne que « conforme » ou « non conforme ».

### 7.3 Étapes

| Étape | Contenu | Qui |
| --- | --- | --- |
| 1. Repérage | Candidats documentés à partir de données publiques uniquement | Mission TH-012 |
| 2. Prise de contact | Présentation de Tokenhood au mainteneur, accord de principe | Porteur |
| 3. Candidature | Champs du formulaire des spécifications (dépôts, licence, gouvernance, structure porteuse, référent, besoins), fournis ou validés par le référent du projet | Projet candidat |
| 4. Contrôle KYB | Selon la forme du porteur du projet, hors dépôt | Comité |
| 5. Instruction | Mission `governance.instruction` confiée à un agent sans lien avec le projet, sur la candidature et des données publiques ; grille des spécifications, pondérations de l'annexe A | Mission TH-305 |
| 6. Décision | Vote `project.admission` (section 5.5), avec déport | Gouvernance |
| 7. Convention | Convention pilote reprenant le contenu minimal des spécifications, relue par le comité, après validation juridique | Mission TH-305, comité |
| 8. Signature | Signature manuelle documentée (remplacement de DocuSeal) ; PDF archivé hors dépôt, empreinte SHA-256 publiée dans la décision | Référent du projet, structure signataire |
| 9. Onboarding | PR `.tokenhood/` dans le dépôt du projet, validée avec `tools/validate` | Projet, porteur |

### 7.4 Critères propres au pilote

En plus de la grille des spécifications, le projet pilote :

- publie son code sous une licence reconnue par l'OSI ;
- compte au moins un mainteneur actif, prêt à revoir dans un délai convenu et à répondre au retour à 30 jours ;
- accepte publiquement les contributions assistées par IA ;
- propose des missions de types variés, de risque `low` ou `medium`, sans données personnelles non publiques ;
- se rattache aux communs numériques ou à la transition.

### 7.5 Préalables non tranchés par la charte

La structure signataire des conventions (Kosmio pendant l'amorçage, à confirmer) et la validation juridique de la convention, de la signature et des conditions sont tranchées par le porteur avant l'étape 7, et en tout cas avant l'admission du projet externe (lot 3). La charte ne les fixe pas.

## 8. Exploitation

### 8.1 Fonctions d'exploitation

Chaque fonction a un responsable, un engagement et une solution de remplacement. La situation est celle du 20 octobre 2026.

| Fonction | Responsable | Engagement | Coût | Remplacement | Situation |
| --- | --- | --- | --- | --- | --- |
| Hébergement de la plateforme et de la landing | Porteur (Kosmio) | Serveur Coolify existant du porteur, offert en nature, à confirmer | Faible, en euros | Second hébergeur documenté dans le runbook (TH-014) | En service : `tokenhood.kosm.io`, `app.` et `api.tokenhood.kosm.io` |
| Sauvegardes et restauration | Responsable de l'hébergement | Sauvegarde quotidienne vers une destination S3 externe, restauration testée à chaque porte | Faible | Second hébergeur | Non attestées dans le dépôt : à documenter par TH-014 |
| Nom de domaine et DNS | Porteur (Kosmio) | Sous-domaines de `kosm.io`, à confirmer | Faible | Transfert vers un domaine propre, à documenter | En service |
| Déploiement continu | Porteur ([DEC-2026-002](../../decisions/DEC-2026-002-deploiement.md)) | Déploiement de chaque commit sur `main` | Aucun | Responsable mandaté infrastructure | En service ; environnement cible (staging ou production) encore ouvert |
| Forge : dépôt, protection de `main`, statuts requis, Discussions, labels | Porteur, administrateur du dépôt | Réglages tenus à jour avec la CI | Aucun | Second administrateur, à désigner | En service ; catégories Clarifications, Décisions, Propositions à créer |
| Coordination des missions | Porteur | Section 6 | Aucun | Responsable mandaté spécifications | Manuelle, tokenpool désactivé |
| Revue, approbation et fusion | Porteur, seul mainteneur | Délais cibles de la section 9.1 | Aucun | Second mainteneur, à désigner | Goulot identifié par le plan |
| Assignation des vérificateurs | Porteur | Règles d'éligibilité, section 6 | Aucun | Responsable mandaté | Manuelle jusqu'à TH-301 |
| Astreinte incidents et sécurité | Porteur, à titre provisoire | Bénévole, plages déclarées | Aucun | Deux personnes au minimum | Une seule personne : exigence des spécifications non satisfaite |
| Sécurité de la CI (gitleaks, Trivy, audits, contrôle LLM) | Porteur | Images épinglées par version et par empreinte `sha256`, mises à jour après au moins deux semaines de publication | Aucun | Responsable mandaté infrastructure | En service (TH-015) |
| Modération et signalements | Administrateurs (le porteur) | Bénévole | Aucun | Rotation, à constituer | Contact de signalement dans `CODE_OF_CONDUCT.md` |
| Registre des décisions et publication FR/EN | Porteur, puis responsables mandatés | Publication sous 7 jours (section 5.6) | Aucun | Tout fondateur | En service (`decisions/`) |
| Journal de campagne pilote et retours à 30 jours | Porteur | Protocole de la mission TH-010 | Aucun | À désigner | Protocole en préparation (TH-010) |
| Formulaire d'inscription de la landing | Porteur | Formulaire hébergé par Brevo, double opt-in ([DEC-2026-003](../../decisions/DEC-2026-003-landing.md)) | À confirmer | Renvoi vers GitHub Discussions | Formulaire non configuré : renvoi actif |
| Relecture des traductions anglaises | Responsable mandaté à désigner, à défaut le porteur | Missions `i18n` | Aucun | À désigner | Spécifications EN en statut `machine` |
| Comité de sélection | Collège des fondateurs | Membres bénévoles | Aucun | Suppléants, à désigner | Section 7 |
| Instance DocuSeal | Responsable de l'hébergement | Auto-hébergée (TH-404) | Aucun | Signature manuelle documentée | Prévue au lot 4 |
| Structure signataire des conventions | Porteur du projet Tokenhood | Kosmio pendant l'amorçage, à confirmer | Aucun | Association dédiée | À trancher avant TH-305 |
| Validation juridique (convention, signature, conditions, RGPD) | Porteur du projet Tokenhood | À trouver | Possible | Aucun | À trancher avant l'admission du projet externe |

Au 20 octobre 2026, toutes les fonctions reposent sur une seule personne. La désignation d'un second administrateur (forge et Coolify) et d'une seconde personne d'astreinte est une condition proposée pour la porte du lot 1 ; la porte du lot 4 exige un responsable et un remplaçant confirmés pour chaque fonction.

### 8.2 Désignation et retrait

- Les titulaires et remplaçants sont désignés par le collège des fondateurs, avec l'accord de la personne désignée, et inscrits dans `decisions/` ; la colonne Responsable est mise à jour dans la même PR, sans amendement de la charte.
- Un titulaire bénévole peut se retirer avec le préavis de l'annexe A, sauf empêchement ; son remplaçant assure l'intérim.
- Le tableau est revu à chaque porte de lot. La mission TH-115 le reprend ensuite dans la plateforme.

### 8.3 Sécurité

- **Signalement** : jamais par une issue ou une discussion publique. Canal privé : signalement privé de vulnérabilité de GitHub dès qu'il est activé (désactivé au 20/10/2026), à défaut le contact de signalement de `CODE_OF_CONDUCT.md`. Une discussion publique, s'il en faut une, dit seulement qu'une question de sécurité a été transmise.
- **Urgence** : un administrateur décide immédiatement (`security.emergency`) ; la décision est publiée sans détail exploitable et ratifiée sous 7 jours (section 5.5).
- **Secret exposé** : révocation d'abord, puis nettoyage ; l'agent qui le découvre applique la conduite `stop` de son skill.

## 9. Engagements

### 9.1 Du projet Tokenhood envers ses contributeurs

- Assigner un vérificateur dans le délai de l'annexe A après l'ouverture d'une PR complète, ou dire publiquement qu'aucun vérificateur éligible n'est disponible.
- Rendre une décision d'intégration (fusion, changements demandés ou rejet motivé) dans le délai de l'annexe A après un rapport de vérification.
- Répondre aux clarifications de catégorie 1 dans le délai cible de 24 h ouvrées.
- Publier des missions aux critères d'acceptation vérifiables, dans les plafonds de flux du manifeste.
- Recueillir le retour à 30 jours de chaque mission intégrée et en publier la synthèse.
- Publier les tokens offerts, les décisions et les résultats de la campagne pilote, avec leur nature (mesuré, déclaré, estimé).

### 9.2 Des contributeurs

- Faire travailler leur agent selon `tokenhood-contribute` ou `tokenhood-verify`, dans les limites du contrat et des politiques.
- Signer chaque commit (DCO, `git commit -s`) en tant qu'humain responsable de l'agent, avec le trailer `Assisted-by`.
- Joindre le rapport de consommation de chaque contribution.
- Déclarer leurs liens d'intérêt et se déporter.
- Respecter les conditions de leur fournisseur d'IA et le code de conduite.

### 9.3 Des fondateurs et des titulaires de fonctions

- Publier les décisions en FR et EN, motivées, dans les délais de la section 5.
- Se déporter dès qu'une décision les concerne.
- Constater la fin de la période fondateurs dès que sa condition est remplie.
- Tenir à jour le tableau d'exploitation et en rendre compte à chaque porte de lot.

## 10. Adoption, révision et fin

- **Adoption** : la version 0.1 est adoptée par la fusion sur `main` de la PR de la mission TH-011, qui vaut décision du collège des fondateurs. Les questions signalées dans cette PR peuvent changer des valeurs avant la fusion.
- **Amendement** : par une décision `charter.amendment` (section 5.5). Les paramètres de l'annexe A suivent la même règle.
- **Corrections de forme et de traduction**, sans effet sur le sens : catégorie 1, par le responsable mandaté spécifications ou le porteur.
- **Versions** : chaque version adoptée porte un numéro et une date et figure à l'historique ; les versions précédentes restent dans l'historique du dépôt.
- **Fin** : les sections 4 et 5 cessent avec le passage des votes dans Tokenhood (section 5.8), la section 6 quand la plateforme coordonne ses missions (lot 2), la section 7 quand l'admission est automatisée (lot 4), la section 8 quand TH-115 tient les engagements d'exploitation. La charte de la plateforme, adoptée par `charter.amendment`, lui succède.

## Annexe A : paramètres

| Paramètre | Valeur | Origine |
| --- | --- | --- |
| Poids des deux collèges | 50 % chacun | Spécifications (gouvernance) |
| Taille à partir de laquelle un collège détient sa moitié | 5 membres | Spécifications ; lecture proposée par TH-011 |
| Fin de la période fondateurs | Chacun des deux collèges compte au moins 5 membres | Spécifications ; lecture proposée par TH-011 |
| Seuil d'entrée au collège des contributeurs | 3 missions acceptées, produites ou vérifiées | Proposition TH-011 |
| Perte de la qualité de membre | 12 mois sans mission acceptée | Proposition TH-011 |
| Durée d'un mandat de responsable | 6 mois, renouvelable | Proposition TH-011 |
| Quorum des types sans quorum dans les spécifications | 50 % | Proposition TH-011 |
| Majorités, délais minimaux et quorums des spécifications | Section 5.5 | Spécifications (gouvernance) |
| Taille d'un panel tiré au sort | 3 membres | Proposition TH-011 |
| Délai de contestation d'un décompte | 48 h | Proposition TH-011 |
| Délai d'assignation d'un vérificateur | 3 jours ouvrés | Proposition TH-011 |
| Délai de décision d'intégration après un rapport de vérification | 5 jours ouvrés | Proposition TH-011 |
| Plafonds de flux | 3 en production, 5 en attente de revue ou d'intégration | Manifeste `.tokenhood/project.yaml`, qui fait foi |
| Fenêtre anti-réciprocité des vérifications | 3 dernières missions | Politique `.tokenhood/policies/review.yaml`, qui fait foi |
| Retour après intégration | 30 jours | Manifeste, qui fait foi |
| Pondérations de la grille d'instruction du pilote | Égales entre les critères | Proposition TH-011 |
| Préavis de retrait d'un titulaire bénévole | 30 jours | Proposition TH-011 |

## Annexe B : tirage au sort reproductible

Un tirage doit pouvoir être refait par n'importe qui, sans que personne ne choisisse le résultat.

1. La liste des personnes éligibles (comptes GitHub en minuscules) est publiée dans le fil avant l'échéance du vote ou de la contestation.
2. La graine est la valeur du premier tour de la balise publique de hasard drand (League of Entropy) publié après cette échéance ; le numéro du tour est indiqué dans le fil.
3. Chaque personne reçoit l'empreinte SHA-256 de « graine:compte ». Les personnes sont classées par empreinte croissante ; les premières forment le panel, les suivantes le remplacent dans l'ordre.
4. Le calcul est publié dans le fil, pour que tout membre puisse le refaire.

## Historique

| Version | Date | Changement |
| --- | --- | --- |
| 0.1 | 20/10/2026 | Première version, mission TH-011 |
