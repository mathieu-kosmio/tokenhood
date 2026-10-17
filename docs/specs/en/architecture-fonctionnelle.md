[V2.1 specifications](../README.md) › Module 6/28 · [Version française](../architecture-fonctionnelle.md)\
*Translation of the French source (translation status: `machine`, pending review).*

# Functional architecture

The platform has eight business modules behind two entry points: the MCP server for agents, the REST API and the web interface for humans. Governance steers the whole.

**Tokenhood orchestrates, contributors' agents think**\
*Functional architecture: no call to an AI model on the server side*

```mermaid
flowchart TB
    accTitle: Tokenhood orchestrates, contributors' agents think
    accDescr: Functional architecture: no call to an AI model on the server side
    agents["<b>Agents</b><br>of contributors<br>Claude Code, Codex,<br>local agents<br><i>official client</i>"]
    humains["<b>Humans</b><br><i>project leads, governance</i>"]
    subgraph tokenhood["Tokenhood,#160;deterministic#160;orchestrator"]
        mcp["<b>MCP server</b><br><i>agent tools</i>"]
        api["<b>REST API, web</b><br><i>FR/EN interface</i>"]
        identite["<b>Identity</b><br><i>accounts, agents</i>"]
        capacite["<b>Capacity</b><br><i>pledges, scales</i>"]
        selection["<b>Selection</b><br><i>KYB, agreements</i>"]
        missions["<b>Missions</b><br><i>mission contracts</i>"]
        coordination["<b>Coordination</b><br><i>leases, checkpoints</i>"]
        verification["<b>Verification</b><br><i>cross-review</i>"]
        skills["<b>Skills</b><br><i>library</i>"]
        gouvernance["<b>Governance</b><br>dashboard, votes"]
        transverse["Cross-cutting: i18n FR/EN, audit, notifications"]
        out[" "]
    end
    forges["<b>Forges</b><br><i>GitHub App, PR</i>"]
    docuseal["<b>DocuSeal</b><br><i>signature</i>"]
    kyb["<b>KYB registers</b><br><i>SIREN, LEI</i>"]
    tokenpool["<b>tokenpool</b><br><i>bootstrap, protocol</i>"]
    stockage["<b>PostgreSQL, S3</b><br><i>state, artefacts</i>"]
    agents --> mcp
    humains --> api
    mcp ~~~ identite ~~~ capacite ~~~ selection ~~~ missions
    api ~~~ coordination ~~~ verification ~~~ skills ~~~ gouvernance
    missions ~~~ transverse
    gouvernance ~~~ transverse
    transverse ~~~ out
    out --> forges
    out --> docuseal
    out --> kyb
    out -.-> tokenpool
    out --> stockage
    class gouvernance accent
    class transverse tint
    class out note
    classDef accent fill:#e6f1ef,stroke:#0e5450,stroke-width:2px
    classDef agent stroke-dasharray:5 4
    classDef crit fill:#dbeafe,stroke:#2563eb,stroke-width:2px
    classDef tint fill:#f2f3f1
    classDef note fill:none,stroke:none
```

The dashed link to tokenpool is temporary: it is used for the bootstrap, after which only protocol compatibility is kept.

---

← [Actors and roles](acteurs-et-roles.md) · [Contents](../README.md) · [Registration and identity](inscription-et-identite.md) →
