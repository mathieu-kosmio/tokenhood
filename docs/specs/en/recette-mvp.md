[V2.1 specifications](../README.md) › Module 25/28 · [Version française](../recette-mvp.md)\
*Translation of the French source (translation status: `machine`, pending review).*

# MVP acceptance criteria

The MVP is accepted when the criteria below are demonstrated and the pilot campaign has produced its three demonstrations.

**Protocol**

- [ ] Project with 3 dependent missions; an `integrated` dependency remains blocking as long as the prerequisite mission is not merged
- [ ] Two concurrent exclusive claims: only one succeeds
- [ ] After expiry and reassignment, any operation from the old generation is refused; the new attempt resumes from the last checkpoint
- [ ] Incompatible change of the contract during an attempt: migration or release, never silent continuation
- [ ] Attempt in `awaiting_decision`: lease suspended, resumption after the decision
- [ ] Flow limit reached: no new production work is offered on the project any more

**Verification and value**

- [ ] The assigned reviewer is never the producer nor a linked user (adversarial datasets)
- [ ] Without an eligible reviewer, the attempt waits in `awaiting_reviewer` without relaxing the rules
- [ ] A change to the deliverable after verification invalidates the approval
- [ ] Defects deliberately introduced into a test set are detected; reports declare their limits
- [ ] Visible distinction between submitted, accepted, integrated and judged useful; 30-day feedback collected and aggregated

**Guarantees and security**

- [ ] Cap level shown before each session; controlled stop demonstrated for each client announced as compatible
- [ ] An agent token is refused on voting, signature, merge and KYB documents, including through a direct REST call
- [ ] Revocation of an authorisation: immediate refusal of any subsequent operation
- [ ] Mission running code refused to an environment declared as non-isolated
- [ ] No call to an LLM provider from the servers (outbound traffic control)

**Capacity and governance**

- [ ] Available capacity excludes expired, withdrawn or allocated pledges; no envelope counted twice; native unit and confidence level viewable
- [ ] An agent's question handled by a mandated delegate within the target time, with a usable answer
- [ ] Collective decision voted with recusal, quorum recalculated, published in FR and EN
- [ ] `allocation.weights` decision automatically applied to the ranking of common pool missions

**Selection, languages, accessibility**

- [ ] Manual admission of the external project recorded (lot 3), then full automated journey: application, KYB, assessment without KYB documents, vote, agreement signed and archived with hash (lot 4)
- [ ] `i18n` mission automatically generated from a missing translation key
- [ ] AA accessibility audit on the registration, governance and application journeys

---

← [Initial backlog of the Tokenhood project](backlog-initial.md) · [Contents](../README.md) · [Risks and open questions](risques-et-questions-ouvertes.md) →
