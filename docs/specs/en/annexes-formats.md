[V2.1 specifications](../README.md) › Module 27/28 · [Version française](../annexes-formats.md)\
*Translation of the French source (translation status: `machine`, pending review).*

# Appendix: formats

These examples are indicative: mission TH-002 turns them into real versioned files, validated by parser and by schema in the CI (TH-003).

*Translator's note: the examples below are data and are reproduced exactly as in the French source, including their French values and comments.*

**Project manifest** (`.tokenhood/project.yaml`)

```yaml
schema_version: "2.1"
project:
  id: tokenhood
  name: Tokenhood
  license: AGPL-3.0-only        # à confirmer en gouvernance
  languages: [fr, en]
  repository:
    provider: github
    url: https://github.com/mathieu-kosmio/tokenhood
  contract:
    id: CTR-2026-001
    status: active
missions:
  directory: .tokenhood/missions/
  import_from_issues:
    label: tokenhood
skills:
  directory: .tokenhood/skills/
  platform: [tokenhood-contribute, tokenhood-verify]
policies:
  security: .tokenhood/policies/security.yaml
  review: .tokenhood/policies/review.yaml
flow_limits:
  max_in_production: 3
  max_awaiting_review_or_integration: 5
feedback:
  after_integration_days: 30
contributions:
  direct_push: false
  require_human_merge: true
  ai_attribution_trailer: Assisted-by
```

**Mission** (`.tokenhood/missions/TH-104.yaml`)

```yaml
schema_version: "2.1"
id: TH-104
version: 1
title:
  fr: Éligibilité au vote, déport et choix de collège
  en: Voting eligibility, recusal and college choice
type: code
objective: Déterminer qui peut voter sur une demande, en appliquant le déport et le collège unique.
scope:
  paths: [packages/core/governance/eligibility/]
inputs:
  paths: [docs/specs/gouvernance.md]
  decisions: [ADR-002]
outputs:
  kind: pull_request
acceptance:
  commands: ["pnpm test --filter governance-eligibility", "pnpm lint"]
  requirements:
    - Un membre lié à la demande est exclu du vote (test)
    - Un utilisateur éligible aux deux collèges ne vote qu'une fois (test)
    - Une organisation portant plusieurs projets a une seule voix chez les porteurs (test)
    - Aucune chaîne affichée hors i18n
dependencies:
  - mission: TH-103
    type: integrated
skills: [tokenhood-contribute@0.1, typescript-fastify@1, i18n-icu@1]
languages: {source: fr, targets: [en]}
estimate:
  tokens_eq: {low: 150000, high: 400000}
  source: agent
risk: medium                    # exécute les tests du projet
attempts: {mode: exclusive}
execution:
  max_lease_minutes: 180
  environment: container
verification:
  reviewers: 1
  prefer_different_model_family: true
  maintainer_approval: true
priority: high
```

**Response to `claim_mission`** (attempt)

```yaml
attempt:
  id: att_01JB7Q
  mission: TH-104
  contract_version: 1
  generation: 2                 # toute opération doit la présenter
  lease_expires_at: "2026-10-24T14:10:00Z"
  budget:
    level: estimated            # controlled | estimated | time_or_missions
    limit: {unit: agent_hours, value: 3}
```

**Review report**

```yaml
schema_version: "2.1"
mission: TH-104
attempt: att_01JB7Q
submission: SUB-0142
reviewer_agent: agt_7f3c
reviewed_state:
  contract_version: 1
  commit: 4f9c2e1
  artifact_sha256: "9b2e…"
verdict: changes_requested
criteria:
  - requirement: Un membre lié à la demande est exclu du vote (test)
    result: pass
    evidence: eligibility.test.ts, cas recusal_*
  - requirement: Un utilisateur éligible aux deux collèges ne vote qu'une fois (test)
    result: fail
    evidence: Aucun test ne couvre ce cas
tests:
  - run: pnpm test --filter governance-eligibility
    exit_code: 0
risks: ["Le calcul du quorum après déport relève de TH-106"]
limits:
  not_verified: ["Comportement avec plusieurs milliers de membres"]
  uncertain: ["Organisation sans projet actif"]
remarks: Ajouter le test du collège unique avant nouvelle soumission.
```

**Arbitration request** (created by an agent via `request_arbitration`)

```yaml
schema_version: "2.1"
type: spec.clarification
category: 1
raised_by: {kind: agent, agent: agt_21aa, mission: TH-202, attempt: att_01JC2M}
title:
  fr: Durée de lease par défaut
  en: Default lease duration
context: La spécification fixe 10 minutes, comme tokenpool ; les missions longues renouvellent souvent.
options:
  - id: A
    label: Garder 10 minutes
    impact: Compatibilité stricte avec tokenpool
    reversible: true
  - id: B
    label: 10 minutes par défaut, 30 minutes au-delà de 2 heures de mission
    impact: Moins de heartbeats, extension du protocole
    reversible: true
default_option: A
conduct: continue               # continue | switch_mission | stop
blocking: false
```

**Usage report** (`.tokenhood/usage/2026-10-24-TH-104-production.yaml`, returned with every contribution; `report_usage` tool after the bootstrap)

```yaml
schema_version: "2.1"
missions: [TH-104]
contribution:
  kind: production              # production | verification | drafting | integration
  pull_requests: [42]
  attempt: att_01JB7Q
contributor: exemple-dev
agent:
  client: claude-code
  client_version: "2.1.299"
  model_family: claude
  model: claude-opus-5-5
period: {start: "2026-10-24T13:02:11Z", end: "2026-10-24T14:41:50Z"}
tokens: {input: 1204, output: 86250, cache_creation: 412300, cache_read: 9812400}
counted: 499754                 # input + cache_creation + output; cache reads not counted
method: client_transcript       # client_transcript | provider_api | client_counter | estimate
nature: declared                # declared | measured | estimated
evidence: Claude Code session transcript, each response counted once.
```

The manifest makes this report mandatory (`contributions.usage_report: required`): CI rejects an integrated mission without a report. The sum of the `counted` fields is published as the total of tokens given, with its nature.

---

← [Risks and open questions](risques-et-questions-ouvertes.md) · [Contents](../README.md) · [Sources](sources.md) →
