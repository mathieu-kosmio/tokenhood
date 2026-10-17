[V2.1 specifications](../README.md) › Module 20/28 · [Version française](../securite-et-conformite.md)\
*Translation of the French source (translation status: `machine`, pending review).*

# Security and compliance

Security is a property of the tools: each control has a component that enforces it and a test. When that component is missing or cannot be verified, the protection is presented as declarative and the mission is restricted accordingly.

**Threat model**: three targets, the contributors' workstations (which run code coming from the projects), the projects' repositories (which receive contributions from agents) and the platform (which holds identities, contracts and votes).

**Component responsible for each control**

| Control | Component that enforces it | If the component is missing |
| --- | --- | --- |
| Limiting accessible files | Execution environment (container, VM) or local companion | Missions limited to reading and writing, without execution |
| Network restrictions | Execution environment | No execution of the project's code |
| Ban on merging by the agent | Forge permissions (PR from a fork) and server authorisations | Not applicable: always enforced |
| Ban on voting or signing | Business-layer authorisations, by role | Not applicable: always enforced |
| Revocation | API and MCP on the server side, then local stop according to the client's announced capabilities | Declarative local stop, flagged as such |
| Skill loading | `get_context` service: authorised versions, hashes, provenance kept | Not applicable |
| KYB confidentiality | Business layer: access reserved for the committee role, never for agent tokens | Not applicable |

**Risk based on operations.** A mission's risk level takes into account the operations actually executed (installing dependencies, running tests, build scripts), not only the announced deliverable. A `low` mission does not by itself authorise running untrusted code on a non-isolated workstation.

**Measures by risk**

| Risk | Measures |
| --- | --- |
| Running untrusted code at the contributor's | Isolated environment required as soon as a project command is run; no secret mounted; acceptance commands read only from the default branch of a repository under contract |
| Prompt injection via issues, code or resources | Read-only preparation phase; external content tagged as untrusted by the `tokenhood-contribute` skill; policies not modifiable by a skill |
| Malicious contribution to a project | PR from a fork, cross-verification, dependency, secret and licence scans, human merge |
| Leak of sensitive data to a model | No KYB data and no non-public personal data in a mission package; packages checked when built |
| Collusion between contributors | Random assignment, exclusions, detection of reciprocal patterns, sanctions decided in governance |
| Project impersonation | KYB, proof of repository control, signed agreement |
| Manipulation of governance | Verified identity of members, recusal, timestamped and public votes |
| Compromise of the platform | Least privilege, secrets in a vault, append-only audit log, tested encrypted backups |

**Compliance**

- **AI providers' terms**: the platform handles no subscription credential and no provider key. The compatibility register states, per client and per mode, the terms examined and their uncertainties; each contributor remains responsible for complying with the terms of their subscription.
- **GDPR**: minimisation, legal basis per processing, register, retention periods, rights of access, rectification and erasure (anonymisation), hosting in the EU.
- **Intellectual property**: contributions under the project's licence; DCO signed by the human user responsible for the agent; mention of AI assistance in commits (`Assisted-by` trailer).
- **Electronic signature**: level suited to a partnership agreement, legally validated before the first external project.
- **Accessibility**: RGAA and WCAG 2.2 level AA targeted.

**Expected evidence**: each announced protection has an identified mechanism and a test; declarative protections are presented as such.

---

← [Technical architecture](architecture-technique.md) · [Contents](../README.md) · [Interfaces](interfaces.md) →
