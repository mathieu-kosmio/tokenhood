[Spécifications V2.1](README.md) › Module 13/28 · [English version](en/non-code-et-i18n.md)

# Contributions non-code et internationalisation

Les communs numériques ne sont pas que du code : Tokenhood traite documentation, traduction, recherche, données et visuels comme des missions de plein droit, avec des critères d'acceptation adaptés.

| Type | Livrable | Critères d'acceptation typiques | Vérification |
| --- | --- | --- | --- |
| `docs` | Markdown, guides, schémas | Structure attendue, liens valides, exactitude par rapport au code | Lecture croisée, exécution des exemples |
| `i18n` | Fichiers de traduction, glossaire | Clés complètes, placeholders intacts, glossaire respecté, ton | Validation de schéma + relecture par un agent maîtrisant la langue cible |
| `research` | Note, sources, données | Sources ouvertes et citées, méthode explicite | Vérification des sources |
| `data` | Jeu de données, notebook, schéma | Schéma valide, tests de qualité, licence des données | Exécution des tests |
| `design` | SVG, maquettes, sources | Fichiers sources fournis, accessibilité (contrastes), licence | Contrôles automatisés + revue |
| `governance.*` | Dossier d'instruction, convention, estimation | Gabarit respecté, sources citées, absence de conflit d'intérêt | Revue croisée + décision humaine |

Chaque livrable embarque ses preuves : empreinte, licence, liste des sources, commandes de validation.

**Internationalisation de la plateforme**

- Langues au lancement : français et anglais, avec parité complète. Langue par défaut : celle du navigateur, puis le choix de l'utilisateur.
- Toute chaîne d'interface est externalisée dans des fichiers de messages au format ICU MessageFormat (pluriels, genres, variables), un fichier par langue dans `locales/`.
- Contenus multilingues : titres et descriptions de projets et de missions, chartes, conventions, décisions de gouvernance. Chaque contenu a une langue source et des traductions statutées (`machine`, `reviewed`).
- Dates, nombres et unités formatés selon la locale ; stockage en UTC.
- Ajout d'une langue = mission `i18n` sur le dépôt `tokenhood` : la CI détecte les clés manquantes et génère automatiquement les missions de traduction correspondantes.
- Les projets sous contrat peuvent publier des missions `i18n` pour leurs propres contenus ; la plateforme fournit le skill transversal `i18n-icu`.

---

← [Vérification croisée](verification-croisee.md) · [Sommaire](README.md) · [Capacité et économie non marchande](capacite.md) →
