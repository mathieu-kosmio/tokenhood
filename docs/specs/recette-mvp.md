[Spécifications V2.1](README.md) › Module 25/28 · [English version](en/recette-mvp.md)

# Critères de recette du MVP

Le MVP est recetté quand les critères ci-dessous sont démontrés et que la campagne pilote a produit ses trois démonstrations.

**Protocole**

- [ ] Projet avec 3 missions dépendantes ; une dépendance `integrated` reste bloquante tant que la mission préalable n'est pas fusionnée
- [ ] Deux réservations exclusives concurrentes : une seule réussit
- [ ] Après expiration et réattribution, toute opération de l'ancienne génération est refusée ; la nouvelle tentative reprend au dernier checkpoint
- [ ] Changement incompatible du contrat pendant une tentative : migration ou libération, jamais de poursuite silencieuse
- [ ] Tentative en `awaiting_decision` : bail suspendu, reprise après décision
- [ ] Plafond de flux atteint : plus aucune nouvelle production proposée sur le projet

**Vérification et valeur**

- [ ] Le vérificateur assigné n'est jamais le producteur ni un utilisateur lié (jeux de données adverses)
- [ ] Sans vérificateur éligible, la tentative attend en `awaiting_reviewer` sans assouplissement des règles
- [ ] Une modification du livrable après vérification invalide l'approbation
- [ ] Des défauts introduits volontairement dans un jeu d'essai sont détectés ; les rapports déclarent leurs limites
- [ ] Distinction visible entre soumis, accepté, intégré et jugé utile ; retour à 30 jours collecté et agrégé

**Garanties et sécurité**

- [ ] Niveau de plafond affiché avant chaque session ; arrêt contrôlé démontré pour chaque client annoncé compatible
- [ ] Un jeton d'agent est refusé sur vote, signature, fusion et pièces KYB, y compris par appel REST direct
- [ ] Révocation d'une autorisation : refus immédiat de toute opération ultérieure
- [ ] Mission exécutant du code refusée à un environnement déclaré non isolé
- [ ] Aucun appel à un fournisseur de LLM depuis les serveurs (contrôle des flux sortants)

**Capacité et gouvernance**

- [ ] La capacité mobilisable exclut les engagements expirés, retirés ou affectés ; aucune enveloppe comptée deux fois ; unité native et niveau de confiance consultables
- [ ] Question d'un agent traitée par un responsable mandaté dans le délai cible, avec une réponse exploitable
- [ ] Décision collective votée avec déport, quorum recalculé, publiée en FR et EN
- [ ] Décision `allocation.weights` appliquée automatiquement au classement des missions du pot commun

**Sélection, langues, accessibilité**

- [ ] Admission manuelle du projet externe enregistrée (lot 3), puis parcours automatisé complet : candidature, KYB, instruction sans pièces KYB, vote, convention signée et archivée avec empreinte (lot 4)
- [ ] Mission `i18n` générée automatiquement à partir d'une clé de traduction manquante
- [ ] Audit d'accessibilité AA sur les parcours d'inscription, de gouvernance et de candidature

---

← [Backlog initial du projet Tokenhood](backlog-initial.md) · [Sommaire](README.md) · [Risques et questions ouvertes](risques-et-questions-ouvertes.md) →
