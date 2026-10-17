[Spécifications V2.1](README.md) › Module 18/28 · [English version](en/modele-de-donnees.md)

# Modèle de données

Un modèle relationnel unique, versionné par migrations ; toute modification significative produit un événement d'audit.

| Domaine | Entités | Points clés |
| --- | --- | --- |
| Identité | `User`, `Organization`, `Affiliation`, `ConflictOfInterest`, `Agent`, `Authorization` | Liens d'intérêt exploités par la vérification et le déport |
| Capacité | `Pledge` (statut), `UsageReport` (méthode, confiance, justificatif), `ConversionScale`, `CompatibilityRecord` | Unité native conservée, aucune double comptabilisation |
| Sélection | `Application`, `KybCheck`, `InstructionReport`, `Contract`, `ContractTemplate`, `Signature` | Pièces KYB accessibles au seul comité ; empreinte du PDF signé |
| Projets | `Project`, `Repository`, `Manifest`, `FlowLimit` | Un seul contrat actif par projet |
| Travail | `Mission`, `MissionVersion`, `Dependency` (type), `Attempt` (génération, version figée), `Checkpoint`, `Submission`, `Artifact` | Une seule tentative active par mission exclusive (unicité partielle) |
| Vérification | `ReviewAssignment`, `Review` (périmètre, empreinte, statut de validité), `Dispute`, `AuditSample` | Invalidation automatique si le livrable change |
| Valeur | `IntegrationEvent`, `Feedback` (retour à 30 jours), `DefectLink`, `TimeEntry` (facultatif) | Gain net toujours marqué comme estimé |
| Skills | `Skill`, `SkillVersion`, `SkillUsage` | Empreinte et licence obligatoires |
| Gouvernance | `GovernanceMember`, `College`, `Mandate`, `DecisionRequest` (catégorie), `Option`, `Comment`, `Vote`, `Decision`, `AllocationWeight` | Votes horodatés, décisions immuables après publication |
| Exploitation | `OperationalCommitment` (fonction, responsable, engagement, remplaçant) | Revu à chaque porte |
| Langues | `Translation` (contenu, langue, statut) | Langue source et statut `machine` ou `reviewed` |
| Traçabilité | `Event`, `AuditEvent`, `Notification` | Journal en ajout seul, horodatage UTC |

Identifiants : UUID v7 en interne, identifiants lisibles pour missions et décisions (`TH-104`, `DEC-2026-007`). Suppression : anonymisation des données personnelles, conservation des traces d'audit selon la politique RGPD.

---

← [API REST et serveur MCP](api-et-mcp.md) · [Sommaire](README.md) · [Architecture technique](architecture-technique.md) →
