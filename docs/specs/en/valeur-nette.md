[V2.1 specifications](../README.md) › Module 3/28 · [Version française](../valeur-nette.md)\
*Translation of the French source (translation status: `machine`, pending review).*

# Net value of contributions

Meeting a review deadline does not show that Tokenhood saves the project time. V2.1 measures three successive results and regulates the flow to protect maintainers' capacity.

| Result | Question | Measure |
| --- | --- | --- |
| Contribution accepted | Does the deliverable meet the mission contract? | Verification verdict and project lead's approval |
| Contribution integrated | Has the project merged or published it? | Forge event (merge, publication) |
| Contribution useful over time | Did it deliver the expected service without disproportionate corrective cost? | Maintainer feedback at 30 days, defects and rework linked to the mission |

**Estimated net human gain**, for missions where a comparison in time makes sense:

```latex
G = T_{\text{without}} - \left(T_{\text{scoping}} + T_{\text{assistance}} + T_{\text{review}} + T_{\text{correction}} + T_{\text{integration}}\right)
```

The scenario without Tokenhood cannot be observed: it is estimated by the project lead, and the indicator is always displayed as estimated. For research or creative work, an assessment of usefulness replaces the time-based indicator.

**A light measurement, so as not to burden the scarce resource**

- Review and integration times are derived from forge and platform timestamps, without manual input.
- Time entry by the project lead is optional: one value per mission.
- Feedback 30 days after integration, in under a minute:
  1. Did this contribution deliver the expected service? (yes, partly, no)
  2. Was the supervision work worth the result? (yes, roughly, no)
  3. Did it require corrections after integration? (none, minor, major)
- Defects reported after integration and linked to the mission are counted.

**Flow regulation**

- The project lead sets two caps per project: number of attempts simultaneously in production, number of deliverables awaiting review or integration.
- Cap reached: the platform stops offering new production work on that project; only verification missions are still offered.
- Verification queue above a threshold: the opening of new production work is automatically reduced, in addition to redirecting agents towards verification.
- 30-day feedback mostly negative: review of the project's scoping and, if needed, an arbitration request.

**Expected evidence during the pilot**: the maintainer considers that the help received is worth the work needed to supervise it, and wishes to repeat the experience.

---

← [Vision and principles](vision-et-principes.md) · [Contents](../README.md) · [Guarantee matrix](garanties.md) →
