# Structure des Fichiers Créés - Refactorisation Header/Footer/Layout

## Vue d'ensemble

```
coworking-cafe/
└── apps/
    └── site/
        ├── public/
        │   ├── images/
        │   │   ├── logo-black.svg              ← Logo header (copié)
        │   │   └── logo-circle-white.png       ← Logo footer (copié)
        │   └── icons/
        │       ├── arrow-up-right.svg          ← Icône CTA (copié)
        │       ├── Frame5.svg                  ← Icône email (copié)
        │       ├── Frame6.svg                  ← Icône téléphone (copié)
        │       └── Frame7.svg                  ← Icône horaires (copié)
        │
        └── src/
            ├── app/
            │   └── (site)/
            │       ├── layout.tsx              ← CRÉÉ: Layout principal du site
            │       └── layout.scss             ← CRÉÉ: Styles globaux + Bootstrap
            │
            └── components/
                ├── layout/
                │   ├── Header.tsx              ← CRÉÉ: Header avec navigation
                │   ├── Header.scss             ← CRÉÉ: Styles BEM Header
                │   ├── Footer.tsx              ← CRÉÉ: Footer avec infos/liens
                │   └── Footer.scss             ← CRÉÉ: Styles BEM Footer
                │
                └── ui/
                    ├── ScrollToTop.tsx         ← CRÉÉ: Bouton scroll to top
                    └── ScrollToTop.scss        ← CRÉÉ: Styles scroll button
```

## Détail des Composants

### 1. Layout Principal (`(site)/layout.tsx`)

```tsx
└── SiteLayout
    ├── <Header />
    ├── {children}          // Pages du site
    └── <Footer />
    // + <ScrollToTop /> à ajouter
```

---

### 2. Header (`layout/Header.tsx`)

```tsx
└── Header
    ├── .header__container
    │   └── .header__content
    │       ├── Logo (.header__logo)
    │       ├── Navbar (.header__nav)
    │       │   ├── Menu Items
    │       │   │   ├── Accueil
    │       │   │   ├── Concept (dropdown)
    │       │   │   ├── Espaces
    │       │   │   ├── Tarifs (dropdown)
    │       │   │   ├── Menu
    │       │   │   └── Le Mag'
    │       │   └── CTA Réserver (mobile)
    │       └── Actions (.header__actions)
    │           ├── Contact (desktop)
    │           ├── Réserver (desktop)
    │           └── Burger Menu (mobile)
    └── Overlay (mobile)
```

**Navigation Structure**:
```
Menu Items (menuItems[])
├── Accueil → /
├── Concept → /concept
│   ├── Working café → /concept
│   ├── Take Away → /take-away
│   ├── Notre histoire → /history
│   └── Manifeste → /manifest
├── Espaces → /spaces
├── Tarifs → /pricing
│   ├── Nos offres → /pricing
│   ├── Programme membre → /members-program
│   └── Offres étudiantes → /student-offers
├── Menu → /boissons
└── Le Mag' → /blog
```

---

### 3. Footer (`layout/Footer.tsx`)

```tsx
└── Footer
    ├── .footer__container
    │   ├── Brand (.footer__brand)
    │   │   ├── Logo
    │   │   └── Social Links
    │   │       ├── Facebook
    │   │       └── Instagram
    │   ├── Divider
    │   ├── Content (.footer__content)
    │   │   ├── Contact Section
    │   │   │   ├── Où nous trouver?
    │   │   │   │   └── Adresse
    │   │   │   └── Nous contacter
    │   │   │       ├── Email
    │   │   │       ├── Téléphone
    │   │   │       └── Horaires
    │   │   ├── Liens rapides
    │   │   │   ├── Réserver
    │   │   │   ├── Fonctionnement
    │   │   │   └── Tarifs
    │   │   └── À propos
    │   │       ├── CGU / CGV
    │   │       ├── Mentions légales
    │   │       └── Politique de confidentialité
    │   └── Bottom (.footer__bottom)
    │       ├── Divider
    │       └── Copyright
```

**Data Structure**:
```typescript
footerSections[]
├── Liens rapides
│   ├── Réserver → /booking
│   ├── Fonctionnement → /concept
│   └── Tarifs → /pricing
└── À propos
    ├── CGU / CGV → /CGU
    ├── Mentions légales → /mentions-legales
    └── Politique de confidentialité → /confidentiality

socialLinks[]
├── Facebook → https://facebook.com/coworkingcafe
└── Instagram → https://instagram.com/coworkingcafe

contactInfo{}
├── address
│   ├── street: "1 rue de la Division leclerc"
│   └── city: "67000 Strasbourg"
├── phone: "09 87 33 45 19"
├── email
│   ├── user: "strasbourg"
│   └── domain: "coworkingcafe.fr"
└── hours: "L-V: 09h-20h | S-D & JF: 10h-20h"
```

---

### 4. ScrollToTop (`ui/ScrollToTop.tsx`)

```tsx
└── ScrollToTop
    └── .scroll-to-top
        └── Icon (arrow-up)

Comportement:
├── Hidden par défaut
├── Visible après 400px de scroll
├── Smooth scroll au clic
└── Hidden sur desktop (>= 992px)
```

---

## Conventions BEM Appliquées

### Header

```scss
.header                                 // Block
├── .header__container                  // Element
├── .header__content                    // Element
├── .header__logo                       // Element
│   └── .header__logo-image            // Sub-element
├── .header__nav                        // Element
│   ├── .header__nav--active           // Modifier
│   ├── .header__nav-list              // Sub-element
│   ├── .header__nav-item              // Sub-element
│   │   ├── --has-dropdown             // Modifier
│   │   └── --mobile-only              // Modifier
│   ├── .header__nav-link              // Sub-element
│   │   └── --active                   // Modifier
│   ├── .header__nav-dropdown          // Sub-element
│   │   ├── --active                   // Modifier
│   │   ├── -item                      // Sub-sub-element
│   │   └── -link                      // Sub-sub-element
│   │       └── --active               // Modifier
├── .header__overlay                    // Element
├── .header__actions                    // Element
├── .header__action                     // Element
│   └── --desktop-only                 // Modifier
├── .header__cta                        // Element
│   └── --desktop-only                 // Modifier
└── .header__burger                     // Element
```

### Footer

```scss
.footer                                 // Block
├── .footer__container                  // Element
├── .footer__brand                      // Element
├── .footer__logo                       // Element
│   └── .footer__logo-image            // Sub-element
├── .footer__social                     // Element
│   ├── .footer__social-item           // Sub-element
│   └── .footer__social-link           // Sub-element
├── .footer__divider                    // Element
├── .footer__content                    // Element
├── .footer__section                    // Element
│   ├── .footer__section-title         // Sub-element
│   │   └── --spacing                  // Modifier
├── .footer__contact                    // Element
│   ├── .footer__contact-address       // Sub-element
│   ├── .footer__contact-list          // Sub-element
│   ├── .footer__contact-item          // Sub-element
│   ├── .footer__contact-icon          // Sub-element
│   ├── .footer__contact-link          // Sub-element
│   └── .footer__contact-text          // Sub-element
├── .footer__links                      // Element
│   ├── .footer__links-item            // Sub-element
│   └── .footer__links-link            // Sub-element
├── .footer__bottom                     // Element
├── .footer__copyright                  // Element
│   └── .footer__copyright-link        // Sub-element
```

---

## Responsive Breakpoints

```
Mobile First Approach:

Base (< 576px)      → Mobile
576px (sm)          → Small devices
768px (md)          → Tablets
992px (lg)          → Small desktops
1200px (xl)         → Large desktops
1400px (xxl)        → Extra large

Header:
├── < 1200px:  Menu mobile (burger)
└── >= 1200px: Navigation horizontale

Footer:
├── < 768px:   1 colonne
├── 768-991px: 2 colonnes
└── >= 992px:  Grid auto-fit

ScrollToTop:
├── < 992px:   Visible
└── >= 992px:  Hidden (optionnel)
```

---

## Variables CSS Utilisées

```css
/* Couleurs */
--main-clr: #417972           → Vert principal
--btn-clr: #f2d381            → Jaune/Or pour boutons
--secondary-clr: #1a1a1a      → Noir/Gris foncé
--primary-clr: #ffffff        → Blanc
--grayWhite-clr: #e3ece7      → Gris clair
--pra-clr: #e3ece7ab          → Gris semi-transparent

/* Spacing */
--spacing-xs: 0.5rem
--spacing-sm: 1rem
--spacing-md: 1.5rem
--spacing-lg: 2rem
--spacing-xl: 3rem

/* Shadows */
--shadow-sm: 0 2px 4px rgba(0,0,0,0.1)
--shadow-md: 0 4px 12px rgba(0,0,0,0.1)
--shadow-lg: 0 8px 24px rgba(0,0,0,0.15)

/* Transitions */
--transition-base: 0.3s ease
```

---

## Metrics

### Fichiers

| Type | Nombre | Total Lignes |
|------|--------|--------------|
| TSX  | 4      | ~800 lignes  |
| SCSS | 3      | ~700 lignes  |
| MD   | 2      | ~600 lignes  |

### Composants

| Composant    | Lignes | État   | Fonctions | Data |
|--------------|--------|--------|-----------|------|
| Header       | 195    | 2      | 4         | 1    |
| Footer       | 188    | 0      | 5         | 3    |
| ScrollToTop  | 52     | 1      | 1         | 1    |

### Complexité

- **Header**: Moyenne (navigation + dropdowns + responsive)
- **Footer**: Simple (structure statique + data)
- **ScrollToTop**: Simple (scroll detection + animation)

---

## Checklist Qualité

### Code Propre ✅
- [x] Fichiers < 200 lignes
- [x] Fonctions < 50 lignes
- [x] Noms explicites
- [x] Commentaires pertinents
- [x] Pas de duplication

### TypeScript ✅
- [x] Pas de `any`
- [x] Interfaces pour tous les props
- [x] Types explicites
- [x] Types pour les data

### BEM ✅
- [x] Nommage strict
- [x] Pas de nesting profond
- [x] Modificateurs cohérents
- [x] États explicites

### Responsive ✅
- [x] Mobile-first
- [x] Breakpoints appropriés
- [x] Touch-friendly
- [x] Layout adaptatif

### Accessibilité ✅
- [x] Labels sur boutons
- [x] ARIA attributes
- [x] Focus visible
- [x] Navigation clavier

### Performance ✅
- [x] Debounced listeners
- [x] Passive listeners
- [x] Transitions GPU
- [x] Cleanup au unmount

---

*Structure générée le 2026-01-13*
