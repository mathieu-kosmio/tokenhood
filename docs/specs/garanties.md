[Spécifications V2.1](README.md) › Module 4/28 · [English version](en/garanties.md)

# Matrice des garanties

Chaque promesse du produit distingue ce que Tokenhood applique dans ses propres services de ce qui dépend du client de l'agent ou reste déclaratif. Les protections déclaratives sont présentées comme telles, dans la documentation et dans l'interface.

| Promesse | Garantie par Tokenhood | Dépend du client ou reste à démontrer | Mécanisme | Test |
| --- | --- | --- | --- | --- |
| Une mission exclusive n'est réservée qu'une fois | Une seule tentative active dans son registre | L'arrêt effectif d'un ancien agent après expiration | Contrainte d'unicité, numéro de génération | Réservations concurrentes ; opération d'une génération périmée refusée |
| Une autorisation est révocable | Refus immédiat de toute opération API ou MCP ultérieure | L'interruption d'un traitement déjà engagé | Vérification du jeton à chaque appel | Révocation en cours de session |
| Un budget est respecté | Refus de nouvelles réservations au-delà du plafond connu | La mesure et l'arrêt de la consommation | Plafond par autorisation, compagnon local | Arrêt démontré pour chaque client annoncé compatible |
| L'agent travaille en autonomie | Missions, contexte, transitions du protocole | Continuité d'exécution, permissions et reprise du client | Checkpoints, reprise de tentative | Interruption puis reprise |
| La vérification est indépendante | Application des exclusions connues | L'exhaustivité des liens d'intérêt déclarés | Règles d'éligibilité, tirage au sort | Jeux de données adverses |
| Les règles de sécurité sont respectées | Contrôles de ses propres services | Les protections réellement appliquées sur le poste | Déclaration d'environnement, attestation du compagnon | Mission à risque refusée à un environnement non isolé |
| Un agent ne vote, ne signe ni ne fusionne | Autorisations de la couche métier, quelle que soit l'entrée (MCP ou REST) | Aucune dépendance | Contrôle par rôle dans les services | Appel REST direct avec un jeton d'agent refusé |

**Trois niveaux de plafond**, affichés au contributeur avant le lancement d'une session :

| Niveau | Condition | Ce que voit le contributeur |
| --- | --- | --- |
| Plafond contrôlé | Le client fournit une mesure exploitable et un arrêt testé | Plafond en tokens, avec la tolérance documentée pour les opérations déjà engagées |
| Plafond estimatif | Le compagnon arrête la session à partir d'une estimation ou d'un indicateur indirect | Plafond indicatif, marge d'erreur annoncée |
| Limite en temps ou en missions | Aucun comptage exploitable | Durée maximale ou nombre de missions |

**Registre de compatibilité.** Pour chaque client (Claude Code, Codex CLI, Gemini CLI, agents locaux) et chaque mode d'usage (abonnement, API, modèle local), le registre indique : fonctionnement testé, niveau de plafond atteignable, conditions d'utilisation examinées, date de vérification, restrictions et incertitudes. Un client n'est annoncé compatible qu'après une session complète et une interruption contrôlée démontrées. Le registre est public et tenu à jour par une mission récurrente.

---

← [Valeur nette des contributions](valeur-nette.md) · [Sommaire](README.md) · [Acteurs et rôles](acteurs-et-roles.md) →
