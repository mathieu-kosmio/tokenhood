[V2.1 specifications](../README.md) › Module 14/28 · [Version française](../capacite.md)\
*Translation of the French source (translation status: `machine`, pending review).*

# Capacity and non-market economy

Tokenhood organises a contribution in agentic capacity without selling or transferring tokens; no payment goes through the platform. Its operation relies on identified commitments in infrastructure, in human work and, when necessary, in funding (section [Operations and continuity](exploitation.md)).

**Four distinct notions**

| Notion | Meaning | Source |
| --- | --- | --- |
| Pledged capacity | What the contributor plans to devote over a period | Commitment (pledge) |
| Available capacity | What an available and compatible agent can take on now | Recently seen agents, compatible capabilities and languages, remaining cap |
| Consumed capacity | What the execution reports indicate | Usage reports, with their provenance |
| Result obtained | What was accepted, integrated and judged useful | Verification, forge, 30-day feedback |

**Pledge.** A contributor pledges capacity for a period, in the native unit of their mode:

| Mode | Native unit | Measurement method |
| --- | --- | --- |
| API | Tokens or amount | Provider's counter, reported by the client |
| Subscription | Agent hours or number of missions | Duration or count, reported by the client |
| Local model | Agent hours | Reported duration |

A pledge has a status: `active`, `expired`, `withdrawn`, or `allocated` (already assigned to an attempt in progress).

**Measurement method and confidence level** are two separate dimensions. The method says where the figure comes from: provider's counter, duration, estimate. The confidence says what Tokenhood knows about it: `client_reported` (passed on by the client), `evidenced` (supporting document attached, for example an export from the provider), `reconciled` (cross-checked against another source). A measurement taken from a counter and then passed on by a client remains `client_reported` as long as no reconciliation has been done.

**Token-equivalents.** Projection unit of the dashboard, calculated with public scales, versioned and decided in governance. They do not measure an intrinsic value, do not prove an expense and do not ground any political right.

**Aggregation rules**

- Expired, withdrawn or already allocated pledges do not count towards available capacity.
- Every aggregation keeps the native unit, the source and the confidence level of the underlying data, viewable on hover and on export.
- The same envelope is never counted twice, neither between earmarked and pooled, nor between two periods.

**Earmarking.** A pledge is earmarked for a specific project (only its missions are offered to the agent) or pooled in the common pool (governance sets allocation weightings between projects). The platform moves no tokens: an allocation translates into an order of priority in the missions offered.

**Expected evidence**: the dashboard does not count the same envelope twice and does not present an old pledge as an available resource.

---

← [Non-code contributions and internationalisation](non-code-et-i18n.md) · [Contents](../README.md) · [Operations and continuity](exploitation.md) →
