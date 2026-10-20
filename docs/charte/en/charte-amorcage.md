[Bootstrap charter](../README.md) · [Version française](../charte-amorcage.md)\
*Translation of the French source (translation status: `machine`, pending review).*

# Bootstrap operating charter

| | |
| --- | --- |
| Version | 0.1, 20 October 2026 |
| Drafting | Mission [TH-011](../../../.tokenhood/missions/TH-011.yaml), by a contributor's agent; no value in it is decided by the agent |
| Adoption | By the merge into `main`, which counts as a decision of the founders' college (section 10) |
| Source language | French; this English version is a translation (status `machine`, pending review) |
| Adjustable values | [Appendix A](#appendix-a-parameters), with the origin of each |

## 1. Purpose and scope

The charter states who decides, who operates and who commits during the bootstrap of Tokenhood, as long as the platform does not carry its own governance. It sets what the V2.1 specifications delegate to it: voting rules, entry thresholds for the contributors' college, mandates, the end of the founders' period ([Governance](../../specs/en/gouvernance.md)), holders of the operational functions ([Operations and continuity](../../specs/en/exploitation.md)), fallback coordination without tokenpool ([development plan](../../specs/en/plan-de-developpement.md), plan risks).

It applies to the Tokenhood project (project no. 1, bootstrap contract `CTR-2026-000` in the [manifest](../../../.tokenhood/project.yaml)) and, for admission, to the external pilot project of lot 3.

**Order of precedence**

1. The principles of section 2 and the project policies (`.tokenhood/policies/`), which the charter cannot relax.
2. The charter, for the points the specifications delegate to it.
3. The V2.1 specifications (`docs/specs/`) and the development plan.
4. The decisions published in `decisions/`, which apply the charter or amend it under section 10.

A contradiction between the charter and the specifications on any other point is handled through a `spec.clarification` request, never through a silent exception.

## 2. Principles

- **Non-market**: nothing is sold or transferred; no payment goes through Tokenhood.
- **Model-free orchestrator**: no call to an LLM provider on the server side, no provider key stored.
- **Humans decide**: only humans vote, sign, approve and merge. An agent produces, verifies, assesses and requests arbitration; it has no decision-making role.
- **Cross-verification** by the agent of another user, with no declared link to the producer; merging is always human.
- **All work goes through a mission** in `.tokenhood/missions/`, including the drafting of this charter.
- **Bilingual**: category 3 decisions and governance documents are published in French and English.
- **Transparency**: decisions, tokens given and results are public; each figure states whether it is measured, declared or estimated.

## 3. Bootstrap actors

The roles are those of the specifications ([Actors and roles](../../specs/en/acteurs-et-roles.md)); the table states how they are exercised before the platform exists.

| Role | During bootstrap | Holders on 20/10/2026 |
| --- | --- | --- |
| Tokenhood project lead | Publishes missions, assigns reviewers, approves and merges, holds the operational functions that have no other holder | `@mathieu-kosmio` (Kosmio) |
| Founders' college | Exercises the weight of the colleges with fewer than 5 members (section 5.2) and acts as interim selection committee | Initial team: the project lead. Any other founder is recorded by a decision in `decisions/` |
| Project leads' college | The lead of each active project under agreement, one vote per organisation | Tokenhood only |
| Contributors' college | Contributors admitted under section 5.1 | No member admitted |
| Mandated delegate | Settles the category 1 clarifications of a module (section 4.2) | None appointed: the project lead by default |
| Selection committee | Interim admission of the pilot project (section 7) | Founders' college |
| Administrator | Forge, Coolify, moderation, incidents, technical execution of decisions | The project lead |
| Contributor, producing agent, reviewing agent | As in the specifications; coordination under section 6 | Open to anyone registered on GitHub |

## 4. Decisions and delegation

### 4.1 Three categories

| Category | Who decides during bootstrap | Time | Where | Trace |
| --- | --- | --- | --- | --- |
| 1. Local and reversible clarification | Mandated delegate for the module, otherwise the project lead | Target 24 working hours | Discussion "[TH-xxx] subject" (Clarifications category, General until it exists) or the mission PR | Answer in the thread; file `decisions/DEC-YYYY-NNN-title.md` if the answer sets a lasting rule |
| 2. Structuring technical choice | Competent maintainers (on 20/10/2026, the project lead, sole maintainer), after assessment by a `governance.instruction` mission | At least 3 days between publication of the file and the decision | PR that adds the file and the draft decision to `decisions/` | Decision (ADR) in `decisions/`, adopted by the merge |
| 3. Collective decision | Vote under section 5 | Minimum time of the type (section 5.5), target 7 to 14 days | Discussion "[Vote] type: subject" (Decisions category, General until it exists) | Reasoned decision in FR and EN in `decisions/`, with the count |

The charter does not apply retroactively: decisions DEC-2026-001 to DEC-2026-004, taken by the project lead before its adoption, remain in force.

### 4.2 Mandated delegates

- **Appointment**: by the founders' college during the founders' period, then by a category 3 vote; with the consent of the person appointed; recorded in `decisions/`.
- **Modules**: at least "specifications" (`docs/specs/`, `schemas/`, `skills/`) and "infrastructure" (image, `compose.yaml`, CI, Coolify), in line with day 0 of the plan. Further modules are created the same way.
- **Mandate**: length set in appendix A, renewable, revocable at any time by the body that granted it.
- **Limits**: a delegate does not settle a question that concerns their own contribution; they refer it to the project lead or to another delegate. Their decisions are logged in the question thread.
- **Default**: as long as a module has no delegate, the project lead acts in their place.

### 4.3 Agents' questions

An arbitration request follows `schemas/arbitration-request.schema.json`. During bootstrap, `raised_by` names the human contributor and the agent is named in `context` ([DEC-2026-004](../../../decisions/DEC-2026-004-skill-contribute-amorcage.md)).

| Agent conduct | Handling during bootstrap |
| --- | --- |
| `continue` | Question listed in the PR with the option chosen; the project lead confirms or changes it before the merge. A confirmation that sets a lasting rule is recorded in `decisions/` |
| `switch_mission` | Clarification discussion, `awaiting-decision` label on the PR or issue; the decision is made within the time of its category |
| `stop` | Private channel of section 8.3; nothing public beyond a note that a question has been passed on |

Qualification (admissibility, category, duplicates, deadline) falls to the project lead or to the mandated delegate for the module; it steers most agents' questions to category 1.

### 4.4 Appeal

Any member of a college, and during bootstrap any contributor with at least one accepted mission, can escalate a category 1 or 2 decision to a higher category through a reasoned discussion. The contested decision keeps applying until the new decision.

## 5. Interim voting rules

They apply to category 3 decisions as long as votes are not supported by Tokenhood itself (lot 1). The figures are listed again in appendix A.

### 5.1 Admission to the colleges

- **Project leads' college**: the lead of each active project under agreement joins when the agreement is signed. An organisation that carries several projects has a single vote in it.
- **Contributors' college**: a user who has reached the threshold of appendix A in accepted missions (produced or verified) on projects under agreement, Tokenhood included, is admitted on request.
- **Request**: discussion "[College] admission of @account", with links to the accepted missions and a public declaration of interest links (organisations, projects linked through employment, maintenance or funding).
- **Identity**: the enhanced verification required of governance members is done privately with the project lead. No identity document or data is published, added to the repository or passed to an agent; the admission decision only states that the verification took place.
- **Finding**: the project lead or a mandated delegate checks the conditions and publishes the admission in `decisions/` within 5 working days. It is a category 1 finding, open to appeal under section 4.4.
- **A single college**: a user eligible for both colleges chooses theirs in their request; they vote once.
- **Loss of membership**: after the inactivity period of appendix A without an accepted mission, or at the end of the project's agreement for a lead. A new accepted mission reopens admission.

### 5.2 Electorate and weight

A category 3 vote brings together two halves of equal weight:

| Half | Weight | Held by |
| --- | --- | --- |
| Project leads | 50 % | The project leads' college if it has at least 5 members, otherwise the founders' college |
| Contributors | 50 % | The contributors' college if it has at least 5 members, otherwise the founders' college |

- In each half, each non-recused member of its holder has one vote.
- Each user votes only once. A founder who is a member of a college holding its half chooses, for the whole founders' period, to vote as a founder or in that college; their choice is published.
- When the founders' college holds both halves, it votes once and its result counts for both.

### 5.3 Quorum and result

- **Quorum**: in each half, the number of voters (for, against or abstaining) reaches at least the quorum of the type, relative to the non-recused members of its holder.
- **Share in favour** of a half: votes for / (votes for + votes against). Abstentions count towards the quorum, not in the share. If a half casts no vote for or against, the result is the share of the other half.
- **Result**: average of the two shares in favour. Simple majority: result strictly above 1/2. Qualified majority: result of at least 2/3.
- **Quorum not reached**: the vote is extended once, by a period equal to the minimum time of the type and of at least 48 h. Without a quorum at the end, the proposal is not adopted; it can be submitted again.

### 5.4 Recusal and panel drawn at random

- **Mandatory recusal** of a member for any decision that directly concerns them: their own contribution, a mission they produced or verified, a project they maintain, fund or have declared a link to, the organisation that employs them or that they represent, their own appointment or removal.
- **Declaration**: by a comment "Recusal: reason" before the deadline. Any member can ask for another member's recusal; a dispute is settled by the founders not concerned, otherwise by a panel.
- **Quorum**: calculated on the non-recused members.
- **Panel**: if recusal makes the quorum unreachable in a half, the decision passes to a panel of the size set in appendix A, drawn at random under appendix B among the members of the colleges and the founders with no link to the subject. The panel decides by the majority of the type, within at least 48 h. A panel member who does not vote within that time is replaced by the next one in the draw.
- **Panel impossible** (fewer eligible people than its size): section 5.7.

### 5.5 Decision types

| Type | Majority | Quorum | Minimum time | Origin |
| --- | --- | --- | --- | --- |
| `allocation.weights` | Simple | 50 % | 7 days | Specifications |
| `project.admission` | Qualified 2/3 | 50 % | 7 days | Specifications, quorum proposed |
| `project.suspension` | Qualified 2/3 | 50 % | 3 days | Specifications, quorum proposed |
| `verification.dispute` | Simple, panel drawn at random | Full panel | 48 h | Specifications |
| `scale.update` | Simple | 50 % | 7 days | Specifications, quorum proposed |
| `charter.amendment` | Qualified 2/3 | 60 % | 14 days | Specifications |
| Other category 3 decision (licence, signing entity, lot gate, continuation after the pilot) | Simple | 50 % | 7 days | Proposed |
| `security.emergency` | Immediate decision by an administrator, ratified within 7 days by simple majority | 50 % | None | Specifications |

For `verification.dispute`, the panel is drawn among members with no link to the producer, the reviewers and the project concerned.

### 5.6 How a vote runs on GitHub

1. **Proposal**: discussion "[Vote] type: subject", with a structured request that follows `schemas/arbitration-request.schema.json` (type, context, options, default option, urgency, blocked missions), in French or in English.
2. **Qualification**: a founder or a mandated delegate checks admissibility and category, merges duplicates, freezes the version put to the vote (link to the comment) and announces the deadline: qualification plus the minimum time of the type, and at least 48 h. Target: 2 working days after the proposal.
3. **Deliberation and vote**: until the deadline, each member votes with a new comment "Vote: for", "Vote: against" or "Vote: abstain". Only each member's last vote counts. Edited comments, reactions and GitHub polls do not count. An amendment to the frozen version cancels the votes and opens a new deadline.
4. **Count**: at the deadline, a founder or a mandated delegate posts in the thread the list of votes, the recusals, the quorum of each half, the shares in favour and the result. Any member can contest the count within 48 h; the correction is a category 1 decision.
5. **Publication**: the decision, reasoned, timestamped, in FR and EN, with the count and the link to the thread, is added to `decisions/` through a PR within 7 days.
6. **Execution**: the decision generates the missions or human actions it calls for.

### 5.7 Bootstrap clause: a single founder

As long as the founders' college has only one person and holds both halves, a category 3 decision is in effect a decision of the project lead. It is taken only after the minimum public deliberation time of the type, and the published decision answers each reasoned objection received in the thread. Any contributor with at least one accepted mission can raise an objection.

If the project lead must recuse themselves and no panel is possible, the decision is postponed, unless it blocks a mission or a lot gate. In that case, the project lead takes it while publicly declaring the conflict, and it is automatically re-examined by the governance set up in lot 1.

### 5.8 End of the founders' period and move to the platform

- **Automatic end** of the founders' period when each of the two colleges has at least 5 members. The finding is published in `decisions/` within 7 days; votes opened after the finding are held without the founders' college. Each half passes to its college as soon as that college reaches 5 members, without waiting for the other.
- **Review at each lot gate**: the composition of the founders' college, the thresholds and the operations table are reviewed and published.
- **Move to the platform**: when votes are supported by Tokenhood (TH-104 to TH-108), the interim GitHub governance is closed and its history imported. Interim decisions remain in force; any member can request their re-examination as a category 3 decision within the following three months.

## 6. Mission coordination

As long as the platform does not coordinate its own missions (lots 0 to 2), coordination relies on GitHub. The manual path below is the current path while `.github/tokenpool.json` is `"enabled": false`, and the fallback if the tokenpool instance becomes unavailable.

| Step | Rule | Owner |
| --- | --- | --- |
| Publication | Contract `.tokenhood/missions/TH-xxx.yaml` added through a PR, `status: open`, priority set by the project lead | Project lead |
| Claim | With tokenpool: `.github/tokenpool.md`. Without tokenpool: comment "Réservation TH-xxx, contrat version N, par @compte (agent : client, modèle), jusqu'à AAAA-MM-JJ HH:MM UTC" in a discussion "Réservation TH-xxx" or on the mission issue ([DEC-2026-004](../../../decisions/DEC-2026-004-skill-contribute-amorcage.md)). A mission the project lead entrusts to their own agent is claimed by that request | Contributor |
| Exclusivity and deadline | A single active attempt per `exclusive` mission, the first published claim prevails; deadline at `execution.max_lease_minutes`, extended by a new comment; "Libération TH-xxx" with the branch and the last checkpoint | Contributor |
| Flow caps | At most 3 missions in production and 5 awaiting review or integration (manifest). Beyond that, the project lead suspends new claims; only verifications stay open | Project lead |
| State | `status` field of the contract: `in_progress` through the mission PR; `accepted`, `integrated` or `closed` by the project lead | Contributor, project lead |
| Verification | The project lead assigns a reviewer from another user, eligible under [Cross-verification](../../specs/en/verification-croisee.md) and `.tokenhood/policies/review.yaml`. Labels `needs-reviewer` while waiting, `in-review` during the review. Without an eligible reviewer, the PR waits; an exception is only possible through a decision recorded in `decisions/` | Project lead |
| Blocking question | `awaiting-decision` label, handled under section 4.3 | Project lead |
| Integration | Human approval and merge, green CI, usage report attached; 30-day feedback collected under the pilot campaign protocol (TH-010) | Project lead |

## 7. Interim admission

### 7.1 Scope

During lots 0 to 3, the external pilot project is admitted manually, under the requirements of the target process ([Project selection and contracting](../../specs/en/selection-et-contractualisation.md)), documented and then recorded in Tokenhood when the platform allows it. Lot 4 automates this process from these real files.

### 7.2 Interim selection committee

The founders' college acts as selection committee; a member linked to the candidate project recuses themselves. KYB documents and results stay with the committee: they are never added to a repository, a discussion or a mission package, nor passed to an agent (policy `kyb_documents_in_mission_packages`). The public file only states "compliant" or "not compliant".

### 7.3 Steps

| Step | Content | Who |
| --- | --- | --- |
| 1. Scouting | Candidates documented from public data only | Mission TH-012 |
| 2. First contact | Presentation of Tokenhood to the maintainer, agreement in principle | Project lead |
| 3. Application | Fields of the specification form (repositories, licence, governance, carrying entity, lead, needs), provided or validated by the candidate project's lead | Candidate project |
| 4. KYB check | According to the legal form of the project's carrier, outside any repository | Committee |
| 5. Assessment | `governance.instruction` mission entrusted to an agent with no link to the project, on the application and public data; grid of the specifications, weightings of appendix A | Mission TH-305 |
| 6. Decision | `project.admission` vote (section 5.5), with recusal | Governance |
| 7. Agreement | Pilot agreement with the minimum content of the specifications, reviewed by the committee, after legal validation | Mission TH-305, committee |
| 8. Signature | Documented manual signature (fallback for DocuSeal); PDF archived outside the repository, SHA-256 fingerprint published in the decision | Candidate project's lead, signing entity |
| 9. Onboarding | `.tokenhood/` PR in the project's repository, validated with `tools/validate` | Project, Tokenhood project lead |

### 7.4 Criteria specific to the pilot

In addition to the grid of the specifications, the pilot project:

- publishes its code under an OSI-approved licence;
- has at least one active maintainer, ready to review within an agreed time and to answer the 30-day feedback;
- publicly accepts AI-assisted contributions;
- offers missions of varied types, of `low` or `medium` risk, with no non-public personal data;
- relates to digital commons or to the transition.

### 7.5 Prerequisites not settled by the charter

The signing entity for agreements (Kosmio during bootstrap, to be confirmed) and the legal validation of the agreement, signature and terms are settled by the project lead before step 7, and in any case before the external project is admitted (lot 3). The charter does not set them.

## 8. Operations

### 8.1 Operational functions

Each function has an owner, a commitment and a fallback. The situation is that of 20 October 2026.

| Function | Owner | Commitment | Cost | Fallback | Situation |
| --- | --- | --- | --- | --- | --- |
| Hosting of the platform and the landing page | Project lead (Kosmio) | Existing Coolify server of the project lead, offered in kind, to be confirmed | Low, in euros | Second host documented in the runbook (TH-014) | In service: `tokenhood.kosm.io`, `app.` and `api.tokenhood.kosm.io` |
| Backups and restoration | Hosting owner | Daily backup to an external S3 destination, restoration tested at each gate | Low | Second host | Not attested in the repository: to be documented by TH-014 |
| Domain name and DNS | Project lead (Kosmio) | Subdomains of `kosm.io`, to be confirmed | Low | Transfer to a dedicated domain, to be documented | In service |
| Continuous deployment | Project lead ([DEC-2026-002](../../../decisions/DEC-2026-002-deploiement.md)) | Deployment of every commit on `main` | None | Mandated delegate for infrastructure | In service; target environment (staging or production) still open |
| Forge: repository, protection of `main`, required checks, Discussions, labels | Project lead, repository administrator | Settings kept in line with the CI | None | Second administrator, to be appointed | In service; Clarifications, Decisions, Proposals categories to be created |
| Mission coordination | Project lead | Section 6 | None | Mandated delegate for specifications | Manual, tokenpool disabled |
| Review, approval and merge | Project lead, sole maintainer | Target times of section 9.1 | None | Second maintainer, to be appointed | Bottleneck identified by the plan |
| Reviewer assignment | Project lead | Eligibility rules, section 6 | None | Mandated delegate | Manual until TH-301 |
| Incident and security on-call | Project lead, on an interim basis | Volunteer, declared time slots | None | At least two people | A single person: requirement of the specifications not met |
| CI security (gitleaks, Trivy, audits, LLM check) | Project lead | Images pinned by version and `sha256` digest, updated after at least two weeks of publication | None | Mandated delegate for infrastructure | In service (TH-015) |
| Moderation and reports | Administrators (the project lead) | Volunteer | None | Rotation, to be set up | Reporting contact in `CODE_OF_CONDUCT.md` |
| Decision log and FR/EN publication | Project lead, then mandated delegates | Publication within 7 days (section 5.6) | None | Any founder | In service (`decisions/`) |
| Pilot campaign log and 30-day feedback | Project lead | Protocol of mission TH-010 | None | To be appointed | Protocol in preparation (TH-010) |
| Landing page sign-up form | Project lead | Form hosted by Brevo, double opt-in ([DEC-2026-003](../../../decisions/DEC-2026-003-landing.md)) | To be confirmed | Link to GitHub Discussions | Form not configured: link active |
| Review of English translations | Mandated delegate to be appointed, otherwise the project lead | `i18n` missions | None | To be appointed | EN specifications in `machine` status |
| Selection committee | Founders' college | Volunteer members | None | Substitutes, to be appointed | Section 7 |
| DocuSeal instance | Hosting owner | Self-hosted (TH-404) | None | Documented manual signature | Planned for lot 4 |
| Signing entity for agreements | Tokenhood project lead | Kosmio during bootstrap, to be confirmed | None | Dedicated association | To be settled before TH-305 |
| Legal validation (agreement, signature, terms, GDPR) | Tokenhood project lead | To be found | Possible | None | To be settled before the external project is admitted |

On 20 October 2026, all functions rest on a single person. Appointing a second administrator (forge and Coolify) and a second on-call person is a proposed condition for the lot 1 gate; the lot 4 gate requires a confirmed owner and fallback for each function.

### 8.2 Appointment and withdrawal

- Owners and fallbacks are appointed by the founders' college, with the consent of the person appointed, and recorded in `decisions/`; the Owner column is updated in the same PR, without amending the charter.
- A volunteer owner can withdraw with the notice of appendix A, unless prevented; their fallback acts in the interim.
- The table is reviewed at each lot gate. Mission TH-115 then takes it over in the platform.

### 8.3 Security

- **Reporting**: never through a public issue or discussion. Private channel: GitHub private vulnerability reporting as soon as it is enabled (disabled on 20/10/2026), otherwise the reporting contact in `CODE_OF_CONDUCT.md`. A public discussion, if one is needed, only states that a security question has been passed on.
- **Emergency**: an administrator decides immediately (`security.emergency`); the decision is published without exploitable details and ratified within 7 days (section 5.5).
- **Exposed secret**: revocation first, then clean-up; the agent that finds it applies the `stop` conduct of its skill.

## 9. Commitments

### 9.1 Of the Tokenhood project towards its contributors

- Assign a reviewer within the time of appendix A after a complete PR is opened, or state publicly that no eligible reviewer is available.
- Make an integration decision (merge, changes requested or reasoned rejection) within the time of appendix A after a review report.
- Answer category 1 clarifications within the target time of 24 working hours.
- Publish missions with verifiable acceptance criteria, within the flow caps of the manifest.
- Collect the 30-day feedback for each integrated mission and publish its summary.
- Publish the tokens given, the decisions and the results of the pilot campaign, with their nature (measured, declared, estimated).

### 9.2 Of contributors

- Run their agent under `tokenhood-contribute` or `tokenhood-verify`, within the limits of the contract and the policies.
- Sign off each commit (DCO, `git commit -s`) as the human responsible for the agent, with the `Assisted-by` trailer.
- Attach the usage report of each contribution.
- Declare their interest links and recuse themselves.
- Comply with the terms of their AI provider and with the code of conduct.

### 9.3 Of founders and function owners

- Publish decisions in FR and EN, reasoned, within the times of section 5.
- Recuse themselves as soon as a decision concerns them.
- Record the end of the founders' period as soon as its condition is met.
- Keep the operations table up to date and report on it at each lot gate.

## 10. Adoption, amendment and end

- **Adoption**: version 0.1 is adopted by the merge into `main` of the PR of mission TH-011, which counts as a decision of the founders' college. The questions raised in that PR can change values before the merge.
- **Amendment**: by a `charter.amendment` decision (section 5.5). The parameters of appendix A follow the same rule.
- **Corrections of form and translation**, with no effect on meaning: category 1, by the mandated delegate for specifications or the project lead.
- **Versions**: each adopted version has a number and a date and appears in the history; previous versions remain in the repository history.
- **End**: sections 4 and 5 cease when votes move into Tokenhood (section 5.8), section 6 when the platform coordinates its missions (lot 2), section 7 when admission is automated (lot 4), section 8 when TH-115 holds the operational commitments. The platform charter, adopted through `charter.amendment`, succeeds it.

## Appendix A: parameters

| Parameter | Value | Origin |
| --- | --- | --- |
| Weight of the two colleges | 50 % each | Specifications (governance) |
| Size from which a college holds its half | 5 members | Specifications; reading proposed by TH-011 |
| End of the founders' period | Each of the two colleges has at least 5 members | Specifications; reading proposed by TH-011 |
| Entry threshold for the contributors' college | 3 accepted missions, produced or verified | Proposal by TH-011 |
| Loss of membership | 12 months without an accepted mission | Proposal by TH-011 |
| Length of a delegate's mandate | 6 months, renewable | Proposal by TH-011 |
| Quorum for types with no quorum in the specifications | 50 % | Proposal by TH-011 |
| Majorities, minimum times and quorums of the specifications | Section 5.5 | Specifications (governance) |
| Size of a panel drawn at random | 3 members | Proposal by TH-011 |
| Time to contest a count | 48 h | Proposal by TH-011 |
| Time to assign a reviewer | 3 working days | Proposal by TH-011 |
| Time for an integration decision after a review report | 5 working days | Proposal by TH-011 |
| Flow caps | 3 in production, 5 awaiting review or integration | Manifest `.tokenhood/project.yaml`, which prevails |
| Anti-reciprocity window for reviews | Last 3 missions | Policy `.tokenhood/policies/review.yaml`, which prevails |
| Feedback after integration | 30 days | Manifest, which prevails |
| Weightings of the pilot assessment grid | Equal across criteria | Proposal by TH-011 |
| Withdrawal notice for a volunteer owner | 30 days | Proposal by TH-011 |

## Appendix B: reproducible random draw

A draw must be repeatable by anyone, without anyone choosing the result.

1. The list of eligible people (GitHub accounts in lower case) is published in the thread before the deadline of the vote or of the dispute.
2. The seed is the value of the first round of the drand public randomness beacon (League of Entropy) published after that deadline; the round number is stated in the thread.
3. Each person receives the SHA-256 digest of "seed:account". People are ranked by increasing digest; the first ones form the panel, the next ones replace them in order.
4. The computation is published in the thread, so that any member can repeat it.

## History

| Version | Date | Change |
| --- | --- | --- |
| 0.1 | 20/10/2026 | First version, mission TH-011 |
