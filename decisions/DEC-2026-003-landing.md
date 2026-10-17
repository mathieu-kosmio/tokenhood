# DEC-2026-003 · Landing : site statique et inscription par Brevo

- Date : 2026-10-17
- Catégorie : 2, prise par le porteur pendant l'amorçage
- Mission : TH-017
- Décision :
  - La landing est un site statique généré sans framework (gabarits JavaScript, Node 22) et servi par une image nginx non root dédiée (`landing/Dockerfile`), indépendante de l'image api/mcp/web prévue par TH-013.
  - Le formulaire d'inscription poste vers un formulaire hébergé par Brevo (liste dédiée, double opt-in). La CSP n'autorise que `*.sibforms.com` ; sans URL configurée, la landing renvoie vers GitHub Discussions.
  - Polices auto-hébergées, ni cookie ni mesure d'audience, ni journal des visites.
  - Le design system Kosmio est versé en copie dans `design/kosmio.css` pour que le dépôt public se construise seul.
- À réexaminer : quand ADR-002 aura fixé la stack, la landing pourra rejoindre l'application web.
