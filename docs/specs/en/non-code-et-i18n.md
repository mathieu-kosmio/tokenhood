[V2.1 specifications](../README.md) › Module 13/28 · [Version française](../non-code-et-i18n.md)\
*Translation of the French source (translation status: `machine`, pending review).*

# Non-code contributions and internationalisation

The digital commons are not only code: Tokenhood treats documentation, translation, research, data and visuals as full-fledged missions, with suitable acceptance criteria.

| Type | Deliverable | Typical acceptance criteria | Verification |
| --- | --- | --- | --- |
| `docs` | Markdown, guides, diagrams | Expected structure, valid links, accuracy with respect to the code | Cross-reading, running the examples |
| `i18n` | Translation files, glossary | Complete keys, placeholders intact, glossary respected, tone | Schema validation + proofreading by an agent proficient in the target language |
| `research` | Note, sources, data | Open and cited sources, explicit method | Source checking |
| `data` | Dataset, notebook, schema | Valid schema, quality tests, data licence | Running the tests |
| `design` | SVG, mock-ups, sources | Source files provided, accessibility (contrast), licence | Automated checks + review |
| `governance.*` | Assessment file, agreement, estimation | Template respected, sources cited, no conflict of interest | Cross-review + human decision |

Each deliverable carries its evidence: hash, licence, list of sources, validation commands.

**Internationalisation of the platform**

- Languages at launch: French and English, with full parity. Default language: the browser's, then the user's choice.
- Every interface string is externalised in message files in ICU MessageFormat (plurals, genders, variables), one file per language in `locales/`.
- Multilingual content: titles and descriptions of projects and missions, charters, agreements, governance decisions. Each piece of content has a source language and translations with a status (`machine`, `reviewed`).
- Dates, numbers and units formatted according to the locale; storage in UTC.
- Adding a language = an `i18n` mission on the `tokenhood` repository: the CI detects missing keys and automatically generates the corresponding translation missions.
- Projects under contract can publish `i18n` missions for their own content; the platform provides the cross-cutting skill `i18n-icu`.

---

← [Cross-verification](verification-croisee.md) · [Contents](../README.md) · [Capacity and non-market economy](capacite.md) →
