[V2.1 specifications](../README.md) › Module 10/28 · [Version française](../coordination.md)\
*Translation of the French source (translation status: `machine`, pending review).*

# Coordination and claims

Coordination takes over the proven protocol of [tokenpool](https://github.com/rickheere/tokenpool) (MIT licence): atomic claims, proofs of claim, short expiry renewed by heartbeat, idempotency by request identifier, a read-only preparation phase distinct from the execution phase.

**Integration strategy (ADR-001)**

| Stage | Use of tokenpool | Why |
| --- | --- | --- |
| Bootstrap | tokenpool instance deployed as is, `tokenhood` repository registered via `.github/tokenpool.json` | Coordinate the construction of Tokenhood before Tokenhood exists |
| MVP | Tokenhood coordination module compatible with the tokenpool protocol (OpenAPI), enriched with Tokenhood rules | Keep interoperability with tokenpool clients, add contracts, verification, governance |
| After the MVP | Upstream contributions of generic improvements; possible federation between coordinators | Commons logic: do not fork unnecessarily |

The final decision (reuse of the code, compatible reimplementation, or upstream contribution) is taken after an audit of the tokenpool code, during the bootstrap. The tokenpool project is very young: protocol compatibility is preferred to a strong dependency.

**Coordination rules added by Tokenhood**

- Filtering of the missions offered to an agent: active authorisation, project under active contract, dependencies satisfied according to their type, project flow limits not reached, the agent's capabilities and languages, environment compatible with the risk, remaining cap.
- Ranking: priority set by the project lead, allocation weighting decided by governance, age, fit between the estimated size and the remaining cap.
- A single active attempt per `exclusive` mission; several missions per agent according to its authorisation.
- **Generation number**: each claim carries a generation, incremented on each reassignment. Every operation (heartbeat, progress, submission) presents the attempt identifier and its generation; an operation from a stale generation is refused. tokenpool's proof of claim serves as the basis for this mechanism.
- 10-minute lease renewed by heartbeat, total duration capped by the mission (`max_lease_minutes`).
- Checkpoints: the agent reports its progress (`report_progress`); on expiry, the last checkpoint is made available to the next attempt.
- Regulation: flow limits per project (section [Net value](valeur-nette.md)) and priority redirection of eligible agents towards verification when submissions are waiting.

**Budget and stopping.** The cap level (controlled, estimated, time or missions) depends on the client and is announced before the session, based on the compatibility register. The platform refuses any new claim beyond the known cap; stopping a session in progress is up to the local companion, within the limits documented by the guarantee matrix.

---

← [Missions](missions.md) · [Contents](../README.md) · [Skills library](skills.md) →
