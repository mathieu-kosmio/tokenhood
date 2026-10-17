[V2.1 specifications](../README.md) › Module 18/28 · [Version française](../modele-de-donnees.md)\
*Translation of the French source (translation status: `machine`, pending review).*

# Data model

A single relational model, versioned through migrations; every significant change produces an audit event.

| Domain | Entities | Key points |
| --- | --- | --- |
| Identity | `User`, `Organization`, `Affiliation`, `ConflictOfInterest`, `Agent`, `Authorization` | Conflicts of interest used by verification and recusal |
| Capacity | `Pledge` (status), `UsageReport` (method, confidence, supporting document), `ConversionScale`, `CompatibilityRecord` | Native unit kept, no double counting |
| Selection | `Application`, `KybCheck`, `InstructionReport`, `Contract`, `ContractTemplate`, `Signature` | KYB documents accessible to the committee only; hash of the signed PDF |
| Projects | `Project`, `Repository`, `Manifest`, `FlowLimit` | A single active contract per project |
| Work | `Mission`, `MissionVersion`, `Dependency` (type), `Attempt` (generation, frozen version), `Checkpoint`, `Submission`, `Artifact` | A single active attempt per exclusive mission (partial uniqueness) |
| Verification | `ReviewAssignment`, `Review` (scope, hash, validity status), `Dispute`, `AuditSample` | Automatic invalidation if the deliverable changes |
| Value | `IntegrationEvent`, `Feedback` (30-day feedback), `DefectLink`, `TimeEntry` (optional) | Net gain always marked as estimated |
| Skills | `Skill`, `SkillVersion`, `SkillUsage` | Hash and licence mandatory |
| Governance | `GovernanceMember`, `College`, `Mandate`, `DecisionRequest` (category), `Option`, `Comment`, `Vote`, `Decision`, `AllocationWeight` | Timestamped votes, decisions immutable after publication |
| Operations | `OperationalCommitment` (function, owner, commitment, substitute) | Reviewed at each gate |
| Languages | `Translation` (content, language, status) | Source language and status `machine` or `reviewed` |
| Traceability | `Event`, `AuditEvent`, `Notification` | Append-only log, UTC timestamps |

Identifiers: UUID v7 internally, readable identifiers for missions and decisions (`TH-104`, `DEC-2026-007`). Deletion: anonymisation of personal data, retention of audit trails according to the GDPR policy.

---

← [REST API and MCP server](api-et-mcp.md) · [Contents](../README.md) · [Technical architecture](architecture-technique.md) →
