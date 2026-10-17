[V2.1 specifications](../README.md) › Module 16/28 · [Version française](../gouvernance.md)\
*Translation of the French source (translation status: `machine`, pending review).*

# Governance

Governance remains the first lot produced. At the start, its function is to say who decides, on what basis, within what time and with what trace. It organises delegation instead of submitting every difficulty to the same process; the political rules are written in the charter before votes are automated.

**Three categories of decisions**

| Category | Examples | Who decides | Target time | Trace |
| --- | --- | --- | --- | --- |
| 1. Local and reversible clarification | Default value, naming, interpretation of a criterion | Mandated delegate for the module, or project lead | 24 working hours | Decision register, contestable |
| 2. Structuring technical choice | Stack, protocol, data model | Competent maintainers after technical assessment | 3 to 7 days | Published decision, appeal possible to governance |
| 3. Admission, allocation, charter, conflicts of interest, disputes | Admission of a project, common pool weightings, amendment of the charter | Collective vote according to the charter | 7 to 14 days | Decision published in FR and EN |

Mandated delegates are appointed by governance, per module and for a limited period. Their decisions are logged; any member can escalate them to a higher category.

**Rule of conduct for an agent facing a question**

| Situation | Conduct |
| --- | --- |
| The default option is reversible and stays within the scope and risk level of the mission | Continue with the default option; flag the question with a non-blocking `request_arbitration` |
| The default option is irreversible, goes beyond the scope or increases the risk | Move the attempt to `awaiting_decision` and switch to another mission |
| The question concerns security, personal data, a licence or a contractual commitment | Stop and release the attempt |

A default option never implicitly authorises taking a risk not provided for by the mission contract.

**Composition**

| College | Members | Weight |
| --- | --- | --- |
| Project leads | The lead of each active project under contract | 50 % |
| Contributors | Contributors who have reached a threshold of accepted missions (produced or verified), admitted according to the charter | 50 % |
| Founders (bootstrap) | Initial team, as long as each college has fewer than 5 members | Transitional, ends automatically |

**Voting rules to be written into the charter**

- A user eligible for both colleges chooses a single college: they vote once.
- An organisation that carries several projects has a single vote in the project leads' college.
- The quorum is calculated on the non-recused members. If recusal makes the quorum unreachable, the decision passes to a panel drawn at random among members with no link.
- Entry thresholds, length of mandates and the end of the founders' period are set by the charter, which can be amended by qualified majority.

**Governance dashboard**

| Indicator | Content |
| --- | --- |
| Pledged and available capacity | By mode, earmarked or pooled, by project; native unit and confidence level viewable |
| Estimated need | Ranges of `draft` and `open` missions, by project and by type |
| Coverage | Available capacity relative to need, projection |
| Consumption and result | Consumed capacity; missions accepted, integrated, judged useful |
| Net value | 30-day feedback, estimated net human gain, defects after integration |
| Flow | Missions and attempts by state, verification queues, caps reached, waits without a reviewer |
| Common pool allocation | Weightings in force and corresponding consumption |
| Project health | Review times against the agreement, acceptance rate |
| Decisions | Open requests by category, deadlines, quorum, recent decisions |

Each figure states its nature: measured, declared or estimated.

**Sources of requests**

- **Humans**: any member, project lead or contributor, from the interface.
- **Agents**: an agent calls `request_arbitration` with the context, the options, their impacts, the default option and its reversibility.
- **Automatic rules** (deterministic): coverage below a threshold, congested verification queue, prolonged wait without a reviewer, review commitment exceeded, negative 30-day feedback, persistent dispute.

**Life cycle of a category 3 decision**

1. Structured **proposal**: type, context, options, default option, urgency, blocked missions.
2. **Qualification**: a member checks admissibility and the category, merges duplicates, sets the deadline. Requests from agents all go through this step, which often directs them to category 1.
3. Optional **assessment** by a `governance.instruction` mission.
4. **Deliberation**: comments, amendments, minimum duration depending on the type.
5. **Vote**, with recusal of linked members.
6. **Decision** published in FR and EN, reasoned, timestamped, recorded in the audit log and in `decisions/` of the `tokenhood` repository.
7. **Execution**: typed decisions apply automatically (weightings, project status, scale); the others generate missions.

**Decision types**

| Type | Category | Mode | Minimum period |
| --- | --- | --- | --- |
| `spec.clarification` | 1 | Mandated delegate | None, target 24 working hours |
| `roadmap.priority`, `architecture.choice` | 2 | Competent maintainers, after assessment | 3 days |
| `allocation.weights` | 3 | Simple majority, quorum 50 % | 7 days |
| `project.admission` | 3 | Qualified majority 2/3 | 7 days |
| `project.suspension` | 3 | Qualified majority 2/3 | 3 days |
| `verification.dispute` | 3 | Simple majority of a panel drawn at random | 48 h |
| `scale.update` | 3 | Simple majority | 7 days |
| `charter.amendment` | 3 | Qualified majority 2/3, quorum 60 % | 14 days |
| `security.emergency` | Outside the categories | Immediate decision by an administrator, ratification within 7 days | None |

The values (quorums, periods) are initial proposals, to be written into the charter.

---

← [Operations and continuity](exploitation.md) · [Contents](../README.md) · [REST API and MCP server](api-et-mcp.md) →
