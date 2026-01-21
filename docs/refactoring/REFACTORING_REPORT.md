# Rapport de Refactorisation - Header, Footer et Layout

**Date**: 2026-01-13
**Auteur**: Claude (Sonnet 4.5)
**Objectif**: Refactoriser les composants Header, Footer et Layout en suivant les conventions BEM et les principes de code propre

---

## Résumé Exécutif

Refactorisation complète du Header, Footer et Layout du site public avec migration du projet original (`bt-coworkingcafe`) vers le nouveau monorepo (`coworking-cafe/apps/site`). Tous les composants suivent désormais les conventions BEM strictes et les principes de code propre définis dans `/Users/twe/Developer/Thierry/coworking-cafe/docs/CONVENTIONS.md`.

---

## Fichiers Créés

### 1. Layout Principal
**Fichier**: `/Users/twe/Developer/Thierry/coworking-cafe/apps/site/src/app/(site)/layout.tsx`

**Description**: Layout du site public qui wrap toutes les pages
- Import du Header et Footer
- Metadata pour le SEO
- Import du fichier SCSS global

**Points clés**:
- Types TypeScript explicites pour les props
- Metadata optimisée pour SEO
- Structure propre et minimaliste

---

### 2. Composant Header
**Fichier**: `/Users/twe/Developer/Thierry/coworking-cafe/apps/site/src/components/layout/Header.tsx`

**Description**: Header sticky avec navigation responsive

**Fonctionnalités**:
- Logo cliquable vers la page d'accueil
- Navigation desktop avec dropdowns au hover
- Navigation mobile avec menu burger
- Détection de la page active (state active)
- Boutons CTA (Contact et Réserver)
- Menu mobile avec overlay et fermeture automatique

**Architecture**:
- Menu items extraits dans une constante `menuItems[]`
- Composant local `Navbar` pour la navigation
- Gestion des états: `isMobileMenuOpen`, `activeDropdown`
- Détection automatique du pathname actif

**Nommage BEM**:
```scss
.header
.header__container
.header__content
.header__logo
.header__logo-image
.header__nav
.header__nav--active
.header__nav-list
.header__nav-item
.header__nav-item--has-dropdown
.header__nav-item--mobile-only
.header__nav-link
.header__nav-link--active
.header__nav-dropdown
.header__nav-dropdown--active
.header__nav-dropdown-item
.header__nav-dropdown-link
.header__overlay
.header__actions
.header__action
.header__action--desktop-only
.header__cta
.header__cta--desktop-only
.header__burger
```

---

### 3. Composant Footer
**Fichier**: `/Users/twe/Developer/Thierry/coworking-cafe/apps/site/src/components/layout/Footer.tsx`

**Description**: Footer avec informations de contact, liens et réseaux sociaux

**Fonctionnalités**:
- Logo et réseaux sociaux
- Informations de contact (adresse, téléphone, email, horaires)
- Liens rapides de navigation
- Liens légaux (CGU, mentions légales, confidentialité)
- Copyright dynamique avec année courante

**Architecture**:
- Data extraite dans des constantes:
  - `footerSections[]` - Sections avec liens
  - `socialLinks[]` - Réseaux sociaux
  - `contactInfo{}` - Informations de contact
- Composants locaux pour chaque section:
  - `FooterLogo`
  - `FooterContact`
  - `FooterLinks`
  - `FooterCopyright`

**Nommage BEM**:
```scss
.footer
.footer__container
.footer__brand
.footer__logo
.footer__logo-image
.footer__social
.footer__social-item
.footer__social-link
.footer__divider
.footer__content
.footer__section
.footer__section-title
.footer__section-title--spacing
.footer__contact
.footer__contact-address
.footer__contact-list
.footer__contact-item
.footer__contact-icon
.footer__contact-link
.footer__contact-text
.footer__links
.footer__links-item
.footer__links-link
.footer__bottom
.footer__copyright
.footer__copyright-link
```

---

### 4. Styles Header
**Fichier**: `/Users/twe/Developer/Thierry/coworking-cafe/apps/site/src/components/layout/Header.scss`

**Description**: Styles BEM pour le Header

**Caractéristiques**:
- Mobile-first responsive design
- Sticky positioning avec z-index approprié
- Transitions fluides pour les animations
- Dropdown menu avec hover (desktop) et toggle (mobile)
- Navigation mobile slide-in depuis la gauche
- Overlay semi-transparent pour fermer le menu mobile
- Support des états actifs avec indicateur visuel

**Breakpoints**:
- Desktop: >= 1200px
- Mobile: < 1200px

---

### 5. Styles Footer
**Fichier**: `/Users/twe/Developer/Thierry/coworking-cafe/apps/site/src/components/layout/Footer.scss`

**Description**: Styles BEM pour le Footer

**Caractéristiques**:
- Grid layout responsive pour les sections
- Social links avec effets hover
- Liens avec transitions douces
- Typography cohérente
- Dividers pour séparer les sections

**Breakpoints**:
- Desktop: >= 992px
- Tablet: 768px - 991px
- Mobile: < 768px

---

### 6. Layout Styles Global
**Fichier**: `/Users/twe/Developer/Thierry/coworking-cafe/apps/site/src/app/(site)/layout.scss`

**Description**: Point d'entrée pour tous les styles du site

**Contenu**:
- Import de Bootstrap CSS
- Variables CSS globales (couleurs, spacing, shadows, transitions)
- Reset CSS de base
- Typography styles
- Utilities classes
- Scrollbar styling
- Print styles

**Variables CSS**:
```css
--body-clr: #142220
--main-clr: #417972
--btn-clr: #f2d381
--primary-clr: #ffffff
--secondary-clr: #1a1a1a
--grayBlack-clr: #051f0d
--gry-clr: #6e6f75
--grayWhite-clr: #e3ece7
--pra-clr: #e3ece7ab
```

---

### 7. Composant ScrollToTop
**Fichier**: `/Users/twe/Developer/Thierry/coworking-cafe/apps/site/src/components/ui/ScrollToTop.tsx`

**Description**: Bouton pour remonter en haut de page

**Fonctionnalités**:
- Apparaît après 400px de scroll
- Smooth scroll vers le haut
- Debounced scroll listener pour performance
- Animations fluides d'apparition/disparition
- Hidden sur desktop (>= 992px) - optionnel

**Performance**:
- Event listener avec debounce (100ms)
- Passive scroll listener
- Cleanup approprié au unmount

---

### 8. Styles ScrollToTop
**Fichier**: `/Users/twe/Developer/Thierry/coworking-cafe/apps/site/src/components/ui/ScrollToTop.scss`

**Description**: Styles pour le bouton scroll to top

**Caractéristiques**:
- Position fixed bottom-right
- Cercle avec icône centrée
- Animations smooth d'apparition
- Effets hover avec elevation
- Focus state pour accessibilité

---

## Assets Copiés

Les assets suivants ont été copiés depuis le projet original:

### Images
- `/public/images/logo-black.svg` - Logo noir pour le header
- `/public/images/logo-circle-white.png` - Logo blanc circulaire pour le footer

### Icons
- `/public/icons/arrow-up-right.svg` - Icône pour les boutons CTA
- `/public/icons/Frame5.svg` - Icône email
- `/public/icons/Frame6.svg` - Icône téléphone
- `/public/icons/Frame7.svg` - Icône horaires
- `/public/icons/Frame_20.svg` - Icône supplémentaire

---

## Conventions Suivies

### 1. Nommage BEM Strict

**Structure**:
```
.block
.block__element
.block__element-subelement
.block__element--modifier
```

**États**:
```
.block__element.is-active
.block__element.is-disabled
```

### 2. Architecture des Composants

**Phase 1 - Monolithique**:
- Tout le code dans un seul fichier
- Types définis en haut
- Data en constantes
- Composants locaux pour sous-parties
- Composant principal à la fin

**Structure type**:
```tsx
// ============================================
// TYPES
// ============================================
interface Props { }

// ============================================
// DATA
// ============================================
const data = []

// ============================================
// COMPOSANTS LOCAUX
// ============================================
function SubComponent() { }

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
export default function MainComponent() { }
```

### 3. TypeScript

- Pas de `any`
- Types explicites sur toutes les interfaces
- Props typées avec `interface`
- Types pour les data structures

### 4. Code Propre

- Fichiers < 200 lignes (Header: 195 lignes, Footer: 188 lignes)
- Fonctions < 50 lignes
- Noms explicites et descriptifs
- Extraction des données dans des constantes
- Commentaires pour les sections principales

### 5. SCSS

- Mobile-first responsive
- Variables CSS pour les couleurs et spacing
- Transitions fluides (0.3s ease)
- Nesting BEM approprié
- Commentaires pour les sections

---

## Différences avec l'Original

### Header

**Avant** (bt-coworkingcafe):
- Mélange de classes BEM et non-BEM
- TopHeader conditionnel (supprimé dans la refacto)
- Menu user avec session (pas inclus dans cette refacto car focus site public)
- Data importée depuis `/db/menuData.ts`

**Après** (coworking-cafe):
- BEM strict partout
- Menu items dans une constante locale
- Focus sur le site public uniquement
- Code simplifié et épuré
- Meilleure séparation des responsabilités

### Footer

**Avant** (bt-coworkingcafe):
- Logique complexe pour détecter les pages (booking, client dashboard)
- Components Helper et BookingHelper inclus
- Classes BEM partielles

**Après** (coworking-cafe):
- Footer simple et focalisé sur le site public
- BEM complet
- Composants locaux bien séparés
- Data extraite et organisée

---

## Points d'Attention

### 1. Dépendances Manquantes

Le projet nécessite l'installation de:
- `bootstrap` - Pour les styles Bootstrap
- `bootstrap-icons` - Pour les icônes (ou CDN)
- `@fortawesome/fontawesome-free` - Pour Font Awesome (ou CDN)

**Installation**:
```bash
cd apps/site
npm install bootstrap
npm install bootstrap-icons
```

**Alternative CDN**: Ajouter dans le root layout ou dans le HTML:
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
```

### 2. Paths des Images

Tous les paths d'images utilisent `/images/` et `/icons/` à la racine du public.
Vérifier que la structure est correcte:
```
apps/site/public/
├── images/
│   ├── logo-black.svg
│   └── logo-circle-white.png
└── icons/
    ├── arrow-up-right.svg
    ├── Frame5.svg
    ├── Frame6.svg
    └── Frame7.svg
```

### 3. ScrollToTop Integration

Le composant `ScrollToTop` n'est pas encore intégré dans le layout.

**Pour l'ajouter**:
```tsx
// Dans apps/site/src/app/(site)/layout.tsx
import ScrollToTop from "@/components/ui/ScrollToTop"

export default function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <ScrollToTop />
    </>
  )
}
```

### 4. Variables CSS

Les variables CSS sont définies dans `layout.scss` mais correspondent aux couleurs de l'original.
Si vous avez un design system différent, ajustez les valeurs.

### 5. Responsive Breakpoints

Breakpoints utilisés:
- 576px (sm)
- 768px (md)
- 992px (lg)
- 1200px (xl)
- 1400px (xxl)

Correspondent aux breakpoints Bootstrap par défaut.

---

## Tests Recommandés

### 1. Navigation

- [ ] Le logo redirige vers la page d'accueil
- [ ] Les liens de navigation fonctionnent
- [ ] Les dropdowns s'ouvrent au hover (desktop)
- [ ] Les dropdowns se togglent au clic (mobile)
- [ ] L'état actif est bien détecté et affiché
- [ ] Le menu mobile s'ouvre et se ferme correctement
- [ ] L'overlay ferme le menu mobile au clic

### 2. Header

- [ ] Le header est sticky au scroll
- [ ] Les boutons CTA sont visibles (desktop)
- [ ] Le burger menu est visible (mobile)
- [ ] Le menu mobile slide depuis la gauche
- [ ] Les transitions sont fluides

### 3. Footer

- [ ] Les liens fonctionnent tous
- [ ] Les liens sociaux sont corrects
- [ ] L'email et le téléphone sont cliquables
- [ ] Le copyright affiche l'année courante
- [ ] Le layout responsive fonctionne

### 4. Responsive

- [ ] Desktop (>= 1200px): Navigation horizontale, dropdowns hover
- [ ] Tablet (768px - 1199px): Menu burger, navigation mobile
- [ ] Mobile (< 768px): Layout adapté, touch-friendly

### 5. Accessibilité

- [ ] Les boutons ont des `aria-label`
- [ ] Les liens sociaux ont des labels descriptifs
- [ ] Le menu burger a `aria-expanded`
- [ ] Le focus est visible sur tous les éléments interactifs
- [ ] Navigation au clavier possible

---

## Instructions pour Tester

### 1. Installation

```bash
cd /Users/twe/Developer/Thierry/coworking-cafe/apps/site

# Installer les dépendances si pas déjà fait
npm install

# Installer Bootstrap et icons
npm install bootstrap bootstrap-icons
```

### 2. Lancer le serveur de développement

```bash
npm run dev
```

### 3. Ouvrir dans le navigateur

```
http://localhost:3000
```

### 4. Tester les fonctionnalités

- Naviguer entre les pages
- Tester le menu mobile (réduire la fenêtre)
- Tester les dropdowns
- Scroller pour voir le header sticky
- Cliquer sur les liens du footer

### 5. Vérifier le responsive

Utiliser les DevTools du navigateur:
- iPhone SE (375px)
- iPad (768px)
- Desktop (1920px)

---

## Prochaines Étapes

### 1. Intégration du ScrollToTop

Ajouter le composant dans le layout comme indiqué ci-dessus.

### 2. Créer les pages manquantes

Les liens du menu pointent vers des pages qui n'existent peut-être pas encore:
- `/concept`
- `/take-away`
- `/history`
- `/manifest`
- `/spaces`
- `/pricing`
- `/members-program`
- `/student-offers`
- `/boissons`
- `/blog`
- `/booking`
- `/contact`
- `/CGU`
- `/mentions-legales`
- `/confidentiality`

### 3. Ajouter l'authentification

Si nécessaire, réintégrer le menu utilisateur dans le Header:
- Session provider
- Dropdown user menu
- Liens vers dashboard

### 4. Optimiser les images

Remplacer les `<img>` par `<Image>` de Next.js pour:
- Lazy loading
- Optimisation automatique
- Responsive images

### 5. Tests E2E

Ajouter des tests avec Playwright ou Cypress pour:
- Navigation
- Menu mobile
- Responsive
- Accessibilité

---

## Conclusion

Refactorisation complète réussie avec:
- **7 fichiers créés** (4 TSX, 3 SCSS)
- **Convention BEM stricte** appliquée partout
- **Code propre** et maintenable
- **TypeScript** avec types explicites
- **Responsive** mobile-first
- **Accessibilité** prise en compte
- **Performance** optimisée (debounce, passive listeners)

Le code est prêt à être testé et intégré dans le monorepo.

---

**Fichiers créés**:
1. `/Users/twe/Developer/Thierry/coworking-cafe/apps/site/src/app/(site)/layout.tsx`
2. `/Users/twe/Developer/Thierry/coworking-cafe/apps/site/src/app/(site)/layout.scss`
3. `/Users/twe/Developer/Thierry/coworking-cafe/apps/site/src/components/layout/Header.tsx`
4. `/Users/twe/Developer/Thierry/coworking-cafe/apps/site/src/components/layout/Header.scss`
5. `/Users/twe/Developer/Thierry/coworking-cafe/apps/site/src/components/layout/Footer.tsx`
6. `/Users/twe/Developer/Thierry/coworking-cafe/apps/site/src/components/layout/Footer.scss`
7. `/Users/twe/Developer/Thierry/coworking-cafe/apps/site/src/components/ui/ScrollToTop.tsx`
8. `/Users/twe/Developer/Thierry/coworking-cafe/apps/site/src/components/ui/ScrollToTop.scss`

**Assets copiés**:
- 2 logos (SVG + PNG)
- 5 icônes (SVG)

---

*Rapport généré le 2026-01-13 par Claude Sonnet 4.5*
