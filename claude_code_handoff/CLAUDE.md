# CLAUDE.md — Handoff design → code

Ce dossier contient l'intégralité des designs pour le nouveau produit **CoworKing Café Strasbourg**. Ton job : implémenter ces designs dans le monorepo existant.

## Avant de coder — à faire dans cet ordre

1. **Ouvre `design_reference/05_v2_dark_editorial/index.html`** dans le navigateur. C'est la home du design system : tu y trouveras toutes les pages liées, la palette, la typo et le système de composants de référence (V2 « Dark Editorial »).
2. **Parcours les autres HTML** dans `design_reference/` (01 à 04). Chacun est autonome et représente un flow.
3. **Lis `README.md`** (dans ce dossier) pour la spec complète : composants, tokens, états, routes, API.
4. **Vérifie la stack UI d'`apps/site`** (Tailwind ? shadcn ? Chakra ?) dans son `package.json` avant de choisir comment porter les composants. Adapte à la stack existante — ne l'impose pas.
5. **Demande avant de placer les routes** : nouvelle page dans `apps/site` ou app séparée `apps/dashboard` ? Laisse le dev trancher.

## La direction visuelle est figée

Le design retenu est **V2 « Dark Editorial »** — palette sauge + miel + noir profond, typo Fraunces (serif) + Inter + JetBrains Mono (numéros/tags). Tous les choix visuels sont dans :
- `design_reference/05_v2_dark_editorial/tokens.css` → variables CSS et classes utilitaires
- `design_reference/05_v2_dark_editorial/shared.jsx` → Nav, PageHeader, Footer
- `design_reference/05_v2_dark_editorial/icons.jsx` → ~45 icônes SVG line

**Ne pas inventer de couleurs, ni changer les polices.** Si un composant n'existe pas dans le design, suis le système existant (rayons 10–22px, cartes fond crème/blanc, boutons pill 100px, chips tag mono).

## Ordre d'implémentation suggéré

### Phase 1 — Site public (apps/site)
Rentable en premier, peu de state, SEO important.
1. Layout global (Nav + Footer responsive)
2. `/` — Landing (ref : `05_v2_dark_editorial/landing.html`)
3. `/espaces` — Les 4 lieux (ref : `espaces.html`)
4. `/concept` — Histoire + équipe (ref : `concept.html`)
5. `/tarifs` — Plans + salles + FAQ (ref : `tarifs.html`)
6. `/menu` — Carte des boissons (ref : `menu.html`)
7. `/evenements` — Calendrier + privatisation (ref : `evenements.html`)

### Phase 2 — Auth
8. `/login` + `/register` + `/reset` (ref : `01_auth.html`)
    - Email magic link en priorité, password en fallback
    - OAuth Google optionnel

### Phase 3 — Flow de réservation
9. `/booking` — mobile 4 étapes + desktop 3 colonnes (ref : `02_booking_flow.html`)
    - Étapes : Espace → Date/Heure → Options → Confirmation & paiement
    - Récap live avec règles tarifaires (-15% semaine, -40% mois)
    - Integration Stripe pour le paiement final

### Phase 4 — Espace membre
10. `/dashboard` — Desktop avec sidebar + mobile avec drawer (ref : `05_v2_dark_editorial/dashboard.html` pour desktop, `03_dashboard_mobile.html` pour mobile)
11. Sous-pages : `/dashboard/bookings`, `/dashboard/history`, `/dashboard/wallet`, `/dashboard/loyalty`, `/dashboard/profile`, `/dashboard/events`, `/dashboard/directory`

## Checklist de livraison par page

Pour chaque page, vérifier :
- [ ] Responsive mobile (< 760px) / tablette (760–960) / desktop (> 960px)
- [ ] États loading / empty / error
- [ ] A11y : landmarks, focus visible, contraste AA, labels form
- [ ] SEO (pour site public) : title, meta, og:image, schema.org LocalBusiness
- [ ] Données : fixtures JSON puis branchement API réelle
- [ ] I18n-ready (tous les strings FR passent par un helper t())

## Ne pas faire

- Pas d'emoji dans le produit final (placeholders actuels → remplacer par icônes line ou photos)
- Pas de gradients aggressifs, pas d'AI slop (coins arrondis + barre accent à gauche en série)
- Pas de Tailwind forcé si la stack du monorepo utilise autre chose
- Pas de composants Figma-like (shadows lourdes, glassmorphism) — le design est éditorial sobre

## Stack technique des mockups

- React 18 + Babel inline (pas de bundler, `<script type="text/babel">`)
- CSS vanilla avec variables — **pas de Tailwind dans les refs**, c'est au dev d'adapter
- SVG icons inline via composant unique `<Icon name size />`
- Breakpoints : 560px (mobile small), 760px (tablette), 960px (desktop small), 1200px (desktop wide)

## Assets à fournir par le client (blockers)

- 4 photos des espaces : open-space, Salle Verrière, Salle Étage, Événementiel
- Logo vectoriel définitif (SVG)
- 6-10 portraits équipe/partenaires pour la page Concept
- Photos ambiance pour le hero landing (si pas de vidéo)

Tous ces assets sont actuellement représentés par des placeholders colorés dans les mockups.
