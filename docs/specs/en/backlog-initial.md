[V2.1 specifications](../README.md) › Module 24/28 · [Version française](../backlog-initial.md)\
*Translation of the French source (translation status: `machine`, pending review).*

# Initial backlog of the Tokenhood project

First missions to publish in `.tokenhood/missions/` of the `tokenhood` repository, numbered by lot (TH-0xx for lot 0, TH-1xx for lot 1, etc.). The four foundation deliverables are in bold. `governance.instruction` missions prepare decisions without taking them. Complete modules are broken down into atomic missions, each with a modifiable scope and a proof of completion.

| ID | Lot | Type | Mission | Depends on |
| --- | --- | --- | --- | --- |
| TH-001 | 0 | docs | Publish the V2.1 specifications in `docs/specs/`, one file per module, FR and EN | None |
| TH-002 | 0 | code | JSON Schema for the formats (manifest, mission, attempt, review report, arbitration request) and versioned examples | TH-001 |
| TH-003 | 0 | code | CI: parser and schema validation of `.tokenhood/` and of the examples | TH-002 |
| TH-004 | 0 | docs | Skill `tokenhood-contribute` v0 (protocol, rule of conduct, security) | TH-002 |
| TH-005 | 0 | docs | Skill `tokenhood-verify` v0 (declared scope, report template) | TH-002 |
| TH-006 | 0 | governance.instruction | Audit of the tokenpool code, file for ADR-001 | None |
| TH-007 | 0 | governance.instruction | Options file for ADR-002 (technical stack) | TH-001 |
| TH-008 | 0 | docs | **Guarantee matrix** v1 and initial compatibility register | TH-001 |
| TH-009 | 0 | docs | **Executable protocol contracts**: states, transitions, authorisations, generations, versions, resumption, edge cases, conformance tests | TH-002 |
| TH-010 | 0 | research | **Pilot protocol and value measurement**: choice of missions, recorded data, 30-day feedback, campaign report template | TH-001 |
| TH-011 | 0 | docs | **Bootstrap operating charter**: responsibilities, delegations, provisional admission, operations, commitments, FR and EN | TH-001 |
| TH-012 | 0 | governance.instruction | Search for an external pilot project and manual admission file | TH-011 |
| TH-101 | 1 | code | Monorepo skeleton, CI, i18n foundation (`locales/fr`, `locales/en`) | ADR-002 |
| TH-102 | 1 | code | Identity: GitHub OAuth, profile, languages | TH-101 |
| TH-103 | 1 | code | Identity: conflicts of interest and calculation of exclusions | TH-102 |
| TH-104 | 1 | code | Governance: voting eligibility, recusal, choice of college | TH-103 |
| TH-105 | 1 | code | Governance: model and transitions of an arbitration request, categories | TH-102 |
| TH-106 | 1 | code | Governance: result calculation by voting mode, quorum after recusal, panel | TH-104, TH-105 |
| TH-107 | 1 | code | Governance: register of delegated decisions and mandates | TH-105 |
| TH-108 | 1 | code | Governance: bilingual publication and export to `decisions/` | TH-106, TH-107 |
| TH-109 | 1 | code | Capacity: agents, authorisations, pledges and statuses | TH-102 |
| TH-110 | 1 | design | Mock-ups of the governance console and the dashboard | TH-011 |
| TH-111 | 1 | code | Dashboard: pledged and available capacity, need, coverage | TH-109, TH-110 |
| TH-112 | 1 | code | MCP tools `request_arbitration`, `get_decision`, `list_decisions` | TH-105 |
| TH-113 | 1 | i18n | EN proofreading of all lot 1 strings | TH-111 |
| TH-201 | 2 | code | Missions: contract, versions, typed dependencies, life cycle | TH-009, TH-102 |
| TH-202 | 2 | code | Attempts: claims with generations, heartbeat, checkpoints, tokenpool-compatible | TH-201, ADR-001 |
| TH-203 | 2 | code | Flow limits per project and regulation | TH-202 |
| TH-204 | 2 | code | MCP server: discovery, production, `get_guarantees` | TH-202 |
| TH-205 | 2 | code | GitHub App: indexing, PR from a fork, integration events | TH-201 |
| TH-206 | 2 | code | Skills module and `get_context` | TH-201 |
| TH-207 | 2 | code | Local companion: caps by level, controlled stop | TH-204 |
| TH-208 | 2 | research | Compatibility tests per client and update of the register | TH-207, TH-008 |
| TH-301 | 3 | code | Assignment of verifications, exclusions, waiting without a reviewer | TH-202, TH-103 |
| TH-302 | 3 | code | Reports with declared scope, binding to the hash, invalidation | TH-301 |
| TH-303 | 3 | code | Disagreements, disputes, sampling audit | TH-302, TH-106 |
| TH-304 | 3 | code | 30-day feedback and net value indicators | TH-205 |
| TH-305 | 3 | governance.instruction | Manual admission and agreement of the external pilot project | TH-012 |
| TH-306 | 3 | research | Pilot campaign report | TH-304, TH-305, TH-010 |
| TH-401 | 4 | code | Application and case tracking | TH-102 |
| TH-402 | 4 | code | KYB connectors, access reserved for the committee | TH-401 |
| TH-403 | 4 | docs | Agreement template v1, drawn from the pilot agreements | TH-305 |
| TH-404 | 4 | code | Agreement generation and DocuSeal integration | TH-403, TH-401 |
| TH-405 | 4 | code | Onboarding assistant (PR `.tokenhood/`) | TH-205, TH-404 |

---

← [Pilot campaign and continuation criteria](campagne-pilote.md) · [Contents](../README.md) · [MVP acceptance criteria](recette-mvp.md) →
