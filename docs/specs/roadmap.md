[Spécifications V2.1](README.md) › Module 22/28 · [English version](en/roadmap.md)

# Roadmap et ordre de développement

La gouvernance est le premier lot produit, après un amorçage. Les agents qui construisent Tokenhood poseront des questions dès leurs premières missions : il faut savoir qui y répond, dans quel délai et avec quelle trace. Le lot 0 coordonne ces premières missions avec une instance de tokenpool et une gouvernance provisoire dans GitHub (Discussions et dossier `decisions/`). La V2.1 confronte le système à un projet externe dès le lot 3 : construire Tokenhood avec Tokenhood ne suffit pas à prouver qu'il convient à un autre projet.

**La gouvernance est le premier lot produit, après un amorçage**\
*Lots de développement et portes ; rythme fixé par les tokens engagés, pas par des dates*

```mermaid
flowchart TB
    accTitle: La gouvernance est le premier lot produit, après un amorçage
    accDescr: Lots de développement et portes ; rythme fixé par les tokens engagés, pas par des dates
    l0["<b>0. Amorçage</b><br>specs, schémas<br>instance tokenpool<br>4 livrables socle<br>missions réelles<br><i>ADR-001, ADR-002</i>"]
    g1{{"Missions réelles<br><i>intégrées à la main</i>"}}
    subgraph mvp["MVP, périmètre complet"]
        l1["<b>1. Gouvernance</b><br>identité, i18n<br>délégations<br>décisions, votes<br>tableau de bord<br>MCP arbitrage"]
        g2{{"Questions d'agents<br><i>traitées et tracées</i>"}}
        l2["<b>2. Missions</b><br>tentatives<br>serveur MCP<br>GitHub App, skills<br>plafonds de flux<br>compatibilité"]
        g3{{"Parcours complet<br><i>limites démontrées</i>"}}
        l3["<b>3. Valeur</b><br>revue croisée<br>retour à 30 jours<br>projet externe<br>campagne pilote"]
        g4{{"Bénéfice net<br><i>constaté en externe</i>"}}
        l4["<b>4. Sélection</b><br>candidature, KYB<br>instruction<br>convention<br>signature<br>onboarding"]
        g5{{"<b>Admission automatisée</b><br><i>exploitation assurée</i>"}}
    end
    l0 --> g1 --> l1 --> g2 --> l2 --> g3 --> l3 --> g4 --> l4 --> g5
    class l1,g5 accent
    classDef accent fill:#e6f1ef,stroke:#0e5450,stroke-width:2px
    classDef agent stroke-dasharray:5 4
    classDef crit fill:#dbeafe,stroke:#2563eb,stroke-width:2px
    classDef tint fill:#f2f3f1
    classDef note fill:none,stroke:none
```

Le périmètre du MVP est conservé en entier, livré en quatre lots ordonnés par dépendance. Les portes vérifient désormais une valeur démontrée plutôt que l'usage interne des fonctionnalités.

| Lot | Contenu | Porte de sortie |
| --- | --- | --- |
| 0. Amorçage | Dépôt, spécifications, schémas, skills plateforme v0, instance tokenpool, gouvernance provisoire ; quatre livrables socle réalisés en missions (matrice des garanties, contrats exécutables du protocole, protocole pilote et mesure de valeur, charte opérationnelle d'amorçage) ; ADR-001 et ADR-002 ; recherche du projet externe pilote | Quelques missions réelles exécutées et intégrées avec coordination et revue manuelles ; difficultés enregistrées ; 5 contributeurs engagés |
| 1. Gouvernance | Identité et inscription, socle i18n FR/EN, agents et engagements, registre des décisions déléguées et mandats, décisions collectives, tableau de bord, outils MCP d'arbitrage | Les questions des agents sont traitées par le registre de décisions et des responsables mandatés, sans dépendre d'un système institutionnel complet |
| 2. Missions | Missions et tentatives, réservations avec générations, plafonds de flux, serveur MCP, GitHub App, skills, compagnon local, registre de compatibilité | Parcours de bout en bout (autorisation, contexte, réservation, exécution, soumission, reprise) ; limites de chaque client démontrées |
| 3. Vérification et valeur | Assignation, revue à périmètre déclaré, invalidation, attente sans vérificateur, audit par échantillonnage, retour à 30 jours ; projet externe admis manuellement ; fin de la campagne pilote | Les revues portent sur les bonnes versions, les défauts de test sont détectés, le projet externe constate un bénéfice net |
| 4. Sélection et consolidation | Candidature, KYB, instruction, conventions, signature DocuSeal et onboarding, automatisés à partir du processus éprouvé | Admission et contractualisation automatisées sur des dossiers réels ; responsabilités d'exploitation confirmées : fin du MVP |

Tokenhood reste le premier bénéficiaire, la gouvernance reste précoce, la revue croisée reste obligatoire et la sélection reste réelle. Pendant les lots 0 à 2, la vérification croisée s'applique à la main : le porteur du projet Tokenhood assigne un vérificateur d'un autre utilisateur, selon les règles d'éligibilité.

**Après le MVP** : GitLab puis Forgejo, nouvelles langues, fédération entre coordinateurs, contributions upstream à tokenpool, missions multimédia avancées, environnements d'exécution vérifiés.

---

← [Interfaces](interfaces.md) · [Sommaire](README.md) · [Campagne pilote et critères de poursuite](campagne-pilote.md) →
