# Tokenhood · référentiel de tokens

Direction retenue le 17 octobre 2026 : **Canopée Kosmio**. Tokenhood est un satellite du design system Kosmio v2 « Horizon » et sera publié sur `tokenhood.kosm.io`.

Source de vérité : `01-Strategie/design-system/kosmio.css` (espace Kosmio, copié dans `design/kosmio.css` pour que ce dépôt se construise seul) et le site publié kosm.io. Ce fichier ne redéfinit que ce que la règle des satellites autorise : la couleur de signature. Police, rayons, rythme, ombres et grille sont ceux de Kosmio.

## Déclinaison satellite

```css
.kos-tokenhood {
  --color-primary:        var(--kos-teal-600);  /* #0E5450 */
  --color-primary-hover:  var(--kos-teal-700);  /* #0C4744 */
  --color-primary-subtle: var(--kos-teal-50);   /* #E6F1EF */
  --color-accent:         var(--kos-or-500);    /* #E8A33D, aplat : flèche, signe */
  --color-accent-text:    var(--kos-or-700);    /* #8A5A12, accent écrit */
}
```

Point d'attention : Certifiko utilise aussi l'or comme accent. La distinction de Tokenhood repose sur son motif (cernes d'arbre et flèche), pas sur une couleur nouvelle.

## Couleurs (rôles)

| Rôle | Token Kosmio | Valeur | Usage Tokenhood |
|---|---|---|---|
| Fond | `--surface` | #FAFAF7 | Papier, fond par défaut |
| Surface élevée | `--surface-raised` | #FFFFFF | Cartes de mission, panneaux |
| Section alternée | `--surface-sunken` | #F3F1EC | Bandes de section |
| Surface douce | `--color-primary-subtle` | #E6F1EF | Hero (voile autorisé), tags |
| Primaire | `--color-primary` | #0E5450 | Actions, liens, < 10 % de la surface |
| Secondaire | `--color-secondary` | #0A3B38 | Fonds sombres, tuiles d'ambiance |
| Texte | `--text` | #14201E | Titres, texte fort |
| Corps | `--text-body` | #424C49 | Paragraphes |
| Texte secondaire | `--text-secondary` | #59615F | Légendes, métadonnées |
| Filet | `--border` | #E3E4E1 | Bordures 1 px |
| Or (aplat) | `--color-accent` | #E8A33D | Flèche, pastilles, jamais en texte |
| Or (texte) | `--color-accent-text` | #8A5A12 | Badge « en revue », accent écrit |
| Ciel (aplat) | `--kos-ciel-500` | #6BAED6 | Cernes, illustration |
| Ciel (texte) | `--color-info-text` | #38718F | Information |
| Succès | aplat #2E7D5A, texte #1F6647 | | Accepté, intégré |

Compléments locaux de la landing (`landing/src/styles.css`), faute d'équivalent Kosmio : fond « en revue croisée » `#FDF3E2`, bordure de champ `#A8ACA9` (3:1 sur papier), filet sur teal profond `#1F5450`.

## États de mission (forme + couleur)

| État | Pastille | Texte |
|---|---|---|
| Ouverte | contour teal | #0E5450 |
| Réservée | fond teal 50 | #0E5450 |
| En revue croisée | fond #FDF3E2 | #8A5A12 |
| Acceptée / intégrée | fond succès doux | #1F6647 |
| Rejetée / bloquée | contour encre | #14201E, icône ✕ |

Chaque état porte aussi une icône ou une forme : jamais la couleur seule.

## Typographie

- Lexend 500 : titres, boutons, labels, navigation (jamais 700).
- Public Sans : corps, chapô, légendes.
- JetBrains Mono : eyebrows, identifiants de mission (TH-104), chiffres, tags.
- Échelle Kosmio : display 40→72, h1 36→56, h2 26→40, h3 22→28, corps 16, légende 14, tag 12. Mesure 68 caractères.

## Grille, rythme, formes

- Conteneur 1280 px, colonne de lecture 720 px, gouttières 16→24 px.
- 160 px entre sections en desktop, 64 px en mobile.
- Espacements multiples de 4 px.
- Rayons : carte 16, champ 8, bouton et tag en pastille.
- Ombres Kosmio discrètes, le système tient au filet 1 px.
- Aucun dégradé, sauf le voile de hero `--voile-hero`.

## Motif et iconographie

- Signature : cernes d'arbre (traits 1,5 px teal 500 et ciel) et flèche en or (trait 2,25 à 3,5 px, bouts ronds).
- Pictogrammes : trait 1,75 px, bouts et jonctions arrondis, couleur primaire ; la revue croisée en or texte.
- Logo provisoire : flèche or + « tokenhood » en Lexend 500 teal profond ; mention « un commun initié par Kosmio ».
- Visuels en SVG faits main, pas d'image générée.

## Sources

- Planche de la direction : canevas « Tokenhood : directions artistiques », artboard C2.
- Design system Kosmio : `01-Strategie/design-system/README.md`, `kosmio.css`.
