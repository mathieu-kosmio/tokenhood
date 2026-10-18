# Landing Tokenhood

Site statique bilingue servi sur `tokenhood.kosm.io`. Il intègre la maquette validée `design/maquettes/landing.dc.html` (mission TH-017, décision DEC-2026-003). Aucun framework : des gabarits JavaScript génèrent du HTML, nginx le sert.

## Commandes

```sh
cd landing
npm ci            # polices Fontsource (seules dépendances, de développement)
npm test          # build complet + vérifications
npm run build     # génère dist/
npm run serve     # prévisualisation sur http://localhost:4173
```

Pour voir la variante avec formulaire : `BREVO_FORM_ACTION=https://xxx.sibforms.com/serve/... npm run build`.

## Organisation

| Chemin | Rôle |
|---|---|
| `locales/<lang>/landing.json`, `legal.json` | Tous les textes de l'interface, FR et EN |
| `site.config.json` | URL du site, routes par langue, liens, réglages du formulaire |
| `src/layout.mjs` | `<head>`, en-tête, pied de page |
| `src/home.mjs` | Sections de l'accueil |
| `src/prose.mjs` | Mentions légales, confidentialité, page 404 |
| `src/styles.css` | Styles propres à la landing, sur les tokens Kosmio |
| `src/site.js` | Envoi du formulaire sans rechargement, présélection du rôle |
| `build.mjs` | Génération de `dist/` : pages, CSS et JS à empreinte, polices, sitemap |
| `nginx.conf`, `Dockerfile` | Service en production |
| `test/build.test.mjs` | Vérifications du build |

La feuille servie concatène, dans l'ordre : les `@font-face`, `design/kosmio.css` (copie du design system Kosmio), `design/tokenhood.css` (couleur de signature) et `src/styles.css`.

## Règles

- **Aucune chaîne d'interface en dur.** Un texte visible, un `aria-label`, un `alt` ou un `placeholder` vient des locales. Le test l'impose : tout texte rendu doit se retrouver dans une locale.
- **FR et EN ont la même structure** de clés et de listes, vérifiée par le test.
- Les locales se saisissent au clavier : apostrophes typographiques et espaces insécables du français sont posées au build (`src/typo.mjs`).
- **Aucune ressource tierce au chargement** : polices auto-hébergées, pas de cookie, pas de mesure d'audience, pas de style ni de script en ligne (la CSP les refuse).
- Couleurs, rayons, rythme : tokens Kosmio uniquement (`design/tokens.md`).

## Compteur de la hero

Le build additionne le champ `counted` des rapports de consommation de `.tokenhood/usage/` et compte les missions `integrated` ou `closed` de `.tokenhood/missions/`. Les chiffres sont figés à chaque déploiement : un nouveau rapport fusionné sur `main` redéploie la landing (chemins surveillés : `landing/**`, `design/**`, `.tokenhood/**`). Sans rapport, le compteur n'apparaît pas.

## Formulaire d'inscription (Brevo)

Tant qu'aucune URL d'action n'est fournie, le bloc « Rejoindre » renvoie vers GitHub Discussions. Pour l'activer :

1. Dans Brevo, créer une liste « Tokenhood » et un attribut à choix multiples `ROLE` (contributeur, porteur de projet, membre de gouvernance).
2. Créer un formulaire d'inscription sur cette liste avec double opt-in, champs `EMAIL` et `ROLE`.
3. Dans le code d'intégration HTML du formulaire, relever l'URL `action` (`https://<id>.sibforms.com/serve/...`) et vérifier les noms et valeurs des champs.
4. Renseigner l'URL dans la variable de build `BREVO_FORM_ACTION` de Coolify (ou dans `form.action` de `site.config.json`). Si les noms de champs diffèrent, ajuster `form.fields` et `form.roleValues` ; un champ caché supplémentaire se déclare dans `form.hidden`.
5. Redéployer et faire une inscription réelle.

Le build refuse toute URL qui n'est pas en `https://*.sibforms.com`, seule destination autorisée par la CSP de `nginx.conf`. Si `doubleOptIn` passe à `false`, le message de remerciement change en conséquence.

## Déploiement sur Coolify

| Réglage | Valeur |
|---|---|
| Source | dépôt public `mathieu-kosmio/tokenhood`, branche `main` |
| Build pack | Dockerfile |
| Base directory | `/` (le build lit `design/`) |
| Dockerfile location | `/landing/Dockerfile` |
| Port exposé | `8080` |
| Domaine | `https://tokenhood.kosm.io` |
| Healthcheck | chemin `/healthz`, port `8080` |
| Variable de build | `BREVO_FORM_ACTION` (cocher « Build Variable ») |
| Watch paths | `landing/**`, `design/**`, `.tokenhood/**` |

Le build Docker exécute les tests avant de générer le site : une régression bloque le déploiement. L'image tourne en utilisateur non root et ne contient aucun secret.

## Marques et polices

Le logo Kosmio (`public/logo-kosmio.svg`, fichier officiel) reste la propriété de Kosmio et n'entre pas dans la licence du code. Lexend, Public Sans et JetBrains Mono sont sous SIL Open Font License 1.1 ; leurs licences sont copiées dans `dist/assets/fonts/`.
