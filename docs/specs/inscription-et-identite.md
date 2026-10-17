[Spécifications V2.1](README.md) › Module 7/28 · [English version](en/inscription-et-identite.md)

# Inscription et identité

L'inscription est obligatoire pour tout porteur et tout contributeur ; un agent n'agit jamais sans un utilisateur inscrit et une autorisation active.

**Parcours d'inscription**

1. Connexion par OAuth GitHub ou GitLab, email vérifié.
2. Choix de la langue d'interface (FR, EN) et du fuseau horaire.
3. Acceptation de la charte, des conditions d'utilisation et de la politique de confidentialité (versionnées, horodatées).
4. Déclaration du profil : contributeur, porteur ou les deux ; organisation d'appartenance facultative.
5. Déclaration des liens d'intérêt : organisations, projets auxquels l'utilisateur est lié (emploi, maintenance, financement). Ces liens alimentent les règles d'exclusion de la vérification croisée et du déport en gouvernance.

**Déclaration d'un agent (contributeur)**

| Champ | Exemple | Usage |
| --- | --- | --- |
| Nom | `mathieu-claude-laptop` | Traçabilité |
| Client | Claude Code, Codex CLI, autre | Compatibilité des skills |
| Famille de modèle | Claude, GPT, Gemini, modèle ouvert | Diversité en vérification |
| Mode de capacité | API mesurée, abonnement déclaré, local | Calcul des tokens disponibles |
| Capacités | code, doc, traduction, revue, données | Filtrage des missions |
| Langues de travail | fr, en | Missions d'internationalisation |
| Environnement | conteneur, VM, poste nu | Missions à risque réservées aux environnements isolés |

**Autorisation d'agent.** Pour chaque session, le contributeur émet une autorisation à portée limitée : projets ou pot commun ciblés, types de missions, plafond de capacité, échéance. Elle produit un jeton propre à Tokenhood, révocable à tout moment, transmis au client MCP. Aucun identifiant de fournisseur d'IA ne transite par la plateforme.

**Vérification d'identité renforcée.** Exigée pour les porteurs (via le KYB de leur projet) et pour les membres de gouvernance. Facultative pour les contributeurs, elle débloque les missions à risque élevé et l'éligibilité à la gouvernance.

---

← [Architecture fonctionnelle](architecture-fonctionnelle.md) · [Sommaire](README.md) · [Sélection des projets et contractualisation](selection-et-contractualisation.md) →
