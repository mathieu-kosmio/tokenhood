# Schémas · Schemas

**FR** · JSON Schema (draft 2020-12) des formats Tokenhood V2.1, décrits dans `docs/specs/annexes-formats.md`. Chaque format a des exemples dans `examples/<format>/valid/` (doivent passer) et `examples/<format>/invalid/` (doivent échouer, pour la raison indiquée en tête de fichier).

**EN** · JSON Schemas (draft 2020-12) for the Tokenhood V2.1 formats described in `docs/specs/annexes-formats.md`. Each format has examples in `examples/<format>/valid/` (must pass) and `examples/<format>/invalid/` (must fail, for the reason stated at the top of the file).

| Schéma · Schema | Fichiers · Files |
|---|---|
| `project.schema.json` | `.tokenhood/project.yaml` |
| `mission.schema.json` | `.tokenhood/missions/<ID>.yaml` |
| `attempt.schema.json` | réponse à `claim_mission` · `claim_mission` response |
| `review-report.schema.json` | rapport de vérification · review report |
| `arbitration-request.schema.json` | demande d'arbitrage · arbitration request |
| `policy-security.schema.json` | `.tokenhood/policies/security.yaml` |
| `policy-review.schema.json` | `.tokenhood/policies/review.yaml` |
| `common.schema.json` | types partagés · shared types |
| `protocol.schema.json` | entrées et sorties des opérations du protocole, erreurs · protocol operation inputs, outputs and errors |
| `protocol-machine.schema.json` | `protocole/machine.yaml` |
| `protocol-conformance.schema.json` | `protocole/conformite.yaml` |

## Protocole de coordination · Coordination protocol

**FR** · `protocole/machine.yaml` est la forme exécutable du protocole de coordination (états, transitions, autorisations, générations, versions, reprise, erreurs) ; `protocole/conformite.yaml` décrit les tests de conformité que l'implémentation doit passer, chaque couple transition:déclencheur couvert. Lecture commentée et normative : `docs/specs/protocole.md` (TH-009). Ces deux fichiers ne sont pas des exemples : le validateur ne les contrôle pas encore.

**EN** · `protocole/machine.yaml` is the executable form of the coordination protocol (states, transitions, authorisations, generations, versions, resumption, errors); `protocole/conformite.yaml` describes the conformance tests the implementation must pass, with every transition:trigger pair covered. Normative commentary: `docs/specs/protocole.md` (TH-009, French). These two files are not examples: the validator does not check them yet.

## Valider · Validate

```sh
cd tools/validate
npm ci
npm test                 # tests du validateur · validator tests
node validate.mjs ../..  # dépôt et exemples · repository and examples
```

Au-delà du schéma, le validateur refuse les clés YAML dupliquées, un nom de fichier différent de l'`id` de la mission, une dépendance vers une mission inconnue, un cycle de dépendances, et une option par défaut absente des options d'une demande d'arbitrage.

Beyond the schema, the validator rejects duplicate YAML keys, a file name that differs from the mission `id`, a dependency on an unknown mission, dependency cycles, and an arbitration request whose default option is not among its options.

Les schémas sont versionnés avec le format (`schema_version: "2.1"`) : un changement incompatible crée une nouvelle version. · Schemas are versioned with the format (`schema_version: "2.1"`): an incompatible change creates a new version.
