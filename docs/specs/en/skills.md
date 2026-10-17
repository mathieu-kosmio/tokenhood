[V2.1 specifications](../README.md) › Module 11/28 · [Version française](../skills.md)\
*Translation of the French source (translation status: `machine`, pending review).*

# Skills library

The skills library transfers a project's know-how to external agents: it is one of Tokenhood's four axes of differentiation.

**Format.** A skill is a folder containing a `SKILL.md` (description, when to use it, instructions), examples, resources and tests. The format follows the SKILL.md convention readable by Claude Code and adaptable to other clients.

**Three levels**

| Level | Location | Examples | Maintained by |
| --- | --- | --- | --- |
| Platform | `tokenhood` repository, `skills/` folder | `tokenhood-contribute` (claim protocol), `tokenhood-verify` (cross-verification), `tokenhood-instruct` (case assessment) | Tokenhood project |
| Cross-cutting | Tokenhood catalogue | `i18n-icu`, `docs-diataxis`, `python-testing`, `accessibility-review` | Contributors, reviewed by governance |
| Project | The repository's `.tokenhood/skills/` | Code conventions, architecture, business glossary | Project lead |

**Indexed metadata**: identifier, semantic version, licence, author, SHA-256 hash, compatible clients, languages, dependencies between skills, usage statistics and acceptance rate of the missions that loaded it.

**Rules**

- Minimal context: only the skills listed by the mission are served by `get_context`.
- A skill cannot relax a security policy; in case of conflict, the project's and the platform's policies take precedence.
- Any change to a platform-level or cross-cutting skill goes through a verified mission.
- `skill.authoring` missions let contributors enrich the library; a skill's effectiveness is measured by the acceptance rate of the missions that use it.

---

← [Coordination and claims](coordination.md) · [Contents](../README.md) · [Cross-verification](verification-croisee.md) →
